# HyperDispatch ⚡

**Live Demo:** [https://hyper-local-delivery-eight.vercel.app](https://hyper-local-delivery-eight.vercel.app)

HyperDispatch is a comprehensive, real-time hyper-local delivery management platform. It acts as the central nervous system for local delivery businesses, bridging the gap between dispatchers (administrators) coordinating operations and the delivery riders out in the field. 

Built with a visually stunning, responsive "glassmorphism" user interface, HyperDispatch prioritizes speed, clarity, and real-time data synchronization.

---

## 📖 How It Works

HyperDispatch operates on a strict **Role-Based Access Control (RBAC)** architecture, meaning the application completely changes its behavior and interface depending on who logs in:

### 1. The Dispatcher (Admin) Workflow
When a dispatcher logs in, they are presented with a bird's-eye view of the entire delivery operation.
- **Order Creation & Assignment:** Dispatchers receive incoming delivery requests and manually create orders in the system. They can then view a list of all online riders and directly assign an order to a specific rider.
- **Real-Time Monitoring:** As soon as an order is assigned, dispatchers can monitor its status as it moves through the lifecycle (`assigned` -> `dispatched` -> `in-transit` -> `delivered`).
- **Fleet Tracking:** Through the **Live Map**, dispatchers can see the exact, real-time GPS locations of all online riders out in the city. 
- **Analytics & Payouts:** Dispatchers have access to global earnings dashboards, tracking total daily revenue, average rider payouts, and overall delivery volume.

### 2. The Delivery Personnel (Rider) Workflow
When a rider logs in, they are placed into an isolated, distraction-free workspace tailored specifically for field operations.
- **Strict Isolation:** Riders cannot see the global dashboard, the global earnings of the company, or other riders on the network. They only see what pertains to them.
- **Order Fulfilment:** Riders monitor their personal "Orders" feed. When a dispatcher assigns them an order, it appears instantly. The rider then uses simple dropdowns to update the status of the order as they complete the delivery phases.
- **Live Map Access:** Riders have access to the map to orient themselves within the delivery zones.
- **Availability:** Riders can toggle their "Online / Offline" status directly from the navigation bar, signaling to dispatchers whether they are ready to accept new deliveries.

---

## ✨ Key Features

- **Real-Time WebSockets:** Powered by `Socket.io`, the platform requires zero page refreshes. When a dispatcher assigns an order, the rider's screen updates instantly. When a rider moves across the city, their map marker glides in real-time on the dispatcher's map.
- **Interactive Live Maps:** Integrated with `Leaflet.js` to provide high-performance, interactive mapping capabilities for fleet tracking.
- **Dynamic Routing & Security:** Robust JWT (JSON Web Token) authentication combined with strict backend permission checks ensures that riders absolutely cannot manipulate orders assigned to others or access administrative endpoints.
- **Financial Tracking:** The system automatically calculates rider earnings. Whenever a rider marks an order as `delivered`, their personal earnings and delivery counts are automatically incremented.
- **Modern "Glassmorphism" UI:** The entire application is styled using Vanilla CSS to create a premium, frosted-glass aesthetic. It features dynamic micro-animations, smooth hover states, and a fully responsive layout that works beautifully on both desktop dispatch stations and mobile rider phones.

---

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- React Router DOM (Protected Routing)
- Socket.io-client (Real-time updates)
- React-Leaflet & Leaflet.js (Interactive Maps)
- Axios (API Communication)
- React Icons

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (NoSQL Database)
- Socket.io (WebSocket Server)
- JSON Web Tokens (JWT Authentication)

---
*Built to streamline the chaos of local deliveries.*
