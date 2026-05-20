# Real-Time Chat App

A full-stack real-time chat application I built to practice WebSockets, authentication, and database integration. 

## Features
- Real-time messaging across different chat rooms using Socket.IO
- User registration and login (passwords securely hashed with bcrypt)
- Persistent chat history saved in a MongoDB database
- Clean, responsive dark-mode UI built with React and Material UI
- Ability to edit and delete your past messages

## Tech Stack
- **Frontend:** React, Vite, Material UI
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB (via Mongoose)

## How to run locally

1. Open a terminal and start the server:
   ```bash
   cd server
   npm install
   npm start
   ```

2. Open another terminal and start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Open your browser and navigate to the local Vite URL (usually `http://localhost:5173`). 

*Note: Make sure you have a `.env` file in the `server` folder with your `MONGO_URI` connection string for the database.*
