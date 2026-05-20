import { useState, useEffect, useRef } from "react";
import {
    Box,
    Paper,
    CardHeader,
    CardContent,
    Divider,
    Typography,
    TextField,
    Button,
    List,
    Stack,
    Drawer,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton
} from "@mui/material";

import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiPicker from 'emoji-picker-react';
import * as fns from "date-fns";

const Chat = (props) => {

    const lastMessageRef = useRef(null);

    /* Menu */

    const [menuOpen, setMenuOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const renderMenu = () => {
        return (
            <Box sx={{ width: 250, p: "1em" }} role="presentation">
                <Typography variant="h5" sx={{ mb: "0.5em" }}>
                    {props.roomName}
                </Typography>
                <Typography variant="body1" sx={{ mb: "1em" }}>
                    {props.roomUsers?.length ?? 0} users in room
                </Typography>
                <Divider />
                <List>
                    {(props.roomUsers ?? []).map((user, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <PersonIcon sx={{ color: user.color }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={user.userName} 
                                sx={{ color: user.color }} 
                                primaryTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    };

    const renderMessage = (message, index) => {

        /* New Day Messages */

        if (message.newDay) {
            return (
                <div key={index} ref={lastMessageRef} style={{ marginBottom: "1em" }}>
                    <Typography variant="h6" textAlign="center">
                        <strong>{message.text}</strong>
                    </Typography>
                </div>
            );
        }

        /* User Typing Message */

        if (message.typingFeedback) {
            return (
                <Typography key={index} ref={lastMessageRef} variant="body1"
                    textAlign="center" sx={{ marginBottom: "1em", color: "text.secondary" }}
                >
                    <i>{message.text}</i>
                </Typography>
            );
        }

        /* Timestamp */

        const messageTimestamp = fns.format(message.timestamp, "HH:mm");

        /* Meta Chat Messages */

        if (message.sender == '') {
            return (
                <div key={index} ref={lastMessageRef} style={{ marginTop: "1em", marginBottom: "1em" }}>
                    <Typography variant="h6" textAlign="center">
                        <i>{message.text}</i>
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                        <i>{messageTimestamp}</i>
                    </Typography>
                </div>
            );
        }

        /* User Messages */

        const yourOwnMessage = message.sender == props.userName;
        const messageClassName = yourOwnMessage ? "user-message" : "message";

        return (
            <div key={index} ref={lastMessageRef} className={messageClassName}>
                <div className="message-bubble" style={{ borderColor: message.color }}>
                    <Typography variant="h6" className="message-text" sx={{ color: message.color }}>
                        <strong>{message.sender}</strong>
                    </Typography>
                    {message.isImage && !message.deletedAt ? (
                        <img src={message.text} alt="Upload" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", marginTop: "4px" }} />
                    ) : (
                        <Typography variant="h6" className="message-text">
                            {message.deletedAt ? "" : message.text}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ textAlign: "right", marginTop: "4px", color: "gray" }}>
                        { message.deletedAt && <span>(deleted) </span> }
                        { message.editAt && !message.deletedAt && <span>(edited) </span> }
                        <i>{messageTimestamp}</i>
                    </Typography>
                </div>
            </div>
        );
    }

    const renderChatLog = () => {
        const chat = props.chatLog ?? [];
        const chatWithSpecialMessages = [];

        let lastMessage = null;
        chat.forEach(message => {

            if (!lastMessage || fns.getDay(lastMessage.timestamp) != fns.getDay(message.timestamp)) {
                chatWithSpecialMessages.push({
                    sender: '',
                    text: fns.format(message.timestamp, "PPPP"),
                    newDay: true
                });
            }

            chatWithSpecialMessages.push(message);
            lastMessage = message;
        });

        let typing = (props.typingUsers || []).filter(userName => userName != props.userName);

        if (typing.length > 0) {
            let text = "";

            if (typing.length == 1) {
                text = `${typing[0]} is typing...`;
            }
            else if (typing.length == 2) {
                text = `${typing[0]} and ${typing[1]} are typing...`;
            }
            else {
                text = "Multiple users are typing...";
            }

            chatWithSpecialMessages.push({ sender: '', text, typingFeedback: true });
        }

        return chatWithSpecialMessages.map(renderMessage);
    }

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [props.chatLog, props.typingUsers]);

    const [messageText, setMessageText] = useState("");

    const handleSendMessage = () => {
        if (!messageText) return;
        props.sendMessage(messageText);
        setMessageText('');
        setShowEmojiPicker(false);
        
        const { userName, roomName } = props;
        props.notifyTyping && props.notifyTyping({ roomName, userName, isTyping: false });
    }

    const handleMessageTextChange = (e) => {
        setMessageText(e.target.value);

        const startedTyping = messageText == "" && e.target.value != "";
        const finishedTyping = messageText != "" && e.target.value == "";

        if (startedTyping || finishedTyping) {
            const { userName, roomName } = props;
            let typingInfo = { roomName, userName, isTyping: startedTyping };
            props.notifyTyping && props.notifyTyping(typingInfo);
        }
    }

    const onEmojiClick = (emojiObject) => {
        setMessageText(prev => prev + emojiObject.emoji);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset the input value so the same file can be selected again
        e.target.value = null;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            props.sendMessage(base64String, true);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Paper elevation={4} sx={{ mt: "0.5em", display: "flex", flexDirection: "column" }}>
            <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
                {renderMenu()}
            </Drawer>
            
            <Stack direction="row" sx={{
                alignItems: "center", justifyContent: "space-between",
                pl: "1em", pr: "1em"
            }}>
                <Button variant="contained" onClick={() => setMenuOpen(true)} >
                    <MenuIcon />
                </Button>
                <CardHeader title={props.roomName} />
                <Button variant="contained" onClick={props.leaveRoom}>
                    <LogoutIcon />
                </Button>
            </Stack>
            <Divider />
            <CardContent>
                <List sx={{ height: "60vh", overflowY: "scroll", textAlign: "left" }}>
                    {renderChatLog()}
                </List>
                <Divider />
                <Box sx={{ mt: "1em", display: "flex", direction: "row", flex: 1, position: "relative" }}>
                    
                    {showEmojiPicker && (
                        <Box sx={{ position: "absolute", bottom: "100%", left: "0", zIndex: 1000, mb: 1 }}>
                            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                        </Box>
                    )}

                    <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        id="image-upload-input" 
                        onChange={handleImageUpload} 
                    />
                    <label htmlFor="image-upload-input">
                        <IconButton component="span" sx={{ mr: 1, mt: 1 }}>
                            <AttachFileIcon />
                        </IconButton>
                    </label>

                    <IconButton onClick={() => setShowEmojiPicker(prev => !prev)} sx={{ mr: 1, mt: 1 }}>
                        <EmojiEmotionsIcon />
                    </IconButton>

                    <TextField fullWidth sx={{ mr: "1em", flex: 9 }}
                        value={messageText} onChange={handleMessageTextChange}
                        onKeyDown={e => {
                            if (e.key == "Enter") {
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button variant="contained" sx={{ flex: 1 }} onClick={handleSendMessage}>
                        <SendIcon />
                    </Button>
                </Box>
            </CardContent>
        </Paper>
    );
};

export default Chat;
