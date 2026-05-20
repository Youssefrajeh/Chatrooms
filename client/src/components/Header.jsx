import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

function Header({ title }) {
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatBubbleOutlineIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Youssef's Chat</Typography>
        </Box>
        <Typography variant="h6">{title}</Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;



