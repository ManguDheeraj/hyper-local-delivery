/**
 * Rider Routes  –  /api/riders
 * ----------------------------
 * All routes are protected (require a valid JWT).
 *
 * GET    /                   – List all riders
 * GET    /:id                – Get a single rider
 * PUT    /:id/location       – Update rider's GPS coordinates
 * PUT    /:id/toggle-online  – Toggle online / offline status
 * GET    /:id/earnings       – Earnings breakdown + recent deliveries
 */

import { Router } from 'express';
import Rider from '../models/Rider.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to every route in this router
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────
// GET /api/riders
// ─────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const riders = await Rider.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error('List riders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching riders' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/riders/:id
// ─────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).populate(
      'user',
      'name email role createdAt'
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    res.json({ success: true, rider });
  } catch (error) {
    console.error('Get rider error:', error.message);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.status(500).json({ success: false, message: 'Server error fetching rider' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/riders/:id/location
// Body: { lat, lng }
// Broadcasts the updated position to all connected clients via Socket.io
// ─────────────────────────────────────────────────────────────────────────
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Both lat and lng are required',
      });
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates – lat must be [-90,90], lng must be [-180,180]',
      });
    }

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng } },
      { new: true, runValidators: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    // Broadcast location to all dashboard clients
    const io = req.app.get('io');
    if (io) {
      io.emit('riderLocationUpdate', {
        riderId: rider._id,
        name: rider.name,
        location: rider.currentLocation,
        isOnline: rider.isOnline,
        vehicleType: rider.vehicleType,
      });
    }

    res.json({ success: true, rider });
  } catch (error) {
    console.error('Update location error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating location' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/riders/:id/toggle-online
// Flips the isOnline boolean
// ─────────────────────────────────────────────────────────────────────────
router.put('/:id/toggle-online', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    // Toggle the boolean
    rider.isOnline = !rider.isOnline;
    await rider.save();

    // Notify dashboard clients about the availability change
    const io = req.app.get('io');
    if (io) {
      io.emit('riderStatusUpdate', {
        riderId: rider._id,
        name: rider.name,
        isOnline: rider.isOnline,
      });
    }

    res.json({
      success: true,
      rider: {
        _id: rider._id,
        name: rider.name,
        isOnline: rider.isOnline,
      },
    });
  } catch (error) {
    console.error('Toggle online error:', error.message);
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/riders/:id/earnings
// Returns earnings summary + last 30 delivered orders for this rider
// ─────────────────────────────────────────────────────────────────────────
router.get('/:id/earnings', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    // Compute average earnings per delivery (avoid divide-by-zero)
    const averagePerDelivery =
      rider.totalDeliveries > 0
        ? Math.round((rider.totalEarnings / rider.totalDeliveries) * 100) / 100
        : 0;

    // Fetch the last 30 delivered orders for this rider
    const recentDeliveries = await Order.find({
      assignedRider: rider._id,
      status: 'delivered',
    })
      .select('orderNumber customerName amount deliveredAt createdAt')
      .sort({ deliveredAt: -1 })
      .limit(30);

    res.json({
      success: true,
      earnings: {
        totalEarnings: rider.totalEarnings,
        totalDeliveries: rider.totalDeliveries,
        averagePerDelivery,
        recentDeliveries,
      },
    });
  } catch (error) {
    console.error('Earnings error:', error.message);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.status(500).json({ success: false, message: 'Server error fetching earnings' });
  }
});

export default router;
