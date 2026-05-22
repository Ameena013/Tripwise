# TripWise — AI-Powered Travel Itinerary Generator

A MERN + AI web application where users upload travel booking documents (flights, hotels, tickets) and automatically receive a beautiful, shareable day-by-day itinerary.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, react-dropzone, react-hot-toast |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Google Gemini 1.5 Flash (primary) / OpenAI GPT-4o (fallback) |
| File Storage | Local disk (default) or AWS S3 (optional) |
| PDF Parsing | pdf-parse |

---

## Project Structure

```
tripwise/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── multer.js          # File upload config (local + S3)
│   ├── controllers/
│   │   ├── authController.js  # Register / Login / Me
│   │   ├── uploadController.js# File upload + AI processing trigger
│   │   └── itineraryController.js # CRUD + share
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Itinerary.js       # Itinerary + sub-schemas
│   ├── routes/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── itinerary.js
│   ├── utils/
│   │   ├── extractor.js       # PDF & image content extraction
│   │   └── aiService.js       # Gemini / OpenAI integration
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/shared/
    │   │   ├── Navbar.jsx / .css
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx / Auth.css
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx / .css
    │   │   ├── UploadPage.jsx / .css
    │   │   ├── ItineraryPage.jsx / .css
    │   │   └── SharedPage.jsx / .css
    │   ├── services/
    │   │   └── api.js          # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css           # Design system + global styles
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key **or** OpenAI API key

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd tripwise

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tripwise
JWT_SECRET=your_strong_secret_here

# At least one AI key required:
GEMINI_API_KEY=your-gemini-key
# OPENAI_API_KEY=your-openai-key

FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000
STORAGE_MODE=local
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Open **http://localhost:3000**

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | ✓ | Upload 1–5 docs (multipart/form-data, field: `documents`) |

### Itineraries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/itineraries` | ✓ | List user's itineraries (paginated) |
| GET | `/api/itineraries/:id` | ✓ | Get full itinerary |
| GET | `/api/itineraries/:id/status` | ✓ | Poll processing status |
| DELETE | `/api/itineraries/:id` | ✓ | Delete itinerary |
| PATCH | `/api/itineraries/:id/share` | ✓ | Toggle public/private |
| GET | `/api/itineraries/shared/:token` | ✗ | View shared itinerary (public) |

---

## Features

- **JWT Authentication** — Register/Login with bcrypt password hashing
- **Drag-and-Drop Upload** — Up to 5 PDFs or images simultaneously
- **AI Document Parsing** — Extracts flights, hotels, dates from any booking document
- **AI Itinerary Generation** — Day-by-day plan with activities, tips, dining
- **Async Processing** — Upload returns immediately; frontend polls for completion
- **Itinerary History** — All past itineraries stored and browsable
- **Sharing** — Toggle public/private; copy shareable link
- **Public Share Page** — Beautifully rendered, no login required
- **AWS S3 Support** — Set `STORAGE_MODE=s3` in `.env`
- **Rate Limiting** — Protects all API routes

---

## Deployment

### Backend (Railway / Render / Fly.io)
1. Set all env vars from `.env.example` in the platform dashboard
2. Set `STORAGE_MODE=s3` and configure AWS credentials for file persistence
3. Use MongoDB Atlas for the database

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` or update the proxy in `package.json`
2. Build: `npm run build`

---

## Bonus Features Implemented
- ✅ Drag-and-drop file upload (react-dropzone)
- ✅ AWS S3 integration (toggle via env)
- ✅ Responsive UI across mobile/tablet/desktop
- ✅ Rate limiting & Helmet security headers
- ✅ Async processing with real-time polling
- ✅ Beautiful public share page with sign-up CTA
- ✅ Pagination on dashboard
- ✅ Processing state animations
