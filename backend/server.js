const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const homeProgramRoutes = require('./routes/homePrograms');
const calendarRoutes = require('./routes/calendar');
const notificationRoutes = require('./routes/notifications');
const devotionRoutes = require('./routes/devotions');
const prayerRoutes = require('./routes/prayers');
const occasionRoutes = require('./routes/occasions');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// --------------------------------------------------
// BODY PARSERS
// --------------------------------------------------

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// LOGGER
// --------------------------------------------------

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// --------------------------------------------------
// STATIC UPLOADS
// --------------------------------------------------

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    church: config.churchName,
    env: config.nodeEnv,
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',

    mongoUriHost: (() => {
      try {
        return new URL(
          config.mongoUri.replace(
            'mongodb://',
            'http://'
          )
        ).host;
      } catch {
        return 'configured';
      }
    })(),

    message: `${config.churchName} API running`,
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/home-programs', homeProgramRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/devotions', devotionRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// --------------------------------------------------
// SERVE REACT FRONTEND
// --------------------------------------------------

// On Render, serve the built React app from backend/public

const clientDist = path.join(__dirname, 'public');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads')
    ) {
      return next();
    }

    res.sendFile(
      path.join(clientDist, 'index.html'),
      (err) => {
        if (err) {
          next();
        }
      }
    );
  });
}

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

// --------------------------------------------------
// MONGODB CONNECTION + SERVER
// --------------------------------------------------

const { ensureAdminFromEnv } = require('./utils/ensureAdmin');
const { startDayOfProgramNotifier } = require('./utils/dayOfProgramJob');

mongoose
  .connect(config.mongoUri)
  .then(async () => {
    console.log('MongoDB connected');
    console.log(`Church: ${config.churchName}`);

    try {
      await ensureAdminFromEnv();
    } catch (err) {
      console.error('Admin bootstrap error:', err.message);
    }

    startDayOfProgramNotifier();

    // Render provides process.env.PORT automatically.
    // Use 5000 when running locally.
    const PORT = process.env.PORT || config.port || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `CORS allowed origins: ${config.clientOrigins.join(', ')}`
      );
    });
  })
  .catch((err) => {
    console.error(
      'MongoDB connection error:',
      err.message
    );

    console.error(
      'Check MONGODB_URI in backend/.env and ensure MongoDB is running.'
    );

    process.exit(1);
  });