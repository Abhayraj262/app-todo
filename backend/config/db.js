// Single MongoDB connection; server exits on startup if MONGODB_URI is missing.
import mongoose from "mongoose";

export async function connectDb(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri);
}
