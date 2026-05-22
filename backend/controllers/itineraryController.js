const Itinerary = require('../models/Itinerary');

// ─── GET /api/itineraries ──────────────────────────────────────────────────────
const getMyItineraries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [itineraries, total] = await Promise.all([
      Itinerary.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extractedData.rawText -days.activities.description'), // Lighter list view
      Itinerary.countDocuments({ user: req.user.id }),
    ]);

    res.json({
      itineraries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries.' });
  }
};

// ─── GET /api/itineraries/:id ──────────────────────────────────────────────────
const getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ itinerary });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary.' });
  }
};

// ─── GET /api/itineraries/:id/status (polling endpoint) ───────────────────────
const getStatus = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).select('status title destination errorMessage');

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ status: itinerary.status, title: itinerary.title, errorMessage: itinerary.errorMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status.' });
  }
};

// ─── DELETE /api/itineraries/:id ──────────────────────────────────────────────
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    res.json({ message: 'Itinerary deleted successfully.' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ error: 'Failed to delete itinerary.' });
  }
};

// ─── PATCH /api/itineraries/:id/share ─────────────────────────────────────────
const toggleShare = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }

    itinerary.isPublic = !itinerary.isPublic;
    await itinerary.save();

    const shareUrl = itinerary.isPublic
      ? `${process.env.FRONTEND_URL}/share/${itinerary.shareToken}`
      : null;

    res.json({
      isPublic: itinerary.isPublic,
      shareToken: itinerary.shareToken,
      shareUrl,
    });
  } catch (error) {
    console.error('Share toggle error:', error);
    res.status(500).json({ error: 'Failed to update sharing settings.' });
  }
};

// ─── GET /api/itineraries/shared/:token (public, no auth) ─────────────────────
const getSharedItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      shareToken: req.params.token,
      isPublic: true,
      status: 'completed',
    }).populate('user', 'name');

    if (!itinerary) {
      return res.status(404).json({ error: 'Shared itinerary not found or no longer public.' });
    }

    res.json({ itinerary });
  } catch (error) {
    console.error('Shared itinerary error:', error);
    res.status(500).json({ error: 'Failed to fetch shared itinerary.' });
  }
};

module.exports = {
  getMyItineraries,
  getItinerary,
  getStatus,
  deleteItinerary,
  toggleShare,
  getSharedItinerary,
};
