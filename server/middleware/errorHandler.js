/**
 * Centralized Error-Handling Middleware
 * Ensures consistent JSON responses across all failure scenarios.
 * Format: { success: false, message: string, errors?: object, code?: string }
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Log error for server diagnostics
  console.error(`🔴 [API Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path || 'resource ID'} format: '${err.value}'`;
    return res.status(400).json({
      success: false,
      message,
      code: 'INVALID_ID_FORMAT',
    });
  }

  // MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message =
      field === 'email'
        ? 'An account with this email address already exists. Please sign in instead.'
        : `Duplicate value entered for ${field}.`;
    return res.status(400).json({
      success: false,
      message,
      code: 'DUPLICATE_KEY_ERROR',
      errors: { [field]: message },
    });
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = {};
    Object.values(err.errors).forEach((val) => {
      formattedErrors[val.path] = val.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your submission.',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
  }

  // JWT Specific Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.',
      code: 'TOKEN_INVALID',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your login session has expired. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Default / Internal Server Error
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error. Please try again later.',
    code: err.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
