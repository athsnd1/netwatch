-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ROUTER', 'SERVER', 'WEB_SERVER', 'PRINTER', 'PC', 'PHONE');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('UNKNOWN', 'HEALTHY', 'DOWN');

-- CreateEnum
CREATE TYPE "MonitoringMethod" AS ENUM ('ICMP', 'TCP', 'HTTP', 'HTTPS', 'SNMP');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "address" TEXT NOT NULL,
    "monitoringMethod" "MonitoringMethod" NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
