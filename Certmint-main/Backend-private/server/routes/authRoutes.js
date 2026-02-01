// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../config/controllers/authController');
const authMiddleware = require('../middleware/auth');
const uploadInstitutionDocument = require('../middleware/uploadInstitutionDocument');

// POST /api/auth/signup/student - name, email, dateOfBirth, password → no token, redirect to login
router.post('/signup/student', authController.signupStudent);

// POST /api/auth/signup/institution - institutionName, email, phone, address, document (file)
router.post(
  '/signup/institution',
  (req, res, next) => {
    uploadInstitutionDocument.single('document')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }
      next();
    });
  },
  authController.signupInstitution
);

// POST /api/auth/signup (legacy - optional)
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me - current user profile
router.get('/me', authMiddleware, authController.getMe);

// PATCH /api/auth/profile - update profile (name, email)
router.patch('/profile', authMiddleware, authController.updateProfile);

// PATCH /api/auth/change-password - change password (currentPassword, newPassword)
router.patch('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
