// controllers/matches.js
// Handles ML-based profile matching between a single elder and multiple orphans.
//
// Delegates heavy lifting to the Python ML microservice.
//
// POST /api/matches
// Body:
// {
//   elder_id: string,
//   orphan_ids: string[]
// }
// Response:
// {
//   matches: [{ orphan_id, score }],
//   raw: any // raw ML service payload (for debugging/auditing)
// }

import axios from 'axios';
import { db } from '../models/firebase.js';

const PROFILES_COLLECTION = 'profiles';
const CONNECTIONS_COLLECTION = 'connections';

function jaccardSimilarity(a, b) {
  const setA = new Set(Array.isArray(a) ? a.filter(Boolean) : []);
  const setB = new Set(Array.isArray(b) ? b.filter(Boolean) : []);
  if (setA.size === 0 && setB.size === 0) return 0.0;
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0.0;
}

function computeFallbackCompatibility(elder, orphan) {
  // Fallback scoring (0..1) based on profile overlap signals.
  // Maps to: interest similarity, personality match, emotional compatibility, availability overlap.
  const interestSimilarity = jaccardSimilarity(elder?.hobbies, orphan?.hobbies);
  const personalityMatch = jaccardSimilarity(
    elder?.emotional_needs,
    orphan?.emotional_needs,
  );
  const emotionalCompatibility = jaccardSimilarity(
    elder?.languages,
    orphan?.languages,
  );

  // Availability fields are optional in this codebase; treat missing as 0 overlap.
  const availabilityA =
    elder?.availability || elder?.availability_slots || elder?.availabilitySlots || [];
  const availabilityB =
    orphan?.availability || orphan?.availability_slots || orphan?.availabilitySlots || [];
  const availabilityOverlap = jaccardSimilarity(availabilityA, availabilityB);

  // Weighted sum, normalized to [0..1].
  return (
    0.25 * interestSimilarity +
    0.25 * personalityMatch +
    0.25 * emotionalCompatibility +
    0.25 * availabilityOverlap
  );
}

