import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && isProduction) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'finora-local-development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigins: [
    ...new Set(
      (process.env.CLIENT_URL || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .concat(isProduction ? [] : defaultOrigins)
    ),
  ],
  seedDemo: process.env.SEED_DEMO === 'true',
};
