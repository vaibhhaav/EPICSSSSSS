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
};

export default matchesController;

