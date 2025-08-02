import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


import authRoutes from "./routes/auth.routes.js"; // Importing the auth routes
import messageRoutes from "./routes/message.routes.js"; // Importing the message routes
import userRoutes from "./routes/user.routes.js"; // Importing the user routes
import spotifyRoutes from "./routes/spotify.routes.js"; // Importing the Spotify routes

import connectToMongo from "./db/connectToMongo.js";

dotenv.config(); // Load environment variables from .env file 

const app = express();
const PORT = process.env.PORT || 5000;



app.use(express.json()); // Middleware to parse JSON requests(from request.body)
app.use(cookieParser()); // tp parse the incoming cookies from req.cookies

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/users",userRoutes);
app.use("/api/spotify", spotifyRoutes);


// app.get("/", (req, res) => {
//     // root route http://localhost:5000/
//     res.send("Welcome to my backend server!"); 
// });



app.listen(PORT, () => {
    connectToMongo(); // Connect to MongoDB
    console.log("Server is running on port 5000")
});