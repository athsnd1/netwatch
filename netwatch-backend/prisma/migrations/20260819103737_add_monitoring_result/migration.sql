-- CreateTable
CREATE TABLE "MonitoringResult" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL,
    "latency" DOUBLE PRECISION,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringResult_monitorId_checkedAt_idx" ON "MonitoringResult"("monitorId", "checkedAt");

-- AddForeignKey
ALTER TABLE "MonitoringResult" ADD CONSTRAINT "MonitoringResult_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "DeviceMonitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
