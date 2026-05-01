const express = require('express');
const { generateReply, summarizeEmail, detectTone } = require('../controllers/aiController');
const { validateEmail, validateRequest } = require('../utils/validators');

const router = express.Router();

// Generate reply endpoint
router.post('/generate-reply', validateEmail, validateRequest, generateReply);

// Summarize email endpoint
router.post('/summarize', validateEmail, validateRequest, summarizeEmail);

// Detect tone endpoint (bonus feature)
router.post('/detect-tone', validateEmail, validateRequest, detectTone);

module.exports = router;