# OpenMeet 🎥

**Video calls and meetings for everyone.**

Connect, collaborate, and celebrate from anywhere with OpenMeet — crystal-clear video meetings built for seamless productivity.

🔗 **Live Demo:** [opmeet.vercel.app](https://opmeet.vercel.app/)

---

## ✨ Features

- **Real-time video meetings** powered by WebRTC
- **Lobby screen** for pre-call device checks before joining
- **Live in-call chat** via a slide-out chat drawer
- **Meeting controls** — mute/unmute, camera toggle, screen share, leave call
- **Local & remote video tiles** with a responsive meeting layout
- **User authentication** with protected routes and session context
- **Toast/snackbar notifications** for a smooth UX
- **Socket.IO signaling** for low-latency real-time communication

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS
- Axios
- Socket.IO Client
- Custom `useWebRTC` hook for peer connections

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose
- Socket.IO for signaling
- bcrypt for password hashing
- dotenv for environment config

## 📁 Project Structure

```
OpenMeet/
├── frontend/
│   ├── src/
│   │   ├── assets/            # Images and static assets
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── video/         # ChatDrawer, ControlBar, LobbyScreen,
│   │   │                      # LocalVideo, RemoteVideo, MeetingLayout, LocalScreen
│   │   ├── contexts/          # AuthContext, SnackbarContext
│   │   ├── hooks/              # useWebRTC.js
│   │   ├── pages/              # landing, authentication, Home, VideoMeet
│   │   └── utils/
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── controllers/       # meeting.controller.js, user.controller.js, socketManager.js
    │   ├── models/            # meeting.model.js, user.model.js
    │   ├── routes/            # meeting.routes.js, users.routes.js
    │   └── app.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/shobhit115/OpenMeet.git
cd OpenMeet
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with your backend URL:
```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

## 📜 Available Scripts

**Frontend**
| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

**Backend**
| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon |
| `npm start` | Start server |
| `npm run prod` | Start server with PM2 |

## 🗺️ Roadmap

- [ ] Meeting recording
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Calendar integration

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/shobhit115/OpenMeet/issues).



## 👤 Author

**Shobhit**
- Portfolio: [shobhit115.vercel.app](https://shobhit115.vercel.app)
- GitHub: [@shobhit115](https://github.com/shobhit115)

---
