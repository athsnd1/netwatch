import * as DashboardService from "../services/dashboard.service.js";
import type { Request, Response } from "express";

export async function getDashboardDataController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const dashboardData = await DashboardService.getDashboardData(userId);
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Failed to get dashboard data:", error);
    return res.status(500).json({ message: "Failed to get dashboard data" });
  }
}

export async function getDeviceRealTimeDataController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const deviceId = req.params.id as string;
    const realTimeData = await DashboardService.getDeviceRealTimeData(userId, deviceId);
    
    if (!realTimeData) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.status(200).json(realTimeData);
  } catch (error) {
    console.error("Failed to get device real-time data:", error);
    return res.status(500).json({ message: "Failed to get device real-time data" });
  }
}

export async function getMonitoringSummaryController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const summary = await DashboardService.getMonitoringSummary(userId);
    res.status(200).json(summary);
  } catch (error) {
    console.error("Failed to get monitoring summary:", error);
    return res.status(500).json({ message: "Failed to get monitoring summary" });
  }
}