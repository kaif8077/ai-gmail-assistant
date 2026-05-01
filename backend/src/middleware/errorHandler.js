const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose errors (if using MongoDB later)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // OpenAI specific errors
  if (err.message.includes('OpenAI') || err.message.includes('API key')) {
    return res.status(503).json({
      error: 'AI Service Error',
      message: 'Unable to process request. Please try again later.'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;