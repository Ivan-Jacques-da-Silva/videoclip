import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { SocialMediaService } from "./services/social-media";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Validate social media API credentials
const socialMediaService = SocialMediaService.getInstance();
socialMediaService.validateCredentials();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const server = await registerRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
  if (!process.env.DATABASE_URL) {
    log('⚠️  DATABASE_URL not configured. Please check your .env file.');
  }
  if (!socialMediaService.validateCredentials()) {
    log('⚠️  Some social media APIs not configured. Check API_SETUP.md for setup instructions.');
  }
});