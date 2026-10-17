# 🎥 Streamly - Real-Time Video Conferencing Platform

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7.3-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Material UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**Streamly** is a modern, full-stack video conferencing web application designed for seamless communication. Built with **React**, **Node.js**, **Express**, **Socket.io**, and **WebRTC**, it enables peer-to-peer audio/video streaming, instant room creation, screen sharing, in-call chat messaging, and persistent meeting history.

---

## ✨ Key Features

- 📹 **HD Video & Audio Calling**: Low-latency peer-to-peer real-time video and audio streaming powered by WebRTC.
- 💬 **In-Meeting Live Chat**: Chat with participants in real-time during an active video conference.
- 🖥️ **Screen Sharing**: Easily share your screen or application window with meeting participants.
- 🔐 **User Authentication**: Secure signup and login with hashed passwords via `bcrypt` and session token generation.
- 🕒 **Meeting History**: Track past meetings, view attended calls, and review timestamps.
- 🚀 **Instant Room Generation & Joining**: Create meetings instantly or enter any room using a unique meeting code.
- 🎛️ **In-Call Controls**: Simple controls for toggling microphone, camera, screen share, chat drawer, and leaving calls.
- 📱 **Responsive UI**: Sleek and modern design built using Material-UI (MUI).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/)
- **UI Components & Icons**: [Material UI (MUI v5)](https://mui.com/) & [Emotion](https://emotion.sh/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Real-Time Client**: [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Signaling & WebSockets**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Security & Utilities**: `bcrypt` (password hashing), `crypto`, `dotenv`, `cors`

---

## 📂 Project Structure

```bash
Streamly/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js   # Socket.io signaling & room event handlers
│   │   │   └── user.controller.js # Auth (login, register) & meeting history logic
│   │   ├── models/
│   │   │   ├── meeting.model.js   # MongoDB schema for meeting records
│   │   │   └── user.model.js      # MongoDB schema for user accounts
│   │   ├── routes/
│   │   │   └── users.routes.js    # Express REST API routes
│   │   └── app.js                 # Server entry point & DB connection setup
│   ├── .env.example               # Template for backend environment variables
│   └── package.json
│
├── frontend/
│   ├── public/                    # Static assets & icons
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # User auth state & API integration
│   │   ├── pages/
│   │   │   ├── authentication.jsx # Login & registration forms
│   │   │   ├── history.jsx        # Past meetings history viewer
│   │   │   ├── home.jsx           # Dashboard to join/create meetings
│   │   │   ├── landing.jsx        # App landing hero page
│   │   │   └── VideoMeet.jsx      # Core video conference & WebRTC call room
│   │   ├── styles/                # Component styles
│   │   ├── environment.js         # API backend URL configuration
│   │   ├── App.js                 # Client-side router setup
│   │   └── index.js
│   └── package.json
│
├── .gitignore                     # Repository-wide ignore rules
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project running locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### 1. Clone the Repository

```bash
git clone https://github.com/shreyash-sb/Streamly.git
cd Streamly
```

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `backend/.env` and provide your MongoDB connection URI:
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   ```
   *(Note: The server will run even without a DB initially, but a MongoDB URI is required for user authentication and history).*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:8000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure custom backend URL:
   By default, the frontend connects to `http://localhost:8000`. If deploying or hosting elsewhere, create a `frontend/.env` file:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

4. Start the frontend React app:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/users/register` | Register a new user account | No |
| `POST` | `/api/v1/users/login` | Authenticate user & return auth token | No |
| `GET` | `/api/v1/users/get_all_activity` | Fetch user meeting history | Yes (`token` query param) |
| `POST` | `/api/v1/users/add_to_activity` | Save meeting code to user history | Yes (`token` in body) |

---

## ⚡ Socket.io Signaling Events

| Event Name | Direction | Payload / Purpose |
| :--- | :--- | :--- |
| `join-call` | Client ➔ Server | Joins the specified meeting room path |
| `user-joined` | Server ➔ Client | Broadcasts to room participants that a new peer joined |
| `signal` | Bidirectional | Exchanges WebRTC SDP offers/answers & ICE candidates |
| `chat-message` | Bidirectional | Sends and broadcasts in-call text messages |
| `user-left` | Server ➔ Client | Notifies room participants when a peer disconnects |

---

## 🛡️ Security Best Practices

- Never commit sensitive connection strings or secret keys to version control.
- All sensitive variables must be placed in a `.env` file (which is ignored by Git in [.gitignore](.gitignore)).
- Passwords are encrypted using salted `bcrypt` hashes before storing in the database.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.
