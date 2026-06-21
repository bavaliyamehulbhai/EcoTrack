# 🌿 EcoTrack - Sustainability & Carbon Tracking Platform

**🌍 Live Demo:** [https://ecotrack123.vercel.app/](https://ecotrack123.vercel.app/)

EcoTrack is a modern, full-stack web application designed to help individuals and organizations track their daily carbon footprint, build sustainable habits, and compete on a global leaderboard. Built with the MERN stack and featuring a stunning Glassmorphism UI, EcoTrack gamifies sustainability.

## ✨ Key Features

- **Eco Actions Logging:** Track daily sustainable habits (e.g., using a reusable bottle, walking instead of driving) and earn points.
- **Emission Target Goals:** Set personalized carbon reduction goals and track your progress through interactive, dynamic visual bars.
- **Global Leaderboard:** Compete with other users. The top 3 users are highlighted on an animated podium.
- **Gamification:** Earn "Streak Freezes", unlock badges, and receive real-time notifications for your achievements.
- **Admin Dashboard:** Comprehensive tools for administrators to manage users, suspend accounts, delete inappropriate logs, and view platform-wide analytics.
- **Modern UI/UX:** A responsive, pixel-perfect design featuring a Glassmorphism aesthetic, smooth micro-animations, and seamless Dark/Light mode support.

## 🛠️ Tech Stack

### Frontend
- **React (Vite):** Fast, component-driven UI.
- **Vanilla CSS:** Custom-built Glassmorphism design system without heavy styling libraries.
- **Socket.io-client:** Real-time push notifications.
- **React Router DOM:** Seamless SPA navigation.

### Backend
- **Node.js & Express:** Robust REST API framework.
- **MongoDB & Mongoose:** Flexible NoSQL database schema for users, actions, and goals.
- **Socket.io:** Real-time event broadcasting for leaderboards and notifications.
- **JWT (JSON Web Tokens):** Secure, stateless authentication.

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB database (local or MongoDB Atlas).

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YourUsername/ecotrack.git
cd ecotrack
\`\`\`

### 2. Setup the Backend
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file inside the `server` directory and add the following:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
\`\`\`
Start the backend server:
\`\`\`bash
npm start
\`\`\`

### 3. Setup the Frontend
Open a new terminal window and navigate to the client folder:
\`\`\`bash
cd client
npm install
\`\`\`
Create a `.env` file inside the `client` directory (or `.env.local` depending on your Vite setup) and add:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
\`\`\`
Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. View the App
Open your browser and navigate to the URL provided by Vite (usually \`http://localhost:5173\`).

## 🌐 Deployment
- The **Backend** is optimized to be deployed on platforms like [Render](https://render.com/) or Heroku.
- The **Frontend** can easily be hosted on [Vercel](https://vercel.com/) or Netlify.
*(Make sure to update the `VITE_API_URL` and `VITE_SOCKET_URL` environment variables on your frontend hosting platform to point to your deployed backend).*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
