import { useState, useEffect } from "react";
import axios from "axios";

import {
    TextField, Button, Typography, Box, Paper, Avatar, CssBaseline,
    List, ListItem, ListItemText, ListItemAvatar, Grid, CircularProgress, Alert
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, blueGrey } from "@mui/material/colors";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";

// Gestion du mode sombre
const App = () => {
    const [darkMode, setDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Définition du thème dynamique
    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: { main: green[500] },
            secondary: { main: blueGrey[500] },
        },
        typography: {
            fontFamily: "'Roboto', sans-serif",
            h4: { fontWeight: 700 },
        },
    });

    // Fonction pour envoyer la question
    const handleAsk = async () => {
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion) return;
        if (trimmedQuestion.length > 1000) {
            setError("La question est trop longue.");
            return;
        }
        setIsLoading(true);

        setMessages((prev) => [...prev, { text: question, isUser: true }]);

        try {
            const res = await axios.post("http://127.0.0.1:5000/chat", { question });
            setMessages((prev) => [...prev, { text: res.data.answer, isUser: false }]);
            setError(null);
        } catch (err) {
            console.error("Erreur :", err);
            let errorMessage = "❌ Une erreur s'est produite.";
            if (err.response) {
                errorMessage += ` Statut: ${err.response.status}, Message: ${err.response.data.message || err.message}`;
            } else if (err.request) {
                errorMessage += " Aucune réponse du serveur.";
            } else {
                errorMessage += ` ${err.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setQuestion("");
        }
    };

    // Faire défiler vers le bas
    useEffect(() => {
        const chatBox = document.querySelector(".chat-box");
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [messages]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    padding: "20px",
                    boxSizing: "border-box",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: "20px",
                        borderRadius: "20px",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    {/* En-tête divisé en trois parties */}
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
                        <Grid item>
                            <Avatar
                                src="/logo.png"
                                alt="Logo"
                                sx={{ width: 60, height: 60 }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" textAlign="center">
                                Chatbot AYOUB
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={() => setDarkMode(!darkMode)}
                                startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                sx={{
                                    backgroundColor: darkMode ? blueGrey[700] : "#f0f0f0",
                                    color: darkMode ? "#fff" : "#333",
                                    borderRadius: "50px",
                                    padding: "8px 20px",
                                    boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": {
                                        backgroundColor: darkMode ? blueGrey[600] : "#e0e0e0",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {darkMode ? "Mode Clair ☀️" : "Mode Sombre "}
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Affichage des erreurs */}
                    {error && <Alert severity="error" sx={{ marginBottom: "10px" }}>{error}</Alert>}

                    {/* Zone de discussion */}
                    <Box
                        className="chat-box"
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            marginBottom: "20px",
                            border: "2px solid #4caf50",
                            borderRadius: "8px",
                            padding: "10px",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <List>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ListItem sx={{ justifyContent: message.isUser ? "flex-end" : "flex-start" }}>
                                        <Box sx={{ display: "flex", flexDirection: message.isUser ? "row-reverse" : "row", alignItems: "center" }}>
                                            {!message.isUser && (
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: blueGrey[500] }}></Avatar>
                                                </ListItemAvatar>
                                            )}
                                            <Paper
                                                elevation={3}
                                                sx={{
                                                    padding: "10px 15px",
                                                    borderRadius: message.isUser ? "12px 12px 0 12px" : "12px 12px 12px 0",
                                                    backgroundColor: message.isUser ? green[500] : "#ffffff",
                                                    color: message.isUser ? "#ffffff" : "#000000",
                                                }}
                                            >
                                                <ListItemText primary={message.text} />
                                            </Paper>
                                            {message.isUser && (
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: green[500] }}></Avatar>
                                                </ListItemAvatar>
                                            )}
                                        </Box>
                                    </ListItem>
                                </motion.div>
                            ))}
                        </List>
                    </Box>

                    {/* Zone de saisie et bouton d'envoi centrés avec des largeurs définies */}
                    <Grid container justifyContent="center" alignItems="center" spacing={0}>
                        <Grid item xs={12} sm={9} md={7} lg={7} sx={{ display: 'block', width: '85%', margin: '0 auto' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Exemple : Comment fonctionne l'IA ?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                disabled={isLoading}
                                multiline
                                rows={2}
                                InputProps={{ sx: { borderRadius: "8px" } }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAsk();
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3} md={2} lg={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                            <Button
                                onClick={handleAsk}
                                disabled={isLoading}
                                sx={{
                                    borderRadius: "30%",
                                    minWidth: "100px",
                                    height: "70px",
                                    padding: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: "1px solid green",
                                    justifyContent: 'center'
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <img src="/icone_Envoyé.png" alt="Envoyer" style={{ width: '40px', height: '40px' }} />
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default App;