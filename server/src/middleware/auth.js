import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler, createError } from '../utils/http.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw createError(401, 'Please sign in to continue.');
  }

  const token = header.slice(7).trim();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw createError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw createError(401, 'This account no longer exists.');
  }

  req.user = user;
  next();
});

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
