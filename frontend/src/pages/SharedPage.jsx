import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { itineraryAPI } from '../services/api';
import {
  MapPin, Calendar, Clock, Compass, Plane, Hotel,
  ChevronDown, ChevronUp, Utensils, Camera, Star, Coffee
} from 'lucide-react';
import './SharedPage.css';

const ActivityIcon = ({ type }) => {
  const map = { travel: <Plane size={13} />, accommodation: <Hotel size={13} />,
    dining: <Utensils size={13} />, sightseeing: <Camera size={13} />,
    rest: <Coffee size={13} />, activity: <Star size={13} /> };
  return map[type] || <MapPin size={13} />;
};

const SharedPage = () => {
  const { token } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDays, setOpenDays] = useState({});

  useEffect(() => {
    itineraryAPI.getShared(token)
      .then(({ data }) => {
        setItinerary(data.itinerary);
        // Open first 2 days by default
        const initial = {};
        data.itinerary.days?.slice(0, 2).forEach((d) => { initial[d.dayNumber] = true; });
        setOpenDays(initial);
      })
      .catch(() => setError('This itinerary is not available or is no longer public.'))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleDay = (n) => setOpenDays((p) => ({ ...p, [n]: !p[n] }));

  if (loading) return (
    <div className="shared-loading">
      <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (error) return (
    <div className="shared-error">
      <Compass size={48} />
      <h2>Itinerary Not Found</h2>
      <p>{error}</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  return (
    <div className="shared-page">
      {/* ── Banner ────────────────────────────────────────────────────────────── */}
      <div className="shared-banner">
        <div className="banner-content">
          <div className="banner-brand">
            <Compass size={18} />
            <span>TripWise</span>
          </div>
          <h1>{itinerary.title}</h1>
          <div className="banner-meta">
            {itinerary.destination && <span><MapPin size={14} /> {itinerary.destination}</span>}
            {itinerary.startDate && (
              <span>
                <Calendar size={14} />
                {new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                {itinerary.endDate && ` – ${new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </span>
            )}
            {itinerary.totalDays && <span><Clock size={14} /> {itinerary.totalDays} days</span>}
          </div>
          {itinerary.summary && <p className="banner-summary">{itinerary.summary}</p>}
          {itinerary.user?.name && (
            <p className="shared-by">Shared by {itinerary.user.name}</p>
          )}
        </div>
      </div>

      <div className="shared-body">
        <div className="container">
          {/* ── Days ──────────────────────────────────────────────────────────── */}
          <div className="shared-days">
            {itinerary.days?.map((day) => (
              <div key={day.dayNumber} className="day-card fade-in">
                <div className="day-header" onClick={() => toggleDay(day.dayNumber)}>
                  <div className="day-meta">
                    <div className="day-number">Day {day.dayNumber}</div>
                    <div>
                      <span className="day-city">{day.city}{day.country ? `, ${day.country}` : ''}</span>
                      {day.date && <span className="day-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <button className="day-toggle">
                    {openDays[day.dayNumber] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {openDays[day.dayNumber] && (
                  <div className="day-body">
                    {day.activities?.map((a, i) => (
                      <div key={i} className={`activity-item activity-${a.type}`}>
                        <div className="activity-time">{a.time || '—'}</div>
                        <div className="activity-connector">
                          <div className="activity-dot"><ActivityIcon type={a.type} /></div>
                          {i < day.activities.length - 1 && <div className="activity-line" />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{a.title}</div>
                          {a.description && <p className="activity-desc">{a.description}</p>}
                          {a.location && <div className="activity-location"><MapPin size={12} /> {a.location}</div>}
                          {a.notes && <div className="activity-note">{a.notes}</div>}
                        </div>
                      </div>
                    ))}
                    {day.tips?.length > 0 && (
                      <div className="day-tips">
                        <span className="tips-label">💡 Local Tips</span>
                        <ul>{day.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── CTA ───────────────────────────────────────────────────────────── */}
          <div className="shared-cta">
            <Compass size={32} />
            <h3>Plan your own trip with TripWise</h3>
            <p>Upload your booking documents and get an AI-powered itinerary in seconds.</p>
            <Link to="/register" className="btn btn-primary">Get started free</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPage;
