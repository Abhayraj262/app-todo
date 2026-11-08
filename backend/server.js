// Express API entry: JSON body, CORS for the Next.js origin, cookie-based JWT auth, MongoDB tasks.
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// Browser must send cookies on cross-origin requests in dev; in prod the Netlify proxy keeps /api same-origin.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
// Used by Render and manual checks; no auth required.
app.get("/api/health", (req, res) => res.json({ success: true, message: "OK", data: null }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

try {
  await connectDb(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
