import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const messageSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    sender: { type: String },
    text: { type: String },
    color: { type: String },
    timestamp: { type: Number },
    editAt: { type: Number },
    deletedAt: { type: Number }
});

export const User = mongoose.model('User', userSchema);
export const Message = mongoose.model('Message', messageSchema);

// In-memory state for presence
let roomUsers = {};
let typingUsers = {};

export const addUserToRoom = (room, user) => {
    if (!roomUsers[room]) roomUsers[room] = [];
    roomUsers[room].push(user);
}

export const removeUserFromRoom = (room, userName) => {
    if (roomUsers[room]) {
        roomUsers[room] = roomUsers[room].filter(u => u.userName !== userName);
    }
}

export const getRoomUsers = (room) => roomUsers[room] ?? [];

export const updateTypingStatus = (roomName, userName, isTyping) => {
    if (!typingUsers[roomName]) typingUsers[roomName] = new Set();
    
    if (isTyping) {
        typingUsers[roomName].add(userName);
    } else {
        typingUsers[roomName].delete(userName);
    }
}

export const getTypingUsers = (roomName) => {
    return typingUsers[roomName] ? Array.from(typingUsers[roomName]) : [];
}

// Database Operations
export const roomLog = async (roomName) => {
    return await Message.find({ roomName }).sort({ timestamp: 1 });
}

export const addMessage = async (roomName, messageInfo) => {
    messageInfo.timestamp = Date.now();
    messageInfo.roomName = roomName;
    const msg = new Message(messageInfo);
    await msg.save();
}

export const editLastMessage = async (roomName, userName, editedText) => {
    const msg = await Message.findOne({ roomName, sender: userName, deletedAt: { $exists: false } }).sort({ timestamp: -1 });
    if (msg) {
        msg.text = editedText;
        msg.editAt = Date.now();
        await msg.save();
    }
}

export const deleteLastMessage = async (roomName, userName) => {
    const msg = await Message.findOne({ roomName, sender: userName, deletedAt: { $exists: false } }).sort({ timestamp: -1 });
    if (msg) {
        msg.deletedAt = Date.now();
        await msg.save();
    }
}
