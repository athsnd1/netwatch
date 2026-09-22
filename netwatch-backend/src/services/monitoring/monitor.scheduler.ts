import cron from "node-cron";
import prisma from "../../lib/prisma.js";
import { runMonitor } from "./monitoring.service.js";

export function startMonitorScheduler() {
  cron.schedule("*/30 * * * * *", async () => {
    console.log("Running device monitors...");

    const monitors = await prisma.deviceMonitor.findMany({
      where: {
        enabled: true,
      },
    });

    for (const monitor of monitors) {
      try {
        await runMonitor(monitor.id);
      } catch (error) {
        console.error(
          `Failed to run monitor ${monitor.id}:`,
          error
        );
      }
    }
  });
}