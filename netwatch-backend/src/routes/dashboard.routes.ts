import { Router } from "express";
import * as DashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/overview", DashboardController.getDashboardDataController);

router.get("/summary", DashboardController.getMonitoringSummaryController);

router.get("/devices/:id/realtime", DashboardController.getDeviceRealTimeDataController);

export default router;