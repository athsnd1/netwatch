import * as WebServerService from "../services/webserver.service.js";
import type { Request, Response } from "express";

export async function checkWebServerController(req: Request, res: Response) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const result = await WebServerService.checkWebServer(url);
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to check web server:", error);
    return res.status(500).json({ message: "Failed to check web server" });
  }
}

export async function getWebServerMetricsController(req: Request, res: Response) {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: "URL is required" });
    }

    const metrics = await WebServerService.getWebServerMetrics(url);
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Failed to get web server metrics:", error);
    return res.status(500).json({ message: "Failed to get web server metrics" });
  }
}

export async function monitorWebServerController(req: Request, res: Response) {
  try {
    const { url, duration, interval } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const result = await WebServerService.monitorWebServer(
      url,
      duration || 60000,
      interval || 5000
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to monitor web server:", error);
    return res.status(500).json({ message: "Failed to monitor web server" });
  }
}