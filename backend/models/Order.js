/**
 * Order Model
 * -----------
 * Represents a delivery order in the system.
 *
 * Features:
 *  - Auto-generated orderNumber (ORD-XXXXX) via a pre-save hook + counter
 *  - Full lifecycle status tracking (pending → assigned → dispatched →
 *    in-transit → delivered | cancelled)
 *  - Embedded items sub-documents with name / quantity / price
 *  - References the Rider model for assignment
 *  - Mongoose timestamps (createdAt, updatedAt) plus explicit
 *    dispatchedAt / deliveredAt fields
 */

import mongoose from 'mongoose';

// ── Sub-schema for individual line items ──────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false } // no need for separate _id on each item
);

// ── Main Order schema ──────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },

    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },

    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },

    deliveryLat: {
      type: Number,
    },

    deliveryLng: {
      type: Number,
    },

    items: [orderItemSchema],

    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'assigned',
          'dispatched',
          'in-transit',
          'delivered',
          'cancelled',
        ],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
      index: true,
    },

    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      default: null,
    },

    amount: {
      type: Number,
      required: [true, 'Order amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    dispatchedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// ── Pre-save hook: auto-generate orderNumber ────────────────────────────
/**
 * Generates a unique order number in the format ORD-XXXXX where XXXXX is
 * a zero-padded sequential number derived from the current document count.
 * A random suffix is appended to avoid collisions during concurrent inserts.
 */
orderSchema.pre('save', async function (next) {
  if (this.orderNumber) return next(); // already assigned (update path)

  try {
    // Count existing documents and add 1 for the new one
    const count = await mongoose.model('Order').countDocuments();
    // Add a small random offset (0-99) to reduce collision probability
    const randomSuffix = Math.floor(Math.random() * 100);
    const sequenceNumber = count + 1 + randomSuffix;
    this.orderNumber = `ORD-${String(sequenceNumber).padStart(5, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
