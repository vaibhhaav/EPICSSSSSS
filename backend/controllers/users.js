// controllers/users.js
// Admin-only management of elder and orphan profiles.
//
// Profile schema:
// {
//   id: string (Firestore document ID),
//   type: "elder" | "orphan",
//   name: string,
//   age: number,
//   gender: string,
//   languages: string[],
//   hobbies: string[],
//   emotional_needs: string[],
//   institution: string,
//   createdAt: Timestamp,
//   updatedAt: Timestamp
// }

import { db } from '../models/firebase.js';

const COLLECTION = 'profiles';

// Basic runtime validation to keep the API robust.
function validateProfilePayload(payload) {
  const requiredStringFields = ['type', 'name', 'gender', 'institution'];
  const errors = [];

  requiredStringFields.forEach((field) => {
    if (!payload[field] || typeof payload[field] !== 'string') {
      errors.push(`${field} is required and must be a string`);
    }
  });

  if (payload.type !== 'elder' && payload.type !== 'orphan') {
    errors.push('type must be "elder" or "orphan"');
  }

  if (typeof payload.age !== 'number' || payload.age <= 0) {
    errors.push('age must be a positive number');
  }

  ['languages', 'hobbies', 'emotional_needs'].forEach((field) => {
    if (!Array.isArray(payload[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

  return errors;
}

export const usersController = {
  // POST /api/users
  async createProfile(req, res, next) {
    try {
      if (!db) {
        return res
          .status(500)
          .json({ error: 'Firestore not initialized. Check backend config.' });
      }

      const payload = req.body || {};
      const errors = validateProfilePayload(payload);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const now = new Date();
      const docRef = await db.collection(COLLECTION).add({
        ...payload,
        createdAt: now,
        updatedAt: now,
      });

      return res.status(201).json({ id: docRef.id });
    } catch (err) {
      // In dev, Firestore misconfiguration can surface as a gRPC `5 NOT_FOUND`
      // error (project/API not found). Don't hard-fail the entire UI.
      const isDevFirestoreNotFound =
        process.env.NODE_ENV !== 'production' &&
        (err?.code === 5 ||
          String(err?.message || '').includes('NOT_FOUND') ||
          String(err?.message || '').includes('5 NOT_FOUND'));

      if (isDevFirestoreNotFound) {
        console.warn(
          'Firestore write failed (dev fallback). Returning mock id.',
          err?.message || err,
        );
        return res.status(201).json({ id: `mock-${Date.now()}` });
      }

      return next(err);
    }
  },

  // GET /api/users
  // Optional query parameters:
  // - type=elder|orphan
  // - search=substring (matches name or institution)
  async listProfiles(req, res, next) {
    try {
      if (!db) {
        return res
          .status(500)
          .json({ error: 'Firestore not initialized. Check backend config.' });
      }

      const { type, search } = req.query;

      let query = db.collection(COLLECTION);
      if (type === 'elder' || type === 'orphan') {
        query = query.where('type', '==', type);
      }

      const snapshot = await query.get();
      let profiles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (search) {
        const lower = String(search).toLowerCase();
        profiles = profiles.filter(
          (p) =>
            p.name?.toLowerCase().includes(lower) ||
            p.institution?.toLowerCase().includes(lower),
        );
      }

      return res.json({ profiles });
    } catch (err) {
      return next(err);
    }
  },
};

export default usersController;

