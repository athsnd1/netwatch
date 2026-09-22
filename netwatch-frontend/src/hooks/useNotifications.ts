import { useEffect } from 'react';
import { useDevices } from './useApiData';
import type { DeviceStatus } from '@/types';
import toast from 'react-hot-toast';

// Global state to prevent duplicate notifications across component instances
const globalDeviceStatusesRef = new Map<string, DeviceStatus>();
const processedChangesRef = new Set<string>();

export function useNotifications() {
  const { data: devices } = useDevices();
  
  // Device status change notifications (prevent duplicates)
  useEffect(() => {
    if (!devices) return;
    
    // Process device status changes
    const changesToProcess: Array<{device: any, previousStatus: DeviceStatus}> = [];
    
    devices.forEach(device => {
      const previousStatus = globalDeviceStatusesRef.get(device.id);
      
      // Only process if we have a previous status and it changed
      if (previousStatus && previousStatus !== device.status) {
        changesToProcess.push({ device, previousStatus });
      }
      
      // Update global status
      globalDeviceStatusesRef.set(device.id, device.status);
    });
    
    // Process notifications after all status updates are done
    changesToProcess.forEach(({ device, previousStatus }) => {
      // Create a unique change identifier to prevent duplicate notifications
      const changeKey = `${device.id}-${device.status}-${Date.now()}`;
      
      // Skip if we've already processed this exact change
      if (processedChangesRef.has(changeKey)) return;
      
      processedChangesRef.add(changeKey);
      
      // Clean up old change keys (keep only last 50 to prevent memory issues)
      if (processedChangesRef.size > 50) {
        const keysArray = Array.from(processedChangesRef);
        processedChangesRef.clear();
        keysArray.slice(-50).forEach(key => processedChangesRef.add(key));
      }
      
      // Notify on status change - ONE toast per device
      if (device.status === 'DOWN' && previousStatus === 'HEALTHY') {
        toast.error(`${device.name} is now DOWN`, {
          duration: 5000,
          id: `device-status-${device.id}`
        });
      } else if (device.status === 'HEALTHY' && previousStatus === 'DOWN') {
        toast.success(`${device.name} is now HEALTHY`, {
          duration: 5000,
          id: `device-status-${device.id}`
        });
      } else if (device.status === 'UNKNOWN' && previousStatus !== 'UNKNOWN') {
        toast(`${device.name} status is now UNKNOWN`, {
          duration: 5000,
          id: `device-status-${device.id}`
        });
      }
    });
  }, [devices]);
}