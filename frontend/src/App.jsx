import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ItineraryPage from './pages/ItineraryPage';
import SharedPage from './pages/SharedPage';
import './index.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: '#27ae60', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
        }}
      />

      {/* Public share page — no navbar */}
      <Routes>
        <Route path="/share/:token" element={<SharedPage />} />

        {/* All other pages — with navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard"        element={<DashboardPage />} />
                <Route path="/upload"           element={<UploadPage />} />
                <Route path="/itinerary/:id"    element={<ItineraryPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
