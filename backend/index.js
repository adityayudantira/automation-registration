import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import wilayahRoutes from "./routes/wilayahRoutes.js";
import registrasiRoutes from "./routes/registrasiRoutes.js";
import { handleMongoDuplicateKeyError } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://automation-registration.vercel.app",
  "https://automation-registration-zwda.vercel.app",
  "https://automation-registration-wqop.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json()); // <--- penting
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wilayah", wilayahRoutes);
app.use("/api/registrasi", registrasiRoutes);

// Middleware error handler
app.use(handleMongoDuplicateKeyError);

// MongoDB connection (keep-alive, no app.listen)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "sumurdb" });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

console.log("MONGO_URI (sanitized):", process.env.MONGO_URI?.replace(/\/\/.*@/, "//<hidden>@"));

// ✅ Export Express app
export default app;
