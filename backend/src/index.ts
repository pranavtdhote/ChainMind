import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import apiRouter from "./routes";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API routes mapping
app.use("/api", apiRouter);

// Basic health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, error: "Endpoint route not found" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Backend server error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

// Establish database connection and start Express server listener
const startServer = async () => {
  try {
    // Attempt Mongo connection (fails gracefully if DB isn't running)
    await connectDB();
    
    app.listen(port, () => {
      console.log(`[server]: ChainMind API is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
