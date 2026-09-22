import type { DeviceStatus } from "../generated/prisma/enums.js";

export type MonitoringCheckResult = {
    status: DeviceStatus;
    latency: number | null;
};

export type SNMPCheckResult = MonitoringCheckResult & {
    value?: unknown;
};