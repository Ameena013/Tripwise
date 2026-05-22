TripWise — AI-Powered Travel Itinerary Generator

TripWise is a full-stack MERN application that helps travelers turn messy booking documents into a clean, organized travel itinerary within seconds. Users can upload flight tickets, hotel confirmations, or travel PDFs, and the app automatically generates a detailed day-by-day itinerary using AI.

The goal of the project is to make travel planning easier by bringing all travel information into one simple and shareable experience.

✨ What TripWise Can Do

Secure user registration and login with JWT authentication
Upload travel documents like flight tickets, hotel bookings, and travel confirmations
Extract important travel details automatically using AI
Generate a personalized itinerary with daily plans, activities, and travel summaries
Save itinerary history for future access
Share itineraries publicly using a shareable link
Support both local file storage and AWS S3 uploads
Handle asynchronous processing smoothly for a better user experience

🛠 Tech Stack

Layer	Technology
Frontend	React 18, React Router v6, React Dropzone, React Hot Toast
Backend	Node.js, Express.js
Database	MongoDB with Mongoose
Authentication	JWT + bcryptjs
AI Integration	Google Gemini 1.5 Flash / OpenAI GPT-4o
File Uploads	Multer + AWS S3
PDF Parsing	pdf-parse

📁 Project Structure

tripwise/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── index.js
    └── package.json
🚀 Getting Started
Prerequisites

Before running the project, make sure you have:

Node.js installed
MongoDB Atlas or local MongoDB setup
Gemini API key or OpenAI API key
1. Clone the Repository
git clone <your-repository-url>
cd tripwise
2. Install Dependencies
Backend
cd backend
npm install
Frontend
cd ../frontend
npm install
3. Configure Environment Variables

Inside the backend folder, create a .env file.

Example:

PORT=5001
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:3001
BASE_URL=http://localhost:5001

STORAGE_MODE=local
4. Start the Application
Run Backend
cd backend
npm run dev
Run Frontend
cd frontend
npm start

Frontend will run on:

http://localhost:3001

Backend will run on:

http://localhost:5001
🔐 Authentication APIs
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get logged-in user
📤 Upload API
Method	Endpoint	Description
POST	/api/upload	Upload travel documents
📅 Itinerary APIs
Method	Endpoint	Description
GET	/api/itineraries	Get all itineraries
GET	/api/itineraries/:id	Get single itinerary
DELETE	/api/itineraries/:id	Delete itinerary
PATCH	/api/itineraries/:id/share	Share itinerary
GET	/api/itineraries/shared/:token	Access public itinerary
🤖 AI Workflow
User uploads travel-related documents
PDFs/images are processed and text is extracted
AI analyzes the extracted information
Important travel details like flights and hotels are identified
A complete itinerary is generated automatically
The itinerary is saved and displayed to the user
🌍 Deployment
Backend Deployment

You can deploy the backend on:

Render
Railway
Fly.io

Make sure to:

Add all environment variables
Connect MongoDB Atlas
Configure AWS S3 if needed
Frontend Deployment

Frontend can be deployed on:

Vercel
Netlify

Build command:

npm run build
📌 Future Improvements
Google Maps integration
Real-time flight tracking
Budget estimation
Multi-language itinerary support
Calendar sync
Mobile responsive improvements


Developed as a MERN + AI project focused on simplifying travel planning using modern web technologies and AI automation.
