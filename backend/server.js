
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "");
const configuredOrigins = process.env.CORS_ORIGIN;

const allowedOrigins = (configuredOrigins || (isProduction ? "" : "http://localhost:5173"))
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => origin.replace(/\/+$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");
if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  return res.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? "ok" : "unavailable",
  });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to StudyBuddy API!");
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body contains invalid JSON" });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }

  if (error?.message === "Origin not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  console.error(`Request failed (${error?.name || "Error"})`);
  return res.status(500).json({ message: "An unexpected server error occurred" });
});

async function startServer() {
  const requiredVariables = ["MONGODB_URI", "JWT_SECRET"];
  if (isProduction) {
    requiredVariables.push("FRONTEND_URL", "CORS_ORIGIN");
  }

  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]
  );

  if (missingVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  if (isProduction) {
    const invalidOrigins = allowedOrigins.filter((origin) => {
      try {
        const parsedOrigin = new URL(origin);
        return (
          !["http:", "https:"].includes(parsedOrigin.protocol) ||
          parsedOrigin.origin !== origin
        );
      } catch {
        return true;
      }
    });

    let frontendUrlIsValid = false;
    try {
      const parsedFrontendUrl = new URL(frontendUrl);
      frontendUrlIsValid =
        ["http:", "https:"].includes(parsedFrontendUrl.protocol) &&
        parsedFrontendUrl.origin === frontendUrl &&
        parsedFrontendUrl.pathname === "/";
    } catch {
      frontendUrlIsValid = false;
    }

    if (invalidOrigins.length > 0 || !frontendUrlIsValid) {
      console.error(
        `Invalid production URL configuration: ${
          invalidOrigins.length > 0 ? "CORS_ORIGIN " : ""
        }${!frontendUrlIsValid ? "FRONTEND_URL" : ""}`.trim()
      );
      process.exitCode = 1;
      return;
    }
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`StudyBuddy server running on port ${port}`);
    });
  } catch (error) {
    console.error(`StudyBuddy server startup failed (${error?.name || "Error"})`);
    process.exitCode = 1;
  }
}

startServer();
