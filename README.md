# 🚀 HyperDispatch — Hyper-Local Delivery Dispatcher

A production-ready MERN stack internal tool for local stores (pharmacies, groceries) to manage their delivery staff with real-time tracking.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4-black?logo=socket.io)

---

## ✨ Features

- **📍 Real-Time Tracking** — Live rider locations on Google Maps with custom dark-themed styling
- **📦 Order Management** — Full lifecycle: Create → Assign → Dispatch → Deliver
- **👤 Rider Management** — Add riders, toggle online/offline, track performance
- **💰 Earnings Dashboard** — Visual charts and breakdowns for rider payouts
- **🔐 Role-Based Auth** — JWT authentication with Admin and Rider roles
- **⚡ Real-Time Updates** — Socket.io powered live status and location updates
- **🌙 Premium Dark UI** — Glassmorphism design with smooth animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS, Glassmorphism, CSS Animations |
| Maps | Google Maps JavaScript API |
| Charts | Recharts |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **Google Maps API Key** (optional — app works with fallback UI without it)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd hyper-local-delivery

# Install all dependencies (backend + frontend)
npm run install-all
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key
# - VITE_GOOGLE_MAPS_KEY: Your Google Maps API key (optional)
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
- **Admin account**: `admin@store.com` / `admin123`
- **5 demo riders** with realistic profiles
- **20 sample orders** in various states

### 4. Run Development

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) and login with `admin@store.com` / `admin123`.

---

## 📁 Project Structure

```
hyper-local-delivery/
├── backend/                # Node.js + Express API
│   ├── config/db.js        # MongoDB connection
│   ├── middleware/auth.js   # JWT authentication
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Rider.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── orders.js
│   │   └── riders.js
│   ├── index.js            # Express + Socket.io server
│   ├── seed.js             # Database seeder
│   └── package.json
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (auth)
│   │   ├── hooks/          # Custom hooks (socket)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── index.css       # Design system
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root orchestration
├── render.yaml             # Render deployment
└── .env.example            # Environment template
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin or rider |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (filterable by status) |
| GET | `/api/orders/stats` | Dashboard statistics |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/assign` | Assign rider to order |
| PUT | `/api/orders/:id/status` | Update order status |

### Riders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/riders` | List all riders |
| GET | `/api/riders/:id` | Get rider details |
| PUT | `/api/riders/:id/location` | Update rider location |
| PUT | `/api/riders/:id/toggle-online` | Toggle online status |
| GET | `/api/riders/:id/earnings` | Get earnings breakdown |

---

## 🌐 Deployment (Render)

### One-Click Deploy

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your repo — Render reads `render.yaml` automatically
5. Set environment variables in the Render dashboard:
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `VITE_GOOGLE_MAPS_KEY` — Your Google Maps API key

### Manual Deploy

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

The backend serves the frontend build as static files in production.

---

## 🔑 Default Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | admin123 |
| Rider | rahul@rider.com | rider123 |
| Rider | priya@rider.com | rider123 |

---

## 📝 License

ISC
