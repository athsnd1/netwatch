-- DropForeignKey
ALTER TABLE "DeviceMonitor" DROP CONSTRAINT "DeviceMonitor_deviceId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceMonitor" ADD CONSTRAINT "DeviceMonitor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
