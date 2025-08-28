// backend/api/index.js
import app from "../index.js";
import serverless from "serverless-http";

// bungkus express app untuk Vercel
const handler = serverless(app);
export default handler;