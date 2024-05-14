import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';
import express from "express";
import multer from "multer";
import { db } from "./connect.js"; // Assuming this connects to your database

import authRoutes from "./routes/auth.js";
import commentRoutes from "./routes/comments.js";
import conversationRoutes from "./routes/conversations.js";
import likeRoutes from "./routes/likes.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import postRoutes from "./routes/posts.js";
import relationshipRoutes from "./routes/relationships.js";
import storiesRoutes from "./routes/stories.js";
import userRoutes from "./routes/users.js";

console.log(process.env); // Logs environment variables (assuming they're set)

const app = express();

// Connect to the database
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!"); // Success message on connection
});

// Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json()); // Parse incoming JSON data
app.use(
  cors({
    origin: process.env.URL_REACT, // Allow requests from React app's URL
    credentials: "include", // Allow cookies for cross-origin requests
  })
);
app.use(cookieParser()); // Parse cookies from requests

// Configure multer storage with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, "../client/public/upload"); // Change path if needed
    } catch (error) {
      console.error("Error creating upload directory:", error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    try {
      cb(null, Date.now() + file.originalname);
    } catch (error) {
      console.error("Error generating filename:", error);
      cb(error, null);
    }
  },
});

const upload = multer({ storage: storage });

// Upload route handler
app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (file) {
    res.status(200).json(file.filename); // Respond with filename on success
  } else {
    res.status(400).json({ message: "Error uploading file" }); // Error response
  }
});

// Mount route handlers for different functionalities
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log("API working!");
});
