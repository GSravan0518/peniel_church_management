const path = require('path');
const dotenv = require('dotenv');

// Do not override vars already set in the shell / Render
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: false });

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy backend/.env.example to backend/.env and fill in the values.');
  process.exit(1);
}

const clientOrigins = String(
  process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Render sets RENDER_EXTERNAL_URL — always allow the live service origin
if (process.env.RENDER_EXTERNAL_URL) {
  const renderUrl = process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  if (!clientOrigins.includes(renderUrl)) clientOrigins.push(renderUrl);
}

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  clientUrl: clientOrigins[0],
  clientOrigins,
  churchName: process.env.CHURCH_NAME || 'Peniel Evangelical Fellowship',
};

module.exports = config;