async function isMlServiceAvailable(mlBaseUrl) {
  try {
    await axios.get(`${mlBaseUrl}/health`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

export const matchesController = {
  async getMatches(req, res, next) {
    try {
      if (!db) {
        return res
          .status(500)
          .json({ error: 'Firestore not initialized. Check backend config.' });
      }

      const { elder_id: elderId, orphan_ids: orphanIds } = req.body || {};

      if (!elderId || !Array.isArray(orphanIds) || orphanIds.length === 0) {
        return res.status(400).json({
          error: 'elder_id and non-empty orphan_ids[] are required',
        });
      }

      // Load elder profile
      const elderDoc = await db.collection(PROFILES_COLLECTION).doc(elderId).get();
      if (!elderDoc.exists) {
        return res.status(404).json({ error: 'Elder profile not found' });
      }

      // Load orphan profiles
      const orphanSnapshots = await Promise.all(
        orphanIds.map((id) =>
          db.collection(PROFILES_COLLECTION).doc(id).get(),
        ),
      );

      const orphanProfiles = orphanSnapshots
        .filter((doc) => doc.exists)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      if (orphanProfiles.length === 0) {
        return res
          .status(404)
          .json({ error: 'No orphan profiles found for given IDs' });
      }

      const mlBaseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

      const mlResponse = await axios.post(`${mlBaseUrl}/match-profiles`, {
        elder_profile: { id: elderDoc.id, ...elderDoc.data() },
        orphan_profiles: orphanProfiles,
      });

      const { matches } = mlResponse.data || {};

      return res.json({
        matches: matches || [],
        raw: mlResponse.data,
      });
    } catch (err) {
      // If ML service is down or unreachable, return a graceful error
      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
        err.status = 503;
        err.message =
          'ML service is unavailable. Please try again later or contact support.';
      }
      return next(err);
    }
  },
  async autoMatchAll(req, res, next) {
    try {
      if (!db) {
        return res
          .status(500)
          .json({ error: 'Firestore not initialized. Check backend config.' });
      }

      const mlBaseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

      const [elderSnapshot, orphanSnapshot] = await Promise.all([
        db.collection(PROFILES_COLLECTION).where('type', '==', 'elder').get(),
        db.collection(PROFILES_COLLECTION).where('type', '==', 'orphan').get(),
      ]);

      const elders = elderSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const orphans = orphanSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (elders.length === 0) {
        return res.status(404).json({ error: 'No elder profiles found.' });
      }
      if (orphans.length === 0) {
        return res.status(404).json({ error: 'No orphan profiles found.' });
      }

      // Load active existing connections to avoid re-creating duplicates.
      const existingPairs = new Set();
      const existingConnectionsSnapshot = await db
        .collection(CONNECTIONS_COLLECTION)
        .where('status', '==', 'active')
        .get();

      existingConnectionsSnapshot.docs.forEach((doc) => {
        const d = doc.data() || {};
        const elderId = d.elderId || d.elder_id;
        const orphanId = d.orphanId || d.orphan_id;
        if (elderId && orphanId) existingPairs.add(`${elderId}|${orphanId}`);
      });

      let mlAvailable = false;
      if (mlBaseUrl) {
        mlAvailable = await isMlServiceAvailable(mlBaseUrl);
      }

      const matchedOrphans = new Set();
      const createdMatches = [];

      for (const elder of elders) {
        // Only consider orphans not already matched in this run (and not already connected).
        const remainingOrphans = orphans.filter((o) => {
          if (matchedOrphans.has(o.id)) return false;
          const key = `${elder.id}|${o.id}`;
          return !existingPairs.has(key);
        });

        if (remainingOrphans.length === 0) continue;

        let bestOrphan = null;
        let bestScore = -Infinity;

        if (mlAvailable) {
          // One ML call per elder (scores all remaining orphans in a batch).
          const mlResponse = await axios.post(`${mlBaseUrl}/match-profiles`, {
            elder_profile: { id: elder.id, ...elder },
            orphan_profiles: remainingOrphans,
          });

          const { matches } = mlResponse.data || {};
          const top = Array.isArray(matches) ? matches : [];

          for (const m of top) {
            const orphanId = m.orphan_id || m.orphanId;
            const score = Number(m.score);
            if (!orphanId || Number.isNaN(score)) continue;

            // remainingOrphans already filters, but keep the guard for safety.
            const orphan = remainingOrphans.find((o) => o.id === orphanId);
            if (!orphan) continue;

            if (score > bestScore) {
              bestScore = score;
              bestOrphan = orphan;
            }
          }

          // If ML returned no usable matches, fall back for this elder.
          if (!bestOrphan) {
            for (const orphan of remainingOrphans) {
              const score = computeFallbackCompatibility(elder, orphan);
              if (score > bestScore) {
                bestScore = score;
                bestOrphan = orphan;
              }
            }
          }
        } else {
          // Fallback scoring when ML service is unavailable/unreachable.
          for (const orphan of remainingOrphans) {
            const score = computeFallbackCompatibility(elder, orphan);
            if (score > bestScore) {
              bestScore = score;
              bestOrphan = orphan;
            }
          }
        }

        if (!bestOrphan) continue;

        const now = new Date();
        const docRef = await db.collection(CONNECTIONS_COLLECTION).add({
          orphanId: bestOrphan.id,
          elderId: elder.id,
          compatibilityScore: bestScore,
          status: 'active',
          createdAt: now,
        });

        existingPairs.add(`${elder.id}|${bestOrphan.id}`);
        matchedOrphans.add(bestOrphan.id);

        createdMatches.push({
          id: docRef.id,
          orphanId: bestOrphan.id,
          elderId: elder.id,
          elderName: elder.name || elder.fullName || `Elder #${elder.id}`,
          orphanName: bestOrphan.name || bestOrphan.fullName || `Orphan #${bestOrphan.id}`,
          compatibilityScore: bestScore,
          status: 'active',
          createdAt: now,
        });
      }

      return res.json({
        matches: createdMatches,
        createdCount: createdMatches.length,
      });
    } catch (err) {
      return next(err);
    }
  },
};

export default matchesController;

