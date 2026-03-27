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
<<<<<<< HEAD
const TYPE_COLLECTION_MAP = {
  elder: 'elders',
  orphan: 'orphans',
};

const ALLOWED_TYPES = new Set(['elder', 'orphan']);

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeProfilePayload(payload) {
  const type = payload.type || payload.institutionType || payload.role;
  const normalizedType = String(type || '').trim().toLowerCase();

  const language = payload.language;
  const languages = toStringArray(payload.languages);
  if (!languages.length && typeof language === 'string' && language.trim()) {
    languages.push(language.trim());
  }

  const hobbies = toStringArray(payload.hobbies || payload.interests);

  const emotionalNeeds = toStringArray(payload.emotional_needs);
  if (!emotionalNeeds.length && payload.emotionalState) {
    emotionalNeeds.push(String(payload.emotionalState).trim());
  }

  return {
    type: normalizedType,
    institutionType: normalizedType,
    role: normalizedType,
    name: String(payload.name || '').trim(),
    gender: String(payload.gender || 'unspecified').trim(),
    institution: String(payload.institution || 'unknown').trim(),
    age: Number(payload.age),
    languages,
    hobbies,
    emotional_needs: emotionalNeeds,
    personalityType: String(payload.personalityType || '').trim(),
    attachmentStyle: String(payload.attachmentStyle || '').trim(),
    communicationStyle: String(payload.communicationStyle || '').trim(),
    availability: String(payload.availability || '').trim(),
    traumaLevel: String(payload.traumaLevel || '').trim(),
    patienceLevel: String(payload.patienceLevel || '').trim(),
    healthCondition: String(payload.healthCondition || '').trim(),
  };
}

// Basic runtime validation to keep the API robust.
function validateProfilePayload(payload) {
  const errors = [];

  if (!ALLOWED_TYPES.has(payload.type)) {
    errors.push('type must be "elder" or "orphan"');
  }

  if (!payload.name) {
    errors.push('name is required');
  }
  if (!payload.gender) {
    errors.push('gender is required');
=======

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
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
  }

  if (typeof payload.age !== 'number' || payload.age <= 0) {
    errors.push('age must be a positive number');
  }

  ['languages', 'hobbies', 'emotional_needs'].forEach((field) => {
    if (!Array.isArray(payload[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

<<<<<<< HEAD
  if (Array.isArray(payload.hobbies) && payload.hobbies.length === 0) {
    errors.push('hobbies must contain at least one selected value');
  }

=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
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

<<<<<<< HEAD
      const payload = normalizeProfilePayload(req.body || {});
=======
      const payload = req.body || {};
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      const errors = validateProfilePayload(payload);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const now = new Date();
<<<<<<< HEAD
      const docData = {
        ...payload,
        createdAt: now,
        updatedAt: now,
      };

      // Always store in canonical `profiles` collection.
      const docRef = await db.collection(COLLECTION).add(docData);

      // Also mirror into type-specific collection for compatibility with existing views/checks.
      const typeCollection = TYPE_COLLECTION_MAP[payload.type];
      if (typeCollection) {
        await db.collection(typeCollection).doc(docRef.id).set(docData);
      }
=======
      const docRef = await db.collection(COLLECTION).add({
        ...payload,
        createdAt: now,
        updatedAt: now,
      });
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d

      return res.status(201).json({ id: docRef.id });
    } catch (err) {
      // In dev, Firestore misconfiguration can surface as a gRPC `5 NOT_FOUND`
<<<<<<< HEAD
      // error (project/API not found). Return a clear error so callers can fallback.
=======
      // error (project/API not found). Don't hard-fail the entire UI.
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      const isDevFirestoreNotFound =
        process.env.NODE_ENV !== 'production' &&
        (err?.code === 5 ||
          String(err?.message || '').includes('NOT_FOUND') ||
          String(err?.message || '').includes('5 NOT_FOUND'));

      if (isDevFirestoreNotFound) {
<<<<<<< HEAD
        console.error('Firestore write failed:', err?.message || err);
        return res.status(503).json({
          error:
            'Firestore write failed. Check Firebase project/service account configuration.',
          details: err?.message || String(err),
        });
=======
        console.warn(
          'Firestore write failed (dev fallback). Returning mock id.',
          err?.message || err,
        );
        return res.status(201).json({ id: `mock-${Date.now()}` });
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
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

