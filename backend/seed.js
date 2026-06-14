/**
 * Database Seed Script
 * ====================
 * Run with:  npm run seed   (or)   node seed.js
 *
 * This script:
 *  1. Connects to MongoDB
 *  2. Clears all existing User, Rider, and Order data
 *  3. Seeds 1 admin user, 5 rider users (+ Rider documents), and
 *     20 realistic sample orders with varied statuses & assignments
 *  4. Logs a summary and exits
 *
 * Default credentials:
 *   Admin  →  admin@store.com / admin123
 *   Riders →  {firstname}@rider.com / rider123
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Rider from './models/Rider.js';
import Order from './models/Order.js';

// ── Data constants ──────────────────────────────────────────────────────

const RIDER_DATA = [
  {
    name: 'Rahul Kumar',
    email: 'rahul@rider.com',
    phone: '+91 98100 11001',
    vehicleType: 'bike',
    isOnline: true,
    lat: 28.6139,
    lng: 77.209,
  },
  {
    name: 'Priya Singh',
    email: 'priya@rider.com',
    phone: '+91 98100 22002',
    vehicleType: 'scooter',
    isOnline: true,
    lat: 28.6329,
    lng: 77.2195,
  },
  {
    name: 'Amit Patel',
    email: 'amit@rider.com',
    phone: '+91 98100 33003',
    vehicleType: 'car',
    isOnline: false,
    lat: 28.5921,
    lng: 77.2307,
  },
  {
    name: 'Sneha Sharma',
    email: 'sneha@rider.com',
    phone: '+91 98100 44004',
    vehicleType: 'bicycle',
    isOnline: true,
    lat: 28.6448,
    lng: 77.1940,
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram@rider.com',
    phone: '+91 98100 55005',
    vehicleType: 'bike',
    isOnline: false,
    lat: 28.6085,
    lng: 77.2270,
  },
];

const CUSTOMER_NAMES = [
  'Ananya Verma', 'Rohan Mehta', 'Kavita Nair', 'Sanjay Gupta',
  'Meera Reddy', 'Arjun Kapoor', 'Nisha Agarwal', 'Deepak Yadav',
  'Pooja Bhatt', 'Ravi Shankar', 'Isha Malhotra', 'Karan Singhania',
  'Divya Pillai', 'Manish Tiwari', 'Swati Jain', 'Prakash Deshmukh',
  'Neha Saxena', 'Ajay Chauhan', 'Tanya Bhatia', 'Vishal Pandey',
];

const ADDRESSES = [
  '12, Connaught Place, New Delhi',
  '45-B, Lajpat Nagar, South Delhi',
  'Flat 301, Green Park Extension, New Delhi',
  '78, Karol Bagh Main Market, New Delhi',
  'H-22, Saket, New Delhi',
  'A-15, Vasant Kunj, New Delhi',
  '3rd Floor, Nehru Place, New Delhi',
  '90, Janpath Road, New Delhi',
  'Plot 56, Dwarka Sector 12, New Delhi',
  'B-44, Rohini Sector 7, New Delhi',
  '23, Defence Colony, New Delhi',
  '67, Hauz Khas Village, New Delhi',
  'C-11, Pitampura, New Delhi',
  '89, Rajouri Garden, New Delhi',
  'D-34, Greater Kailash I, New Delhi',
  'F-12, Preet Vihar, East Delhi',
  '15, Model Town, North Delhi',
  '8, Chandni Chowk, Old Delhi',
  'G-90, Mayur Vihar Phase I, New Delhi',
  '22, Safdarjung Enclave, New Delhi',
];

const PHONE_NUMBERS = [
  '+91 99100 10001', '+91 99100 20002', '+91 99100 30003', '+91 99100 40004',
  '+91 99100 50005', '+91 99100 60006', '+91 99100 70007', '+91 99100 80008',
  '+91 99100 90009', '+91 99100 10010', '+91 99100 11011', '+91 99100 12012',
  '+91 99100 13013', '+91 99100 14014', '+91 99100 15015', '+91 99100 16016',
  '+91 99100 17017', '+91 99100 18018', '+91 99100 19019', '+91 99100 20020',
];

const ITEM_POOL = [
  { name: 'Butter Chicken', price: 350 },
  { name: 'Paneer Tikka', price: 280 },
  { name: 'Biryani (Veg)', price: 220 },
  { name: 'Masala Dosa', price: 150 },
  { name: 'Chole Bhature', price: 180 },
  { name: 'Dal Makhani', price: 250 },
  { name: 'Gulab Jamun (4 pcs)', price: 120 },
  { name: 'Naan (2 pcs)', price: 60 },
  { name: 'Tandoori Roti (4 pcs)', price: 80 },
  { name: 'Mango Lassi', price: 90 },
  { name: 'Cold Coffee', price: 130 },
  { name: 'Samosa (2 pcs)', price: 60 },
  { name: 'Pav Bhaji', price: 170 },
  { name: 'Rajma Chawal', price: 160 },
  { name: 'Aloo Paratha', price: 100 },
];

const ORDER_STATUSES = [
  'pending', 'pending', 'pending', 'pending',     // 4 pending
  'assigned', 'assigned', 'assigned',               // 3 assigned
  'dispatched', 'dispatched',                       // 2 dispatched
  'in-transit', 'in-transit', 'in-transit',         // 3 in-transit
  'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', // 6 delivered
  'cancelled', 'cancelled',                         // 2 cancelled
];

// ── Helper utilities ────────────────────────────────────────────────────

/** Random integer between min (inclusive) and max (inclusive) */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick random items from the item pool (1-4 items) */
const randomItems = () => {
  const count = randInt(1, 4);
  const items = [];
  const used = new Set();
  while (items.length < count) {
    const idx = randInt(0, ITEM_POOL.length - 1);
    if (!used.has(idx)) {
      used.add(idx);
      items.push({
        name: ITEM_POOL[idx].name,
        quantity: randInt(1, 3),
        price: ITEM_POOL[idx].price,
      });
    }
  }
  return items;
};

