const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyItineraries,
  getItinerary,
  getStatus,
  deleteItinerary,
  toggleShare,
  getSharedItinerary,
} = require('../controllers/itineraryController');

const router = express.Router();

// ── Public routes (no auth needed) ───────────────────────────────────────────
router.get('/shared/:token', getSharedItinerary);

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(protect);

router.get('/', getMyItineraries);
router.get('/:id', getItinerary);
router.get('/:id/status', getStatus);
router.delete('/:id', deleteItinerary);
router.patch('/:id/share', toggleShare);

module.exports = router;
