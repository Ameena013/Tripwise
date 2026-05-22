import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itineraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Calendar, Plus, Clock, Globe, Lock, Trash2, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    {status === 'completed' && '✓ '}
    {status === 'processing' && '⟳ '}
    {status === 'failed' && '✕ '}
    {status}
  </span>
);

const ItineraryCard = ({ itinerary, onDelete }) => {
  const isProcessing = itinerary.status === 'processing';

  return (
    <div className={`iti-card fade-in ${isProcessing ? 'processing' : ''}`}>
      <div className="iti-card-header">
        <div className="iti-card-title">
          <h3>{itinerary.title}</h3>
          <StatusBadge status={itinerary.status} />
        </div>
        <div className="iti-card-meta">
          {itinerary.destination && itinerary.destination !== 'Processing…' && (
            <span><MapPin size={13} /> {itinerary.destination}</span>
          )}
          {itinerary.startDate && (
            <span>
              <Calendar size={13} />
              {new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {itinerary.totalDays && (
            <span><Clock size={13} /> {itinerary.totalDays} days</span>
          )}
          {itinerary.isPublic
            ? <span className="share-tag public"><Globe size={12} /> Public</span>
            : <span className="share-tag private"><Lock size={12} /> Private</span>
          }
        </div>
      </div>

      <div className="iti-card-footer">
        <span className="iti-card-date">
          {new Date(itinerary.createdAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })}
        </span>
        <div className="iti-card-actions">
          <button
            className="btn-icon-danger"
            onClick={() => onDelete(itinerary._id)}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
          <Link
            to={`/itinerary/${itinerary._id}${isProcessing ? '?processing=true' : ''}`}
            className="btn btn-ghost btn-sm"
          >
            {isProcessing ? 'View progress' : 'Open'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {isProcessing && <div className="card-progress-bar" />}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchItineraries = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await itineraryAPI.list({ page: p, limit: 9 });
      setItineraries(data.itineraries);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load itineraries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItineraries(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    try {
      await itineraryAPI.delete(id);
      toast.success('Deleted.');
      fetchItineraries(page);
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header fade-in">
          <div>
            <h1>My Trips</h1>
            <p>Welcome back, {user?.name?.split(' ')[0]}. Here are your travel itineraries.</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <Plus size={18} />
            New Trip
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : itineraries.length === 0 ? (
          <div className="dashboard-empty fade-in">
            <div className="empty-icon">🗺️</div>
            <h2>No trips yet</h2>
            <p>Upload your booking documents to generate your first AI-powered itinerary.</p>
            <Link to="/upload" className="btn btn-primary">
              <Plus size={18} />
              Create your first trip
            </Link>
          </div>
        ) : (
          <>
            <div className="itineraries-grid">
              {itineraries.map((iti) => (
                <ItineraryCard key={iti._id} itinerary={iti} onDelete={handleDelete} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <span>Page {page} of {pagination.pages}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
