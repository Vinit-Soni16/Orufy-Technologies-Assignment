const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');

const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

/* -------------------- ROUTES -------------------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);

/* -------------------- CONFIG -------------------- */
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

/* -------------------- DB + SERVER -------------------- */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
