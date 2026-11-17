import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { neon } from "@neondatabase/serverless";
import { initializePostsTable } from "./models/Post.js";
import { createPostsRouter } from "./routes/posts.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

function createApp(sql) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.status(200).send("Welcome to the VVIT Experiment 25 Blog API.");
  });

  app.use("/api/v1/posts", createPostsRouter(sql));

  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ message: "Request body must contain valid JSON." });
    }

    if (err.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body is too large." });
    }

    if (err.statusCode === 503) {
      return res.status(503).json({ message: "The database is currently unavailable." });
    }

    if (err.statusCode === 500) {
      return res.status(500).json({ message: "A database query failed." });
    }

    console.error("Request failed:", err.message);
    return res.status(500).json({ message: "An unexpected server error occurred." });
  });

  return app;
}

async function startServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const sql = neon(process.env.DATABASE_URL);
  await initializePostsTable(sql);
  console.log("Connected to Neon PostgreSQL.");

  const app = createApp(sql);
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  if (err.message === "DATABASE_URL is required.") {
    console.error("Unable to start the API: add DATABASE_URL to backend/.env or the service environment.");
  } else {
    console.error("Unable to initialize Neon PostgreSQL. Check DATABASE_URL, network access, and database availability.");
  }
  process.exitCode = 1;
});
