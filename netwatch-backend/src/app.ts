import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import deviceRoutes from "./routes/device.routes.js";
import monitorRoutes from "./routes/monitor.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import webserverRoutes from "./routes/webserver.routes.js";
import webhookRouter from "./routes/webhook.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/users", requireAuth, userRoutes);
app.use("/api/devices", requireAuth, deviceRoutes);
app.use("/api/monitors", requireAuth, monitorRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/webserver", requireAuth, webserverRoutes);
app.use("/api/webhooks", webhookRouter);

app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Server running!" });
});

export default app;