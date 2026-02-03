const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// Basic security headers
app.use(helmet());

// Simple rate limiter to mitigate brute-force and abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prodactx';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
          console.log('MongoDB connected Successfully');

    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
