import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Upload, Clock, LogOut, Menu, X, Compass } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Compass size={20} />
          </div>
          <span className="brand-name">TripWise</span>
        </Link>

        {user && (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Clock size={16} />
                My Trips
              </Link>
              <Link
                to="/upload"
                className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Upload size={16} />
                New Trip
              </Link>
              <div className="nav-divider" />
              <div className="nav-user">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <button className="nav-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>

            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
