const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const { uploadDocuments } = require('../controllers/uploadController');

const router = express.Router();

/**
 * POST /api/upload
 * Accepts up to 5 files (PDFs or images).
 * Protected route - user must be logged in.
 */
router.post(
  '/',
  protect,
  (req, res, next) => {
    upload.array('documents', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadDocuments
);

module.exports = router;
