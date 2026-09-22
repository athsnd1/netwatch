import "dotenv/config";
import app from "./app.js";
import { startMonitorScheduler } from "./services/monitoring/monitor.scheduler.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`NetWatch Server started on port ${PORT}`);
});

startMonitorScheduler();