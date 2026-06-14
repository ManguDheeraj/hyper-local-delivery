/**
 * Order Routes  –  /api/orders
 * ----------------------------
 * All routes are protected (require a valid JWT).
 *
 * GET    /           – List orders (with optional ?status & ?rider filters)
 * GET    /stats      – Dashboard statistics
 * POST   /           – Create a new order (admin only)
 * PUT    /:id/assign – Assign a rider to an order (admin only)
 * PUT    /:id/status – Update order status (with side-effects)
 * GET    /:id        – Get a single order
 */

import { Router } from 'express';
import Order from '../models/Order.js';
import Rider from '../models/Rider.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to every route in this router
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders
// Query params:  ?status=pending  &  ?rider=<riderId>
// ─────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, rider } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (status) filter.status = status;
    if (rider) filter.assignedRider = rider;

    const orders = await Order.find(filter)
      .populate('assignedRider', 'name phone vehicleType isOnline currentLocation')
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('List orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/stats
// Returns aggregate statistics for the dashboard
// ─────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Total number of orders
    const totalOrders = await Order.countDocuments();

    // Orders still pending
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Orders delivered today (from midnight to now)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const deliveredToday = await Order.countDocuments({
      status: 'delivered',
      deliveredAt: { $gte: todayStart },
    });

    // Total revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Last 5 orders (any status)
    const recentOrders = await Order.find()
      .populate('assignedRider', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredToday,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/orders  (admin only)
// ─────────────────────────────────────────────────────────────────────────
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      items,
      amount,
      notes,
    } = req.body;

    // --- Validation -------------------------------------------------------
    if (!customerName || !customerPhone || !deliveryAddress || amount == null) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide customerName, customerPhone, deliveryAddress and amount',
      });
    }

    const order = await Order.create({
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      items: items || [],
      amount,
      notes,
    });

    // Emit real-time event so the dashboard refreshes
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', order);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/assign  (admin only)
// Body: { riderId }
// ─────────────────────────────────────────────────────────────────────────
router.put('/:id/assign', authorize('admin'), async (req, res) => {
  try {
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: 'riderId is required',
      });
    }

    // Verify the rider exists
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order
    order.assignedRider = riderId;
    order.status = 'assigned';
    await order.save();

    // Populate rider info before responding
    await order.populate('assignedRider', 'name phone vehicleType isOnline');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', order);
      // Notify the specific rider
      io.to(`rider-${riderId}`).emit('orderAssigned', order);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Assign rider error:', error.message);
    res.status(500).json({ success: false, message: 'Server error assigning rider' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/status
// Body: { status }
// Handles lifecycle side-effects (timestamps, rider stats)
// ─────────────────────────────────────────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'assigned',
      'dispatched',
      'in-transit',
      'delivered',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // --- Status-specific side-effects ------------------------------------
    order.status = status;

    if (status === 'dispatched') {
      order.dispatchedAt = new Date();
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();

      // Credit the assigned rider: +₹50 delivery fee, +1 delivery count
      if (order.assignedRider) {
        const deliveryFee = 50;
        await Rider.findByIdAndUpdate(order.assignedRider, {
          $inc: {
            totalEarnings: deliveryFee,
            totalDeliveries: 1,
          },
        });
      }
    }

    await order.save();

    // Populate rider info for the response / socket payload
    await order.populate('assignedRider', 'name phone vehicleType isOnline');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', order);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// ─────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'assignedRider',
      'name phone vehicleType isOnline currentLocation rating'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error.message);

    // Handle invalid ObjectId format gracefully
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(500).json({ success: false, message: 'Server error fetching order' });
  }
});

export default router;
