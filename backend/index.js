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

// ✅ CORS Dinamis
app.use(
  cors({
    origin: function (origin, callback) {
      // izinkan request tanpa origin (misalnya curl/postman)
      if (!origin) return callback(null, true);

      // izinkan localhost
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // izinkan semua subdomain vercel.app
      if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // kalau tidak match → tolak
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wilayah", wilayahRoutes);
app.use("/api/registrasi", registrasiRoutes);

// Middleware error handler
app.use(handleMongoDuplicateKeyError);

// MongoDB connection
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
