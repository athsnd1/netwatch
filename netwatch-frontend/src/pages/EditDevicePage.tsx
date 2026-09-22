import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PageInfo from "@/components/PageInfo";
import type { DeviceType, MonitorMethod, UpdateDeviceRequest, UpdateMonitorRequest, CreateMonitorRequest } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDevice, useUpdateDevice, useUpdateMonitor, useAddMonitor, useDeleteMonitor } from '@/hooks/useApiData';

export default function EditDevicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const updateDeviceMutation = useUpdateDevice();
  const updateMonitorMutation = useUpdateMonitor();
  const addMonitorMutation = useAddMonitor();
  const deleteMonitorMutation = useDeleteMonitor();
  
  const { data: device, isLoading: deviceLoading } = useDevice(id || '');
  
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'SERVER' as DeviceType,
    address: ''
  });

  const [monitors, setMonitors] = useState<Array<{
    id: string;
    method: MonitorMethod;
    config: Record<string, unknown>;
    enabled: boolean;
  }>>([]);

  const deviceTypes: DeviceType[] = ['ROUTER', 'SERVER', 'WEB_SERVER', 'PRINTER', 'PC', 'PHONE'];

  // Define valid monitor methods for each device type
  const getValidMonitorMethods = (deviceType: DeviceType): MonitorMethod[] => {
    switch (deviceType) {
      case 'ROUTER':
        return ['ICMP', 'TCP', 'SNMP'];
      case 'SERVER':
        return ['ICMP', 'TCP', 'HTTP', 'HTTPS', 'SNMP'];
      case 'WEB_SERVER':
        return ['ICMP', 'TCP', 'HTTP', 'HTTPS'];
      case 'PRINTER':
        return ['ICMP', 'SNMP'];
      case 'PC':
        return ['ICMP', 'TCP', 'HTTP', 'HTTPS'];
      case 'PHONE':
        return ['ICMP', 'TCP'];
      default:
        return ['ICMP'];
    }
  };

  // Initialize form with device data when it loads
  useEffect(() => {
    if (device) {
      setDeviceForm({
        name: device.name,
        type: device.type,
        address: device.address
      });
      setMonitors(device.monitors.map(monitor => ({
        id: monitor.id,
        method: monitor.method,
        config: monitor.config || {},
        enabled: monitor.enabled
      })));
    }
  }, [device]);

  const handleMonitorConfigChange = (index: number, key: string, value: string | number) => {
    const updatedMonitors = [...monitors];
    updatedMonitors[index] = {
      ...updatedMonitors[index],
      config: {
        ...updatedMonitors[index].config,
        [key]: value
      }
    };
    setMonitors(updatedMonitors);
  };

  const addMonitor = () => {
    const validMethods = getValidMonitorMethods(deviceForm.type);
    const defaultMethod = validMethods[0] as MonitorMethod;
    
    // Only add config for methods that require it, and only if we have valid data
    let config: Record<string, unknown> = {};
    
    if (defaultMethod === 'TCP') {
      // TCP requires a port - prompt user or use default
      config = { port: 80 }; // minimal default
    } else if (defaultMethod === 'HTTP' || defaultMethod === 'HTTPS') {
      // Only add URL if we have a valid address
      if (deviceForm.address) {
        const protocol = defaultMethod === 'HTTP' ? 'http' : 'https';
        // Try to construct a reasonable URL from the address
        let url = deviceForm.address;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `${protocol}://${url}`;
        }
        config = { url };
      }
    } else if (defaultMethod === 'SNMP') {
      config = { community: 'public' }; // standard default
    }
    // ICMP doesn't need config, keep empty object
    
    // Add monitor to local state with temporary ID (will be replaced with real ID on update)
    setMonitors([...monitors, {
      id: `temp-${Date.now()}`, // Temporary ID for UI
      method: defaultMethod,
      config: config,
      enabled: true
    }]);
  };

  const removeMonitor = async (index: number) => {
    const monitorToRemove = monitors[index];
    
    // If it's a temporary ID (newly added monitor), just remove from local state
    if (monitorToRemove.id.startsWith('temp-')) {
      setMonitors(monitors.filter((_, i) => i !== index));
      return;
    }
    
    // If it's a real ID, delete from server
    if (!id) return;
    
    try {
      await deleteMonitorMutation.mutateAsync({
        deviceId: id,
        monitorId: monitorToRemove.id
      });
      
      // Remove the monitor from local state
      setMonitors(monitors.filter((_, i) => i !== index));
      
      toast.success('Monitor removed successfully');
    } catch (error) {
      console.error('Failed to remove monitor:', error);
      toast.error('Failed to remove monitor');
    }
  };

  const handleMonitorMethodChange = (index: number, method: MonitorMethod) => {
    const validMethods = getValidMonitorMethods(deviceForm.type);
    if (!validMethods.includes(method)) {
      toast.error(`${method} is not supported for ${deviceForm.type}`);
      return;
    }
    const updatedMonitors = [...monitors];
    updatedMonitors[index] = { 
      ...updatedMonitors[index], 
      method, 
      config: {} 
    };
    setMonitors(updatedMonitors);
  };

  const handleDeviceTypeChange = (type: DeviceType) => {
    setDeviceForm({ ...deviceForm, type });
    // Reset monitors to only valid methods for the new device type
    const validMethods = getValidMonitorMethods(type);
    const updatedMonitors = monitors.map(monitor => ({
      ...monitor,
      method: validMethods.includes(monitor.method) ? monitor.method : validMethods[0] as MonitorMethod,
      config: {}
    }));
    setMonitors(updatedMonitors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('Device ID is required');
      return;
    }

    if (!deviceForm.name || !deviceForm.address) {
      toast.error('Please fill in all device fields');
      return;
    }

    try {
      setLoading(true);
      
      // Update device information
      const deviceUpdateData: UpdateDeviceRequest = {
        name: deviceForm.name,
        type: deviceForm.type,
        address: deviceForm.address
      };
      
      await updateDeviceMutation.mutateAsync({ id, data: deviceUpdateData });
      
      // Check for duplicate monitor methods
      const monitorMethods = monitors.map(m => m.method);
      const uniqueMethods = new Set(monitorMethods);
      
      if (monitorMethods.length !== uniqueMethods.size) {
        const duplicates = monitorMethods.filter((item, index) => monitorMethods.indexOf(item) !== index);
        toast.error(`Duplicate monitor types detected: ${[...new Set(duplicates)].join(', ')}. Each monitor type can only be used once per device.`);
        setLoading(false);
        return;
      }
      
      // Process monitors: create new ones, update existing ones
      for (const monitor of monitors) {
        // Check if this is a temporary ID (new monitor added in UI)
        if (monitor.id.startsWith('temp-')) {
          // Create new monitor
          const monitorData: CreateMonitorRequest = {
            method: monitor.method,
            config: Object.keys(monitor.config).length > 0 ? monitor.config : undefined
          };
          
          const newMonitor = await addMonitorMutation.mutateAsync({
            deviceId: id,
            data: monitorData
          });
          
          // Update local state with real ID
          setMonitors(prevMonitors => 
            prevMonitors.map(m => 
              m.id === monitor.id 
                ? { ...m, id: newMonitor.id }
                : m
            )
          );
        } else {
          // Update existing monitor
          const monitorUpdateData: UpdateMonitorRequest = {
            config: Object.keys(monitor.config).length > 0 ? monitor.config : undefined,
            enabled: monitor.enabled
          };
          
          await updateMonitorMutation.mutateAsync({ 
            deviceId: id, 
            monitorId: monitor.id, 
            data: monitorUpdateData 
          });
        }
      }
      
      // Force refetch device data to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['device', id] });
      await queryClient.refetchQueries({ queryKey: ['device', id] });
      
      toast.success('Device updated successfully');
      navigate(`/dashboard/devices/${id}`);
    } catch (error) {
      console.error('Failed to update device:', error);
      toast.error('Failed to update device');
    } finally {
      setLoading(false);
    }
  };

  const getMonitorConfigFields = (method: MonitorMethod, index: number) => {
    switch (method) {
      case 'TCP':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-seccol font-brains">Port</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
              placeholder="80"
              value={monitors[index]?.config?.port as number || ''}
              onChange={(e) => handleMonitorConfigChange(index, 'port', parseInt(e.target.value))}
            />
          </div>
        );
      case 'HTTP':
      case 'HTTPS':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-seccol font-brains">URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
              placeholder={method === 'HTTP' ? 'http://example.com' : 'https://example.com'}
              value={monitors[index]?.config?.url as string || ''}
              onChange={(e) => handleMonitorConfigChange(index, 'url', e.target.value)}
            />
          </div>
        );
      case 'SNMP':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-seccol font-brains">Community</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
              placeholder="public"
              value={monitors[index]?.config?.community as string || ''}
              onChange={(e) => handleMonitorConfigChange(index, 'community', e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (deviceLoading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="devices" currentPage="edit device" pageTitle="Edit Device" pageDesc="Modify device configuration."/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textcol"></div>
        </div>
      </div>
    );
  }

  if (!device && !deviceLoading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="devices" currentPage="edit device" pageTitle="Edit Device" pageDesc="Modify device configuration."/>
        <div className="text-center py-12 bg-cards  border border-bordercol">
          <h3 className="text-lg font-medium text-textcol mb-2 font-space">Device not found</h3>
          <button
            onClick={() => navigate('/dashboard/devices')}
            className="mt-4 bg-textcol text-white px-6 py-2  hover:bg-hovercol transition-colors font-space"
          >
            Back to Devices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-1 h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="devices" currentPage="edit device" pageTitle="Edit Device" pageDesc="Modify device configuration."/>
      
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-6 pl-4">
          {/* Device Information */}
          <div className="bg-cards  p-6 shadow-sm border border-bordercol">
            <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Device Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-seccol mb-2 font-brains">Device Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
                  placeholder="My Server"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-seccol mb-2 font-brains">Device Type</label>
                <select
                  className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space hover:bg-light cursor-pointer transition-colors"
                  value={deviceForm.type}
                  onChange={(e) => handleDeviceTypeChange(e.target.value as DeviceType)}
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-seccol mb-2 font-brains">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
                  placeholder="192.168.1.1 or example.com"
                  value={deviceForm.address}
                  onChange={(e) => setDeviceForm({ ...deviceForm, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Monitors */}
          <div className="bg-cards  p-6 shadow-sm border border-bordercol">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textcol font-space">Monitors</h3>
              <button
                type="button"
                onClick={addMonitor}
                className="flex items-center space-x-2 text-textcol hover:text-hovercol font-space cursor-pointer transition-colors "
              >
                <Plus className="w-5 h-5" />
                <span>Add Monitor</span>
              </button>
            </div>

            <div className="space-y-4">
              {monitors.map((monitor, index) => (
                <div key={`${monitor.id}-${index}`} className="p-4 bg-light  border border-bordercol">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <label className="block text-sm font-medium text-seccol mb-2 font-brains">Monitor Method</label>
                      <select
                        className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space hover:bg-light cursor-pointer transition-colors"
                        value={monitor.method}
                        onChange={(e) => handleMonitorMethodChange(index, e.target.value as MonitorMethod)}
                      >
                        {getValidMonitorMethods(deviceForm.type).map((method, idx) => (
                          <option key={`${method}-${idx}`} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMonitor(index)}
                      className="p-2 text-seccol hover:text-red-600 hover:bg-light  transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {getMonitorConfigFields(monitor.method, index)}

                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`monitor-enabled-${monitor.id}-${index}`}
                      checked={monitor.enabled}
                      onChange={(e) => {
                        const updatedMonitors = [...monitors];
                        updatedMonitors[index] = { ...updatedMonitors[index], enabled: e.target.checked };
                        setMonitors(updatedMonitors);
                      }}
                      className="w-4 h-4 text-black border-bordercol focus:ring-black accent-black ml-0.5"
                    />
                    <label htmlFor={`monitor-enabled-${monitor.id}-${index}`} className="text-sm text-seccol font-brains">
                      Enable Monitor
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-textcol text-white px-6 py-3  hover:bg-hovercol transition-colors font-space disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Updating Device...' : 'Update Device'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/devices/${id}`)}
              className="px-6 py-3 border border-bordercol  hover:bg-light transition-colors text-textcol font-space cursor-pointer bg-cards"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}