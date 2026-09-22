import * as MonitorService from "../services/monitor.service.js";
import type { Request, Response } from "express";

export async function createMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitor = await MonitorService.createMonitor(userId, req.body);
    
    if (!monitor) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.status(201).json(monitor);
  } catch (error) {
    console.error("Failed to create monitor:", error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({ message: "A monitor with this method already exists for this device" });
    }
    
    return res.status(500).json({ message: "Failed to create monitor" });
  }
}

export async function getAllMonitorsController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitors = await MonitorService.getAllMonitors(userId);
    res.status(200).json(monitors);
  } catch (error) {
    console.error("Failed to get monitors:", error);
    return res.status(500).json({ message: "Failed to get monitors" });
  }
}

export async function getMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitorId = req.params.id as string;
    const monitor = await MonitorService.getMonitor(userId, monitorId);
    
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    
    res.status(200).json(monitor);
  } catch (error) {
    console.error("Failed to get monitor:", error);
    return res.status(500).json({ message: "Failed to get monitor" });
  }
}

export async function getMonitorResultsController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitorId = req.params.id as string;
    const results = await MonitorService.getMonitorResults(userId, monitorId);
    
    if (results === null) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    
    res.status(200).json(results);
  } catch (error) {
    console.error("Failed to get monitor results:", error);
    return res.status(500).json({ message: "Failed to get monitor results" });
  }
}

export async function updateMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitorId = req.params.id as string;
    const monitor = await MonitorService.updateMonitor(userId, monitorId, req.body);
    
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    
    res.status(200).json(monitor);
  } catch (error) {
    console.error("Failed to update monitor:", error);
    return res.status(500).json({ message: "Failed to update monitor" });
  }
}

export async function deleteMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const monitorId = req.params.id as string;
    const monitor = await MonitorService.deleteMonitor(userId, monitorId);
    
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    
    res.status(200).json({ message: "Monitor successfully deleted" });
  } catch (error) {
    console.error("Failed to delete monitor:", error);
    return res.status(500).json({ message: "Failed to delete monitor" });
  }
}