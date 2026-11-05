import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler, createError } from '../utils/http.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'An account with that email already exists.');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({
    success: true,
    data: {
      token: signToken(user),
      user: user.toPublicJSON(),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw createError(401, 'Incorrect email or password.');
  }

  res.json({
    success: true,
    data: {
      token: signToken(user),
      user: user.toPublicJSON(),
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user.toPublicJSON() },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  await req.user.save();

  res.json({
    success: true,
    data: { user: req.user.toPublicJSON() },
  });
});
