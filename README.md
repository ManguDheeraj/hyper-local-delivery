# HyperDispatch ⚡

HyperDispatch is a modern, real-time hyper-local delivery management system. Built with a responsive "glassmorphism" UI, it provides seamless real-time coordination between dispatchers (Admins) and field delivery personnel (Riders).

## 🚀 Features

### For Dispatchers (Admins)
- **Live Dashboard**: Real-time overview of total orders, pending orders, today's deliveries, and total revenue.
- **Order Management**: Create new delivery orders, assign them to riders, and track their lifecycle from `pending` to `delivered`.
- **Live Map**: Track all online riders in real-time on an interactive map.
- **Rider Management**: View rider statuses, vehicle types, and manage the fleet.
- **Earnings & Analytics**: View global revenue, payout summaries, and top-earning riders.

### For Delivery Personnel (Riders)
- **Role-Based Isolation**: Riders log into a focused workspace containing only what they need.
- **Order Assignment**: View orders assigned directly to them and update statuses in real-time (e.g., `picked-up`, `in-transit`, `delivered`).
- **Live Map Access**: View the map to navigate and see delivery zones.
- **Availability Toggle**: Easily toggle Online/Offline status directly from the navigation header.

### Technical Highlights
- **Real-Time WebSockets**: Instant updates for order creation, status changes, and rider GPS location tracking using Socket.io.
- **Role-Based Access Control (RBAC)**: Secure API routes and frontend logic ensuring riders cannot access dispatcher-level analytics or re-assign orders.
- **Modern UI/UX**: Built with Vanilla CSS utilizing CSS variables, dynamic glassmorphism cards, micro-animations, and responsive layouts.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- React Router DOM
- Socket.io-client
- React-Leaflet & Leaflet.js (Interactive Maps)
- Axios
- React Icons

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (Database)
- Socket.io (Real-time events)
- JSON Web Tokens (JWT Authentication)
- CORS & dotenv

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB server)

### 1. Clone the repository
```bash
git clone https://github.com/ManguDheeraj/hyper-local-delivery.git
cd hyper-local-delivery
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` in your browser. Create an Admin account to get started!

## 🌍 Deployment

- **Frontend**: Designed to be deployed on Vercel or Netlify. Set the `VITE_API_URL` environment variable to your deployed backend URL.
- **Backend**: Designed to be deployed on Render, Heroku, or DigitalOcean. Ensure `CORS_ORIGIN` is set to your deployed frontend domain (e.g., `https://your-frontend.vercel.app`).

## 📝 License
This project is licensed under the MIT License.
