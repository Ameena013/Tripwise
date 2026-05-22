const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const flightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  from: String,
  to: String,
  departureDate: String,
  departureTime: String,
  arrivalDate: String,
  arrivalTime: String,
  terminal: String,
  gate: String,
  seat: String,
  class: String,
  bookingRef: String,
  passengerName: String,
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  country: String,
  checkIn: String,
  checkOut: String,
  roomType: String,
  confirmationNumber: String,
  guestName: String,
  nights: Number,
  amenities: [String],
}, { _id: false });

const activitySchema = new mongoose.Schema({
  time: String,
  title: String,
  description: String,
  location: String,
  type: {
    type: String,
    enum: ['travel', 'accommodation', 'sightseeing', 'dining', 'activity', 'rest', 'other'],
    default: 'activity',
  },
  notes: String,
  duration: String,
}, { _id: false });

const daySchema = new mongoose.Schema({
  date: String,
  dayNumber: Number,
  city: String,
  country: String,
  weather: String,
  activities: [activitySchema],
  tips: [String],
}, { _id: false });

// ─── Main Itinerary Schema ────────────────────────────────────────────────────
const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: String,
    endDate: String,
    totalDays: Number,
    summary: String,

    // Extracted booking data
    extractedData: {
      flights: [flightSchema],
      hotels: [hotelSchema],
      rawText: String,
    },

    // AI-generated itinerary
    days: [daySchema],

    // Uploaded documents
    documents: [
      {
        originalName: String,
        storedName: String,
        fileUrl: String,
        fileType: String, // 'pdf' | 'image'
        mimeType: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Sharing
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => uuidv4(),
    },
    isPublic: {
      type: Boolean,
      default: false,
    },

    // Processing state
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: String,

    // AI metadata
    aiModel: String,
    processingTime: Number, // milliseconds
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ shareToken: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
