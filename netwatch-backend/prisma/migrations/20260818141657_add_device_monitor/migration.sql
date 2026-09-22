/*
  Warnings:

  - You are about to drop the column `monitoringMethod` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "monitoringMethod";

-- CreateTable
CREATE TABLE "DeviceMonitor" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "method" "MonitoringMethod" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceMonitor_deviceId_method_key" ON "DeviceMonitor"("deviceId", "method");

-- AddForeignKey
ALTER TABLE "DeviceMonitor" ADD CONSTRAINT "DeviceMonitor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
