import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "../routes/authRoutes.js";
import wilayahRoutes from "../routes/wilayahRoutes.js";
import registrasiRoutes from "../routes/registrasiRoutes.js";
import { handleMongoDuplicateKeyError } from "../middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

// ✅ Export Express app for Vercel
export default app;
