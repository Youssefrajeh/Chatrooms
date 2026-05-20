import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import "./App.css";

import Header from "./components/Header";
import Login from "./components/Login";
import Chat from "./components/Chat";

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: "#90caf9" // A softer, modern blue that looks great in dark mode
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e"
        }
    }
});

function App() {

    const [joinInfo, setJoinInfo] = useState({
        userName: '',
        roomName: '',
        error: ''
    });

    const hasJoined = () => joinInfo.userName && joinInfo.roomName && !joinInfo.error;
    const joinRoom = joinData => {
        if (socket.current.disconnected) {
            socket.current.connect();
        }
        socket.current.emit("join", joinData);
    }

    const [chatLog, setChatLog] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    const sendMessage = (text, isImage = false) => {
        if (typeof text === "string" && text.startsWith('/edit ')) {
            const editedText = text.substring(6);
            socket.current.emit("edit", { roomName: joinInfo.roomName, userName: joinInfo.userName, text: editedText });
        } else if (typeof text === "string" && (text === '/del' || text.startsWith('/del '))) {
            socket.current.emit("delete", { roomName: joinInfo.roomName, userName: joinInfo.userName });
        } else {
            socket.current.emit("message", { text, isImage });
        }
    }

    const notifyTyping = (typingInfo) => {
        if (socket.current) {
            socket.current.emit("typing", typingInfo);
        }
    }

    const leaveRoom = () => {
        socket.current.disconnect();
        setJoinInfo({ userName: '', roomName: '', error: '' });
        setChatLog([]);
        setRoomUsers([]);
        setTypingUsers([]);
    }

    const effectRan = useRef(false);
    const socket = useRef();

    const connectToServer = () => {
        if (effectRan.current) return;

        try {
            const wsServerAddress = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ? "http://localhost:8080" : "/";
            const ws = io.connect(wsServerAddress, { transports: ["websocket"] });

            ws.on("join-response", setJoinInfo);
            ws.on("chat update", setChatLog);
            ws.on("room update", data => setRoomUsers(data.users));
            ws.on("typing", setTypingUsers);

            socket.current = ws;
            effectRan.current = true;
        }
        catch (e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        connectToServer();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header title="Youssef Rajeh" />
            {
                hasJoined() ?
                    <Chat {...joinInfo} sendMessage={sendMessage} leaveRoom={leaveRoom} chatLog={chatLog} roomUsers={roomUsers} notifyTyping={notifyTyping} typingUsers={typingUsers} />
                    : <Login joinRoom={joinRoom} error={joinInfo.error} />
            }
        </ThemeProvider>
    );
}

export default App;