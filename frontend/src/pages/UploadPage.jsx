import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadAPI } from '../services/api';
import {
  Upload, FileText, Image, X, Sparkles, AlertCircle, CheckCircle
} from 'lucide-react';
import './UploadPage.css';

const MAX_FILES = 5;
const ACCEPT = { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

const FileItem = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const sizeKB = (file.size / 1024).toFixed(0);
  return (
    <div className="file-item fade-in">
      <div className="file-icon">
        {isImage ? <Image size={20} /> : <FileText size={20} />}
      </div>
      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{sizeKB} KB · {isImage ? 'Image' : 'PDF'}</span>
      </div>
      <button className="file-remove" onClick={() => onRemove(file.name)}>
        <X size={16} />
      </button>
    </div>
  );
};

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Some files were rejected. Only PDF, JPG, PNG, WEBP allowed (max 10MB each).');
    }
    setFiles((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = async () => {
    if (files.length === 0) return toast.error('Please add at least one document.');
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadAPI.uploadDocuments(files, setProgress);
      toast.success('Documents uploaded! Generating your itinerary…');
      navigate(`/itinerary/${data.itineraryId}?processing=true`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-header fade-in">
          <h1>New Trip Itinerary</h1>
          <p>Upload your flight tickets, hotel confirmations, or any travel documents. Our AI will extract the details and craft a personalized itinerary.</p>
        </div>

        <div className="upload-layout">
          {/* Dropzone */}
          <div className="upload-zone-wrapper fade-in">
            <div
              {...getRootProps()}
              className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${files.length >= MAX_FILES ? 'at-limit' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="upload-zone-content">
                <div className="upload-icon">
                  <Upload size={32} />
                </div>
                {isDragActive ? (
                  <p className="upload-text">Drop your files here…</p>
                ) : (
                  <>
                    <p className="upload-text">
                      Drag & drop your documents here, or <span className="upload-link">browse files</span>
                    </p>
                    <p className="upload-hint">PDF, JPG, PNG, WEBP · Max 10MB per file · Up to {MAX_FILES} files</p>
                  </>
                )}
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="file-list">
                <div className="file-list-header">
                  <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                  <button className="btn-clear" onClick={() => setFiles([])}>Clear all</button>
                </div>
                {files.map((f) => (
                  <FileItem key={f.name} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}

            {/* Upload button */}
            <button
              className="btn btn-primary upload-btn"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <div className="spinner" />
                  Uploading… {progress}%
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Itinerary
                </>
              )}
            </button>

            {uploading && (
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="upload-tips fade-in">
            <h3>What to upload</h3>
            <div className="tip-cards">
              {[
                { icon: '✈️', title: 'Flight Tickets', desc: 'E-tickets, boarding passes, or booking confirmations with flight details.' },
                { icon: '🏨', title: 'Hotel Bookings', desc: 'Confirmation emails or vouchers showing check-in/out dates.' },
                { icon: '🚂', title: 'Train / Bus Tickets', desc: 'Any transportation booking documents.' },
                { icon: '📄', title: 'Mixed Documents', desc: 'Upload multiple documents at once — we\'ll combine them intelligently.' },
              ].map((tip) => (
                <div key={tip.title} className="tip-card">
                  <span className="tip-emoji">{tip.icon}</span>
                  <div>
                    <strong>{tip.title}</strong>
                    <p>{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="tip-note">
              <AlertCircle size={16} />
              <span>Your documents are processed securely and never shared without your permission.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
