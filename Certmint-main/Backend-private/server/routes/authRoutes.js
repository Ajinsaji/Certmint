// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../config/controllers/authController');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
