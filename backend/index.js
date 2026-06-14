/**
 * Hyper-Local Delivery Dispatcher – Main Server Entry
 * ====================================================
 * Sets up:
 *  1. Express app + HTTP server
 *  2. Socket.io (with CORS)
 *  3. MongoDB connection
 *  4. REST API routes  (/api/auth, /api/orders, /api/riders)
 *  5. Real-time WebSocket event handlers
 *  6. Static file serving for production frontend
 *  7. Global error-handling middleware
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import riderRoutes from './routes/riders.js';

// ── Resolve __dirname for ES modules ────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Allowed origins for CORS (comma-separated in env, or sensible defaults)
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// ── Express + HTTP server ───────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ── Socket.io ───────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,       // 60 s before considering a client dead
  pingInterval: 25000,      // ping every 25 s
});

// Store io on the app so route handlers can emit events
app.set('io', io);

// ── Middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));          // JSON body parser
app.use(express.urlencoded({ extended: true }));    // form-encoded bodies

// Simple request logger (non-production)
if (NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/riders', riderRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Hyper-Local Delivery API is running 🚀',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Socket.io connection handler ────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);

  // Allow riders (or dashboard) to join a rider-specific room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📍  Socket ${socket.id} joined room: ${roomId}`);
  });

  // Riders periodically push their GPS coordinates
  socket.on('updateLocation', (data) => {
    // data = { riderId, lat, lng, ... }
    io.emit('riderLocationUpdate', {
      riderId: data.riderId,
      location: { lat: data.lat, lng: data.lng },
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌  Client disconnected: ${socket.id} (${reason})`);
  });
});

// ── 404 handler for unknown API routes ──────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Root Endpoint ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('Hyper-Local Delivery Backend is running.');
});

// ── Global error handler ────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('💥  Unhandled error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Start server ────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Listen for HTTP + WebSocket connections
    httpServer.listen(PORT, () => {
      console.log(`\n🚀  Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`   REST API  → http://localhost:${PORT}/api`);
      console.log(`   Health    → http://localhost:${PORT}/api/health`);
      console.log(`   Socket.io → ws://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
