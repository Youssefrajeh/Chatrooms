import { useState } from "react";
import {
    Paper,
    CardHeader,
    CardContent,
    TextField,
    Button,
    Alert,
    Typography,
    Link
} from "@mui/material";

import chatLogo from "../assets/Chatlogo.png";

const Login = (props) => {

    const [roomName, setRoomName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [localError, setLocalError] = useState("");

    const handleAction = async () => {
        setLocalError("");
        const url = isLoginMode ? "/api/login" : "/api/register";
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password })
            });
            const data = await res.json();
            if (res.ok) {
                props.joinRoom({ roomName, userName });
            } else {
                setLocalError(data.error);
            }
        } catch (e) {
            setLocalError("Network error. Is the server running?");
        }
    };

    return (
        <Paper elevation={4} sx={{ mt: "0.5em" }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={chatLogo} alt="App Logo" style={{ width: "200px", marginTop: "16px", marginBottom: "8px" }} />
                <CardHeader title={isLoginMode ? "Login to ChatRoom" : "Register new account"} sx={{ width: '100%', textAlign: 'left' }} />
                
                <TextField fullWidth label="User Name" value={userName} onChange={e => setUserName(e.target.value)}
                    sx={{ mb: "1em" }}
                />
                <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    sx={{ mb: "1em" }}
                />
                <TextField fullWidth label="Room Name" value={roomName} onChange={e => setRoomName(e.target.value)}
                    sx={{ mb: "1em" }}
                />
                <Button fullWidth variant="contained" disabled={!roomName || !userName || !password}
                    onClick={handleAction}
                >
                    {isLoginMode ? "Login & Join" : "Register & Join"}
                </Button>

                <Typography variant="body2" sx={{ mt: "1em" }}>
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <Link component="button" variant="body2" onClick={() => setIsLoginMode(!isLoginMode)}>
                        {isLoginMode ? "Register here" : "Login here"}
                    </Link>
                </Typography>
            </CardContent>
            {(localError || props.error) && <Alert severity="error">{localError || props.error}</Alert>}
        </Paper>
    );
};

export default Login;
