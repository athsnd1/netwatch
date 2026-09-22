import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageInfo from "@/components/PageInfo";
import type { CreateDeviceRequest, DeviceType, MonitorMethod } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateDevice } from '@/hooks/useApiData';

export default function AddDevicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const createDeviceMutation = useCreateDevice();
  
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'SERVER' as DeviceType,
    address: ''
  });

  const [monitors, setMonitors] = useState<Array<{
    method: MonitorMethod;
    config: Record<string, unknown>;
  }>>([
    { method: 'ICMP', config: {} } // Default for SERVER type
  ]);

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
    setMonitors([...monitors, { method: defaultMethod, config: {} }]);
  };

  const removeMonitor = (index: number) => {
    if (monitors.length > 1) {
      setMonitors(monitors.filter((_, i) => i !== index));
    }
  };

  const handleMonitorMethodChange = (index: number, method: MonitorMethod) => {
    const validMethods = getValidMonitorMethods(deviceForm.type);
    if (!validMethods.includes(method)) {
      toast.error(`${method} is not supported for ${deviceForm.type}`);
      return;
    }
    const updatedMonitors = [...monitors];
    updatedMonitors[index] = { method, config: {} };
    setMonitors(updatedMonitors);
  };

  const handleDeviceTypeChange = (type: DeviceType) => {
    setDeviceForm({ ...deviceForm, type });
    // Reset monitors to only valid methods for the new device type
    const validMethods = getValidMonitorMethods(type);
    const defaultMethod = validMethods[0] as MonitorMethod;
    const updatedMonitors = monitors.map(monitor => ({
      method: validMethods.includes(monitor.method) ? monitor.method : defaultMethod,
      config: {}
    }));
    setMonitors(updatedMonitors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceForm.name || !deviceForm.address) {
      toast.error('Please fill in all device fields');
      return;
    }

    if (monitors.length === 0) {
      toast.error('Please add at least one monitor');
      return;
    }

    try {
      setLoading(true);
      const createRequest: CreateDeviceRequest = {
        ...deviceForm,
        monitors: monitors.map(m => ({
          method: m.method,
          config: Object.keys(m.config).length > 0 ? m.config : undefined
        }))
      };
      
      console.log('Creating device with request:', createRequest);
      
      await createDeviceMutation.mutateAsync(createRequest);
      toast.success('Device created successfully');
      navigate('/dashboard/devices');
    } catch (error) {
      console.error('Failed to create device:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error('Failed to create device');
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

  return (
    <div className="w-full py-4 px-1 h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="dashboard" currentPage="add device" pageTitle="Add Device" pageDesc="Add a new device to monitor."/>
      
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
                <div key={index} className="p-4 bg-light  border border-bordercol">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <label className="block text-sm font-medium text-seccol mb-2 font-brains">Monitor Method</label>
                      <select
                        className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space hover:bg-light cursor-pointer transition-colors"
                        value={monitor.method}
                        onChange={(e) => handleMonitorMethodChange(index, e.target.value as MonitorMethod)}
                      >
                        {getValidMonitorMethods(deviceForm.type).map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    {monitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMonitor(index)}
                        className="p-2 text-seccol hover:text-red-600 hover:bg-light  transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {getMonitorConfigFields(monitor.method, index)}
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
              {loading ? 'Creating Device...' : 'Create Device'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/devices')}
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
