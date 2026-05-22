const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─────────────────────────────────────────────────────────────

const cleanJsonText = (text) => {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
};

// ─────────────────────────────────────────────────────────────

const safeJsonParse = (text) => {
  try {
    const cleaned = cleanJsonText(text);

    // extract json object safely
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error('No JSON found');
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error('JSON PARSE ERROR:', error);

    return null;
  }
};

// ─────────────────────────────────────────────────────────────

const createFallbackItinerary = (rawText = '') => {
  return {
    title: 'Travel Itinerary',
    destination: 'Planned Destination',
    startDate: null,
    endDate: null,
    totalDays: 1,
    summary:
      rawText?.substring(0, 200) ||
      'AI could not fully generate itinerary.',
    days: [
      {
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        city: 'Destination',
        country: '',
        activities: [
          {
            time: '09:00',
            title: 'Travel Day',
            description: 'Travel itinerary processing started.',
            location: '',
            type: 'travel',
            notes: '',
            duration: '1 hour',
          },
        ],
        tips: ['Check your booking details carefully'],
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────

const processWithGemini = async (documents) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key missing');
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // combine extracted document text
    let combinedText = '';

    for (const doc of documents) {
      if (doc.type === 'text') {
        combinedText += '\n\n' + doc.content;
      }

      if (doc.type === 'image') {
        combinedText += '\n\nTravel booking image uploaded.';
      }
    }

    if (!combinedText.trim()) {
      combinedText =
        'Travel booking information could not be extracted.';
    }

    console.log('COMBINED TEXT:');
    console.log(combinedText);

    // IMPORTANT: SIMPLE PROMPT WORKS BEST
    const prompt = `
You are an AI travel planner.

Read the travel booking information below and generate a COMPLETE travel itinerary.

Travel Information:
${combinedText}

IMPORTANT RULES:
- Return ONLY VALID JSON
- Do NOT use markdown
- Do NOT use triple backticks
- Always include "days" array
- Always include at least 1 activity

JSON FORMAT:

{
  "title": "Trip Title",
  "destination": "Destination Name",
  "startDate": "2026-05-22",
  "endDate": "2026-05-25",
  "totalDays": 4,
  "summary": "Short travel summary",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-05-22",
      "city": "City Name",
      "country": "Country Name",
      "activities": [
        {
          "time": "09:00",
          "title": "Airport Arrival",
          "description": "Arrive at airport and transfer hotel",
          "location": "Airport",
          "type": "travel",
          "notes": "Carry passport",
          "duration": "2 hours"
        }
      ],
      "tips": [
        "Keep passport safe"
      ]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const text = response.text();

    console.log('RAW GEMINI RESPONSE:');
    console.log(text);

    // parse safely
    let itinerary = safeJsonParse(text);

    // fallback if invalid
    if (!itinerary) {
      itinerary = createFallbackItinerary(combinedText);
    }

    // ensure days exists
    if (!Array.isArray(itinerary.days)) {
      itinerary.days = [];
    }

    // ensure summary exists
    if (!itinerary.summary) {
      itinerary.summary = 'Travel itinerary generated.';
    }

    // ensure title exists
    if (!itinerary.title) {
      itinerary.title = 'Travel Itinerary';
    }

    // ensure destination exists
    if (!itinerary.destination) {
      itinerary.destination = 'Destination';
    }

    return {
      extractedData: {
        flights: [],
        hotels: [],
        rawText: combinedText,
      },
      itinerary,
      model: 'gemini-1.5-flash',
    };
  } catch (error) {
    console.error('FULL GEMINI ERROR:', error);

    return {
      extractedData: {
        flights: [],
        hotels: [],
        rawText: '',
      },
      itinerary: createFallbackItinerary(),
      model: 'gemini-error',
    };
  }
};

// ─────────────────────────────────────────────────────────────

const processDocuments = async (documents) => {
  try {
    return await processWithGemini(documents);
  } catch (error) {
    console.error('PROCESS DOCUMENT ERROR:', error);

    return {
      extractedData: {
        flights: [],
        hotels: [],
      },
      itinerary: createFallbackItinerary(),
      model: 'processing-error',
    };
  }
};

module.exports = {
  processDocuments,
};