import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
//import http from "http";
import { Server as SocketServer } from "socket.io"



import authRoutes from "./routes/auth.routes.js"; // Importing the auth routes
import messageRoutes from "./routes/message.routes.js"; // Importing the message routes
import userRoutes from "./routes/user.routes.js"; // Importing the user routes
import spotifyRoutes from "./routes/spotify.routes.js"; // Importing the Spotify routes
import youtubeRoutes from "./routes/youtube.routes.js"; // Importing the YouTube routes
import emotionRoutes from "./routes/emotion.routes.js"; // Importing the emotion routes
import chatRoutes from "./routes/chat.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import scheduleDailyAnalytics from "./jobs/dailyAggregation.js";
//import setPreferredPlatform from "./routes/user.routes.js";



import connectToMongo from "./db/connectToMongo.js";

dotenv.config(); // Load environment variables from .env file 

const app = express();
const PORT = process.env.PORT || 5000;
//const server = http.createServer(app);

// Middleware 
// app.use(cors(
//   origin: "*",
//   credentials: true
// ));


app.use(express.json()); // Middleware to parse JSON requests(from request.body)
app.use(cookieParser()); // tp parse the incoming cookies from req.cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/emotion", emotionRoutes); // Importing the emotion routes
app.use("/api/send-message", chatRoutes); // imporing the emotion handler
app.use("/api/analytics", analyticsRoutes);



// --- Socket.IO setup ---
// const io = new SocketServer(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

//io.on("connection", (socket) => {
//console.log("🔌 New socket connection", socket.id);


// frontend must emit: socket.emit("join_room", { room: `user:${userId}` })
// socket.on("join_room", ({ room }) => {
//     console.log(`📡 Socket ${socket.id} joining room: ${room}`);
//     socket.join(room);
// });

// socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected", socket.id);
// });


// --- Schedule the daily analytics job ---
//scheduleDailyAnalytics(io, process.env.DEFAULT_TZ || "Africa/Accra");



app.listen(PORT, () => {
  connectToMongo(); // Connect to MongoDB
  console.log("Server is running on port 5000")
});
