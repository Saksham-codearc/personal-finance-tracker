import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';
  let fields;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Please check the highlighted fields.';
    fields = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'The requested record could not be found.';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = error.keyPattern?.email
      ? 'An account with that email already exists.'
      : 'That record already exists.';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)[0]?.message || 'Invalid data.';
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(fields ? { fields } : {}),
    ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
}
