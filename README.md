# 🎥 Streamly

> A real-time video conferencing web application built with **React**, **Node.js**, **Socket.io**, and **WebRTC**.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-WebRTC-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Material UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)

---

## ⚡ Features

- **P2P Video & Audio**: Low-latency video calling powered by WebRTC.
- **Screen Sharing**: Stream your screen or window with a single click.
- **In-Meeting Chat**: Real-time text messaging between participants.
- **Instant Rooms**: Join or create meetings using unique room codes.
- **Authentication & History**: Secure user accounts and past meeting logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Material UI (MUI), Socket.io-client, Axios, React Router.
- **Backend**: Node.js, Express, Socket.io (signaling server), Mongoose (MongoDB), bcrypt.

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
```

Run the backend:

```bash
npm run dev
```

> Server runs at `http://localhost:8000`.

---

### 2. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

> App runs at `http://localhost:3000`.

---

## ⚙️ Environment Variables

| Variable                | Description               | Default                                         |
| :---------------------- | :------------------------ | :---------------------------------------------- |
| `PORT`                  | Backend server port       | `8000`                                          |
| `MONGO_URI`             | MongoDB connection string | _(Optional for dev, required for auth/history)_ |
| `REACT_APP_BACKEND_URL` | Frontend API URL          | `http://localhost:8000`                         |

---
