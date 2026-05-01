// Validate email content
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email object is required'
    });
  }
  
  if (!email.body || email.body.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email body cannot be empty'
    });
  }
  
  if (email.body.length > 10000) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email body is too long (max 10000 characters)'
    });
  }
  
  next();
};

// Validate request parameters
const validateRequest = (req, res, next) => {
  const { tone, language } = req.body;
  
  const validTones = ['professional', 'friendly', 'short'];
  const validLanguages = ['english', 'hindi', 'hinglish'];
  
  if (tone && !validTones.includes(tone)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid tone. Must be one of: ${validTones.join(', ')}`
    });
  }
  
  if (language && !validLanguages.includes(language)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Invalid language. Must be one of: ${validLanguages.join(', ')}`
    });
  }
  
  next();
};

module.exports = { validateEmail, validateRequest };