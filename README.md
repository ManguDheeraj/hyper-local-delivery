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

## 🌐 Deployment (Split: Frontend on Vercel & Backend on Render)

### 1. Backend Deployment (Render)
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will read the `render.yaml` configuration and set up the services automatically.
4. Set the following environment variables in the Render Dashboard under Environment settings:
   - `MONGO_URI` — Your MongoDB Atlas connection string (e.g., `mongodb+srv://...`)
   - `JWT_SECRET` — A secure secret key for JWT token generation.
   - `CORS_ORIGIN` — Your Vercel frontend URL (e.g., `https://hyper-dispatch.vercel.app`).

### 2. Frontend Deployment (Vercel)
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project**.
2. Select your repository.
3. Configure the following Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` — Your Render backend API URL (e.g., `https://hyper-local-backend.onrender.com`).
   - `VITE_GOOGLE_MAPS_KEY` — Your Google Maps API key (optional).
5. Click **Deploy**. Vercel will build the React SPA using the `frontend` folder.

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
