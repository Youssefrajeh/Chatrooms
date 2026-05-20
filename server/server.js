import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import * as data from "./data.js";
import * as colors from "./colors.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use((req, _res, next) => {
    const timestamp = new Date(Date.now());
    console.log(`[${timestamp.toDateString()} ${timestamp.toTimeString()}] / ${timestamp.toISOString()}`);
    console.log(req.method, req.hostname, req.path);
    next();
});

// Authentication API
app.post("/api/register", async (req, res) => {
    const { userName, password } = req.body;
    try {
        const existingUser = await data.User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new data.User({ userName, password: hashedPassword });
        await user.save();
        res.json({ success: true, userName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/login", async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await data.User.findOne({ userName });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        res.json({ success: true, userName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on("connect", socket => {
    console.log("New connection", socket.id);

    socket.on("join", async joinInfo => {
        console.log(joinInfo);
        const { roomName, userName } = joinInfo;

        socket.data = joinInfo;
        socket.data.color = colors.getRandomColor();
        socket.join(roomName);

        data.addUserToRoom(roomName, { userName, color: socket.data.color });

        socket.on("disconnect", async () => {
            data.removeUserFromRoom(roomName, userName);
            colors.releaseColor(socket.data.color);

            data.updateTypingStatus(roomName, userName, false);
            io.to(roomName).emit("typing", data.getTypingUsers(roomName));

            await data.addMessage(roomName, { sender: '', text: `${userName} has left the room` });
            io.to(roomName).emit("chat update", await data.roomLog(roomName));
            io.to(roomName).emit("room update", { users: data.getRoomUsers(roomName) });
        });

        socket.on("message", async text => {
            const { roomName, userName, color } = socket.data;
            const messageInfo = { sender: userName, text, color };
            await data.addMessage(roomName, messageInfo);
            io.to(roomName).emit("chat update", await data.roomLog(roomName));
        });

        socket.on("edit", async editInfo => {
            const { roomName, userName, text } = editInfo;
            await data.editLastMessage(roomName, userName, text);
            io.to(roomName).emit("chat update", await data.roomLog(roomName));
        });

        socket.on("delete", async deleteInfo => {
            const { roomName, userName } = deleteInfo;
            await data.deleteLastMessage(roomName, userName);
            io.to(roomName).emit("chat update", await data.roomLog(roomName));
        });

        socket.on("typing", typingInfo => {
            const { roomName, userName, isTyping } = typingInfo;
            data.updateTypingStatus(roomName, userName, isTyping);
            io.to(roomName).emit("typing", data.getTypingUsers(roomName));
        });

        socket.emit("typing", data.getTypingUsers(roomName));

        await data.addMessage(roomName, { sender: '', text: `${userName} has joined the room` });
        io.to(roomName).emit("chat update", await data.roomLog(roomName));
        io.to(roomName).emit("room update", { users: data.getRoomUsers(roomName) });

        socket.emit("join-response", joinInfo);
    });
});

// Connect to MongoDB and Start Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB!");
        httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
    });