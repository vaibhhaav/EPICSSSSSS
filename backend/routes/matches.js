// routes/matches.js
// Match recommendation endpoints (admin-only, protected by JWT middleware).

import express from 'express';
import { matchesController } from '../controllers/matches.js';

const router = express.Router();

// POST /api/matches - request ML-based match recommendations
router.post('/', matchesController.getMatches);

export default router;

