import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { itineraryAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, Clock, Plane, Hotel, Share2, Copy, Trash2,
  CheckCircle, AlertCircle, ArrowLeft, Globe, Lock, ChevronDown, ChevronUp,
  Utensils, Camera, Star, Coffee
} from 'lucide-react';
import './ItineraryPage.css';

// ── Activity type icon ─────────────────────────────────────────────────────────
const ActivityIcon = ({ type }) => {
  const map = {
    travel: <Plane size={14} />,
    accommodation: <Hotel size={14} />,
    dining: <Utensils size={14} />,
    sightseeing: <Camera size={14} />,
    rest: <Coffee size={14} />,
    activity: <Star size={14} />,
  };
  return map[type] || <MapPin size={14} />;
};

// ── Processing state ───────────────────────────────────────────────────────────
const ProcessingView = ({ itineraryId }) => (
  <div className="processing-view fade-in">
    <div className="processing-animation">
      <div className="processing-rings">
        {[0,1,2].map(i => <div key={i} className="ring" style={{ animationDelay: `${i * 0.3}s` }} />)}
      </div>
      <div className="processing-icon">✈️</div>
    </div>
    <h2>Crafting your itinerary…</h2>
    <p>Our AI is reading your documents and planning the perfect trip. This usually takes 20–60 seconds.</p>
    <div className="processing-steps">
      {['Extracting booking details', 'Analyzing destinations', 'Building day-by-day plan'].map((s, i) => (
        <div key={s} className="processing-step" style={{ animationDelay: `${i * 0.5}s` }}>
          <div className="step-dot" />
          {s}
        </div>
      ))}
    </div>
  </div>
);

