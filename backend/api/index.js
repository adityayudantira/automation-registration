import app from "../index.js";
import serverless from "serverless-http";

const handler = serverless(app);
export default handler;

console.log("MONGO_URI (sanitized):", process.env.MONGO_URI?.replace(/\/\/.*@/, "//<hidden>@"));
