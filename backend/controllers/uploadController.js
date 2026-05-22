const path = require('path');
const { extractFromDocument } = require('../utils/extractor');
const { processDocuments } = require('../utils/aiService');
const Itinerary = require('../models/Itinerary');

/**
 * POST /api/upload
 * Accepts 1–5 travel documents, extracts data, generates itinerary via AI.
 */
const uploadDocuments = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  const startTime = Date.now();

  // Build document metadata for DB
  const documentMeta = req.files.map((file) => ({
    originalName: file.originalname,
    storedName: file.key || file.filename,
    fileUrl:
      file.location || // S3
      `${process.env.BASE_URL}/uploads/${file.filename}`, // Local
    fileType: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
    mimeType: file.mimetype,
    size: file.size,
  }));

  // Create itinerary record in 'processing' state
  const itinerary = await Itinerary.create({
    user: req.user.id,
    title: 'Generating your itinerary…',
    destination: 'Processing…',
    documents: documentMeta,
    status: 'processing',
  });

  // Respond immediately so the client can poll
  res.status(202).json({
    message: 'Documents uploaded. Processing started.',
    itineraryId: itinerary._id,
  });

  // ── Background Processing ──────────────────────────────────────────────────
  try {
    // 1. Extract content from each document
    const extracted = await Promise.all(
      req.files.map((file) => extractFromDocument(file))
    );

    // 2. Process with AI
    const { extractedData, itinerary: aiItinerary, model } = await processDocuments(extracted);

    // 3. Save to DB
    const processingTime = Date.now() - startTime;

    await Itinerary.findByIdAndUpdate(itinerary._id, {
      title: aiItinerary.title || 'My Travel Itinerary',
      destination: aiItinerary.destination || 'Unknown',
      startDate: aiItinerary.startDate,
      endDate: aiItinerary.endDate,
      totalDays: aiItinerary.totalDays,
      summary: aiItinerary.summary,
      extractedData: {
        flights: extractedData.flights || [],
        hotels: extractedData.hotels || [],
        rawText: extracted.map((d) => d.type === 'text' ? d.content : '[image]').join('\n\n'),
      },
      days: aiItinerary.days || [],
      status: 'completed',
      aiModel: model,
      processingTime,
    });
  } catch (error) {
    console.error('AI processing error:', error);
    await Itinerary.findByIdAndUpdate(itinerary._id, {
      status: 'failed',
      errorMessage: error.message,
      title: 'Processing Failed',
    });
  }
};

module.exports = { uploadDocuments };