// ── Day card ──────────────────────────────────────────────────────────────────
const DayCard = ({ day }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="day-card fade-in">
      <div className="day-header" onClick={() => setExpanded(!expanded)}>
        <div className="day-meta">
          <div className="day-number">Day {day.dayNumber}</div>
          <div className="day-info">
            <span className="day-city">{day.city}{day.country ? `, ${day.country}` : ''}</span>
            {day.date && <span className="day-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>}
          </div>
        </div>
        <button className="day-toggle">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="day-body">
          {day.activities?.map((activity, i) => (
            <div key={i} className={`activity-item activity-${activity.type}`}>
              <div className="activity-time">{activity.time || '—'}</div>
              <div className="activity-connector">
                <div className="activity-dot"><ActivityIcon type={activity.type} /></div>
                {i < day.activities.length - 1 && <div className="activity-line" />}
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                {activity.description && <p className="activity-desc">{activity.description}</p>}
                {activity.location && (
                  <div className="activity-location">
                    <MapPin size={12} /> {activity.location}
                  </div>
                )}
                {activity.notes && <div className="activity-note">{activity.notes}</div>}
              </div>
            </div>
          ))}

          {day.tips?.length > 0 && (
            <div className="day-tips">
              <span className="tips-label">💡 Local Tips</span>
              <ul>
                {day.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ItineraryPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [status, setStatus] = useState(searchParams.get('processing') ? 'processing' : 'loading');
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchItinerary = useCallback(async () => {
    try {
      const { data } = await itineraryAPI.get(id);
      setItinerary(data.itinerary);
      setStatus(data.itinerary.status);
    } catch {
      setStatus('error');
    }
  }, [id]);

  // Poll status while processing
  useEffect(() => {
    if (status === 'completed' || status === 'failed' || status === 'error') return;

    const poll = async () => {
      try {
        const { data } = await itineraryAPI.getStatus(id);
        setStatus(data.status);
        if (data.status === 'completed') fetchItinerary();
      } catch { setStatus('error'); }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [id, status, fetchItinerary]);

  useEffect(() => {
    if (status === 'loading') fetchItinerary();
  }, [status, fetchItinerary]);

  const handleToggleShare = async () => {
    setShareLoading(true);
    try {
      const { data } = await itineraryAPI.toggleShare(id);
      setItinerary((prev) => ({ ...prev, isPublic: data.isPublic, shareToken: data.shareToken }));
      toast.success(data.isPublic ? 'Sharing enabled!' : 'Sharing disabled.');
    } catch {
      toast.error('Failed to update sharing settings.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${itinerary.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this itinerary? This cannot be undone.')) return;
    try {
      await itineraryAPI.delete(id);
      toast.success('Itinerary deleted.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return <div className="iti-loading"><div className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
  }

  if (status === 'processing') {
    return (
      <div className="iti-page">
        <div className="container"><ProcessingView itineraryId={id} /></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="iti-page">
        <div className="container">
          <div className="iti-error fade-in">
            <AlertCircle size={40} />
            <h2>Processing Failed</h2>
            <p>{itinerary?.errorMessage || 'Something went wrong while generating your itinerary.'}</p>
            <Link to="/upload" className="btn btn-primary">Try Again</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  const shareUrl = `${window.location.origin}/share/${itinerary.shareToken}`;

  return (
    <div className="iti-page">
      <div className="container">
        {/* ── Back ──────────────────────────────────────────────────────────── */}
        <Link to="/dashboard" className="iti-back">
          <ArrowLeft size={16} /> Back to My Trips
        </Link>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="iti-header fade-in">
          <div className="iti-header-text">
            <h1>{itinerary.title}</h1>
            <div className="iti-meta">
              {itinerary.destination && (
                <span className="iti-meta-item"><MapPin size={14} /> {itinerary.destination}</span>
              )}
              {itinerary.startDate && (
                <span className="iti-meta-item">
                  <Calendar size={14} />
                  {new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {itinerary.endDate && ` – ${new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
              )}
              {itinerary.totalDays && (
                <span className="iti-meta-item"><Clock size={14} /> {itinerary.totalDays} days</span>
              )}
            </div>
            {itinerary.summary && <p className="iti-summary">{itinerary.summary}</p>}
          </div>

          <div className="iti-actions">
            <button
              className={`btn ${itinerary.isPublic ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={handleToggleShare}
              disabled={shareLoading}
            >
              {itinerary.isPublic ? <Globe size={16} /> : <Lock size={16} />}
              {itinerary.isPublic ? 'Public' : 'Private'}
            </button>

            {itinerary.isPublic && (
              <button className="btn btn-ghost" onClick={handleCopyLink}>
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            )}

            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* ── Booking Summary ────────────────────────────────────────────────── */}
        {(itinerary.extractedData?.flights?.length > 0 || itinerary.extractedData?.hotels?.length > 0) && (
          <div className="booking-summary fade-in">
            <h3>Booking Summary</h3>
            <div className="booking-grid">
              {itinerary.extractedData.flights?.map((f, i) => (
                <div key={i} className="booking-card flight">
                  <div className="booking-icon"><Plane size={18} /></div>
                  <div className="booking-info">
                    <strong>{f.airline} {f.flightNumber}</strong>
                    <span>{f.from} → {f.to}</span>
                    <span className="booking-sub">{f.departureDate} · {f.departureTime} → {f.arrivalTime}</span>
                    {f.bookingRef && <span className="booking-ref">Ref: {f.bookingRef}</span>}
                  </div>
                </div>
              ))}
              {itinerary.extractedData.hotels?.map((h, i) => (
                <div key={i} className="booking-card hotel">
                  <div className="booking-icon"><Hotel size={18} /></div>
                  <div className="booking-info">
                    <strong>{h.name}</strong>
                    <span>{h.city}{h.country ? `, ${h.country}` : ''}</span>
                    <span className="booking-sub">Check-in: {h.checkIn} · Check-out: {h.checkOut}</span>
                    {h.confirmationNumber && <span className="booking-ref">Confirmation: {h.confirmationNumber}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Day-by-day ────────────────────────────────────────────────────── */}
        <div className="iti-days">
          <h2>Your Itinerary</h2>
          {itinerary.days?.length > 0
            ? itinerary.days.map((day) => <DayCard key={day.dayNumber} day={day} />)
            : <p className="iti-empty">No day-by-day plan was generated. Try uploading more detailed documents.</p>
          }
        </div>

        {/* ── Share CTA ─────────────────────────────────────────────────────── */}
        {itinerary.isPublic && (
          <div className="share-cta fade-in">
            <Share2 size={20} />
            <div>
              <strong>Share your adventure</strong>
              <p>Anyone with this link can view your itinerary</p>
              <div className="share-link-box">
                <span>{shareUrl}</span>
                <button onClick={handleCopyLink}>
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPage;