/** Generate a random date within the last N days */
const randomDateWithinDays = (days) => {
  const now = Date.now();
  const offset = randInt(0, days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
};

/** Delhi-area coordinates with slight random offsets */
const randomDelhiCoords = () => ({
  lat: 28.6 + (Math.random() - 0.5) * 0.1,
  lng: 77.2 + (Math.random() - 0.5) * 0.1,
});

// ── Main seed function ──────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌  MONGO_URI not set in environment. Create a .env file.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅  Connected to MongoDB\n');

    // 2. Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Rider.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️   Cleared existing Users, Riders, and Orders\n');

    // 3. Create admin user
    const admin = await User.create({
      name: 'Store Admin',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`👤  Admin created: ${admin.email}`);

    // 4. Create rider users + rider profiles
    const riderDocs = [];
    for (const rd of RIDER_DATA) {
      // Create the User account first
      const riderUser = await User.create({
        name: rd.name,
        email: rd.email,
        password: 'rider123',
        role: 'rider',
      });

      // Then create the Rider profile
      const rider = await Rider.create({
        user: riderUser._id,
        name: rd.name,
        phone: rd.phone,
        vehicleType: rd.vehicleType,
        isOnline: rd.isOnline,
        currentLocation: { lat: rd.lat, lng: rd.lng },
        totalEarnings: randInt(500, 5000),
        totalDeliveries: randInt(10, 100),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      });

      riderDocs.push(rider);
      console.log(
        `🏍️   Rider created: ${rd.name} (${rd.vehicleType}, ${rd.isOnline ? 'online' : 'offline'})`
      );
    }

    // 5. Create 20 sample orders
    console.log('');
    const onlineRiders = riderDocs.filter((r) => r.isOnline || Math.random() > 0.3);

    for (let i = 0; i < 20; i++) {
      const status = ORDER_STATUSES[i];
      const items = randomItems();
      const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const coords = randomDelhiCoords();

      const orderData = {
        orderNumber: `ORD-${String(10001 + i).padStart(5, '0')}`,
        customerName: CUSTOMER_NAMES[i],
        customerPhone: PHONE_NUMBERS[i],
        deliveryAddress: ADDRESSES[i],
        deliveryLat: coords.lat,
        deliveryLng: coords.lng,
        items,
        status,
        amount,
        notes: i % 3 === 0 ? 'Please call before delivery' : '',
      };

      // Assign riders for non-pending and non-cancelled orders
      if (!['pending', 'cancelled'].includes(status)) {
        orderData.assignedRider =
          onlineRiders[randInt(0, onlineRiders.length - 1)]._id;
      }

      // Set timestamps based on status
      if (['dispatched', 'in-transit', 'delivered'].includes(status)) {
        orderData.dispatchedAt = randomDateWithinDays(7);
      }
      if (status === 'delivered') {
        orderData.deliveredAt = randomDateWithinDays(3);
      }

      const order = await Order.create(orderData);
      console.log(
        `📦  Order ${order.orderNumber} – ₹${amount} – ${status}`
      );
    }

    // 6. Print summary
    const totalUsers = await User.countDocuments();
    const totalRiders = await Rider.countDocuments();
    const totalOrders = await Order.countDocuments();

    console.log('\n══════════════════════════════════════');
    console.log('  🌱  Seed complete!');
    console.log('══════════════════════════════════════');
    console.log(`  Users  : ${totalUsers} (1 admin + ${totalRiders} riders)`);
    console.log(`  Riders : ${totalRiders}`);
    console.log(`  Orders : ${totalOrders}`);
    console.log('══════════════════════════════════════');
    console.log('\n  Admin login  →  admin@store.com / admin123');
    console.log('  Rider login  →  {name}@rider.com / rider123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌  Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
