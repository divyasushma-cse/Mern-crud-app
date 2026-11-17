import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import postsRouter from "./routes/posts.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).send("Welcome to the VVIT Experiment 25 Blog API.");
});

app.use("/api/v1/posts", postsRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "The database is currently unavailable." });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  console.error("Request failed:", err.message);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required.");
  }

  const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.MONGO_URI, options);
  console.log("Connected to MongoDB.");

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  if (err.message === "MONGO_URI is required.") {
    console.error("Unable to start the API: add MONGO_URI to backend/.env.");
  } else {
    console.error("Unable to connect to MongoDB. Check backend/.env, network access, and database availability.");
  }
  process.exitCode = 1;
});
