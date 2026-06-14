/**
 * Rider Model
 * -----------
 * Represents a delivery rider / driver in the system.
 *
 * Features:
 *  - Linked to a User document (1:1) for auth credentials
 *  - Real-time location tracking via currentLocation {lat, lng}
 *  - Online/offline toggle for availability
 *  - Aggregate stats: totalEarnings, totalDeliveries, rating
 *  - Vehicle type categorisation
 */

import mongoose from 'mongoose';

const riderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // one rider profile per user account
    },

    name: {
      type: String,
      required: [true, 'Rider name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: {
        values: ['bike', 'scooter', 'car', 'bicycle'],
        message: '{VALUE} is not a supported vehicle type',
      },
      default: 'bike',
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },

    totalDeliveries: {
      type: Number,
      default: 0,
      min: [0, 'Deliveries count cannot be negative'],
    },

    rating: {
      type: Number,
      default: 5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Rider = mongoose.model('Rider', riderSchema);

export default Rider;
