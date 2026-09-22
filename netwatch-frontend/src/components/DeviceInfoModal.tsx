import { type JSX } from 'react';
import type { Device, DeviceStatus, MonitorMethod, MonitoringResult } from '@/types';
import { Server, CheckCircle, AlertCircle, Clock, X, Activity, Globe, Shield, Network, Loader2, Cpu, HardDrive, Layers, Printer, Gauge, Edit } from 'lucide-react';
import { useDeviceMetrics, useAllMonitorResults } from '@/hooks/useApiData';

interface DeviceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onEdit?: (deviceId: string) => void;
}

export default function DeviceInfoModal({ isOpen, onClose, device, onEdit }: DeviceInfoModalProps) {
  const { data: deviceMetrics, isLoading: metricsLoading } = useDeviceMetrics(device?.id || '', {
    enabled: isOpen && !!device
  });

  // Fetch all monitor results at once using a single hook call
  const monitorIds = device?.monitors.map(m => m.id) || [];
  const { data: monitorResults = {}, isLoading: resultsLoading } = useAllMonitorResults(device?.id || '', monitorIds, {
    enabled: isOpen && !!device && monitorIds.length > 0
  });

  const loading = metricsLoading || resultsLoading;

  if (!isOpen || !device) return null;

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DOWN':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-seccol" />;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'DOWN':
        return 'text-red-600';
      default:
        return 'text-seccol';
    }
  };

  const getMonitorIcon = (method: MonitorMethod) => {
    switch (method) {
      case 'ICMP':
        return <Activity className="w-5 h-5 text-textcol" />;
      case 'TCP':
        return <Network className="w-5 h-5 text-textcol" />;
      case 'HTTP':
      case 'HTTPS':
        return <Globe className="w-5 h-5 text-textcol" />;
      case 'SNMP':
        return <Shield className="w-5 h-5 text-textcol" />;
      default:
        return <Activity className="w-5 h-5 text-textcol" />;
    }
  };

  const getMonitorDetails = (method: MonitorMethod, config: Record<string, unknown> | null, latestResult: MonitoringResult | undefined) => {
    const details: JSX.Element[] = [];

    if (method === 'ICMP' && latestResult && latestResult.latency !== null && latestResult.latency !== undefined) {
      details.push(
        <div key="ping" className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-textcol" />
          <span className="text-sm text-seccol font-brains">
            Ping: {latestResult.latency}ms
          </span>
        </div>
      );
    }

    if (method === 'TCP' && config?.port) {
      details.push(
        <div key="port" className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-textcol" />
          <span className="text-sm text-seccol font-brains">
            Port: {String(config.port)}
          </span>
        </div>
      );
    }

    if ((method === 'HTTP' || method === 'HTTPS') && config?.url) {
      details.push(
        <div key="url" className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-textcol" />
          <span className="text-sm text-seccol font-brains truncate max-w-xs">
            {String(config.url)}
          </span>
        </div>
      );
    }

    if (method === 'SNMP' && config?.community) {
      details.push(
        <div key="community" className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-textcol" />
          <span className="text-sm text-seccol font-brains">
            Community: {String(config.community)}
          </span>
        </div>
      );
    }

    return details;
  };

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur flex items-center justify-center z-2000">
      <div className="bg-cards border border-bordercol p-6 max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-textcol font-space">Device Information</h3>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(device.id);
                }}
                className="p-2 hover:bg-light rounded transition-colors cursor-pointer"
                title="Edit Device"
              >
                <Edit className="w-5 h-5 text-textcol" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-light rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-textcol" />
            </button>
          </div>
        </div>

        {/* Device Overview */}
        <div className="mb-6 p-4 bg-light border border-bordercol">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-cards border border-bordercol">
              <Server className="w-6 h-6 text-textcol" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-xl font-bold text-textcol font-space">{device.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium font-brains ${
                  device.status === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                  device.status === 'DOWN' ? 'bg-red-100 text-red-800' :
                  'bg-light text-seccol'
                }`}>
                  {device.status}
                </span>
              </div>
              <p className="text-sm text-seccol font-brains mb-1">{device.type}</p>
              <p className="text-sm text-seccol font-brains mb-1">{device.address}</p>
              <p className="text-xs text-seccol font-brains">
                Created: {new Date(device.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Device-Specific Metrics */}
        {metricsLoading ? (
          <div className="mb-6 p-4 bg-light border border-bordercol">
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-textcol animate-spin" />
              <span className="ml-2 text-sm text-seccol font-brains">Loading device metrics...</span>
            </div>
          </div>
        ) : deviceMetrics && device.type === 'PRINTER' ? (
          <div className="mb-6 p-4 bg-light border border-bordercol">
            <h4 className="text-md font-semibold text-textcol mb-4 font-space flex items-center">
              <Printer className="w-5 h-5 mr-2" />
              Printer Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-cards border border-bordercol">
                <div className="flex items-center space-x-2 mb-1">
                  <Gauge className="w-4 h-4 text-textcol" />
                  <span className="text-xs text-seccol font-brains">Page Count</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">{deviceMetrics.pageCount || 'N/A'}</p>
              </div>
              <div className="p-3 bg-cards border border-bordercol">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-textcol" />
                  <span className="text-xs text-seccol font-brains">Serial Number</span>
                </div>
                <p className="text-sm font-medium text-textcol font-space truncate">{deviceMetrics.serialNumber || 'N/A'}</p>
              </div>
            </div>
            {deviceMetrics.status && (
              <div className="mb-4 p-3 bg-cards border border-bordercol">
                <p className="text-xs text-seccol font-brains mb-2">Status: {deviceMetrics.status.availability}</p>
                <div className="flex flex-wrap gap-2">
                  {deviceMetrics.status.hasCriticalAlert && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-brains">Critical Alert</span>
                  )}
                  {deviceMetrics.status.hasNonCriticalAlert && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-brains">Non-Critical Alert</span>
                  )}
                  {deviceMetrics.status.isOffline && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-brains">Offline</span>
                  )}
                </div>
              </div>
            )}
            {deviceMetrics.cartridges && deviceMetrics.cartridges.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-textcol mb-2 font-space">Consumables</h5>
                <div className="space-y-2">
                  {deviceMetrics.cartridges.map((cartridge: any, index: number) => (
                    <div key={index} className="p-3 bg-cards border border-bordercol">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textcol font-space">{cartridge.name}</span>
                        <span className="text-sm text-seccol font-brains">{cartridge.level} / {cartridge.maxLevel}</span>
                      </div>
                      <div className="w-full bg-light rounded-full h-2">
                        <div 
                          className="bg-textcol h-2 rounded-full" 
                          style={{ width: `${(cartridge.level / cartridge.maxLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : deviceMetrics && device.type === 'ROUTER' ? (
          <div className="mb-6 p-4 bg-light border border-bordercol">
            <h4 className="text-md font-semibold text-textcol mb-4 font-space flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Router Metrics
            </h4>
            {deviceMetrics.resources ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-cards border border-bordercol">
                    <div className="flex items-center space-x-2 mb-1">
                      <Cpu className="w-4 h-4 text-textcol" />
                      <span className="text-xs text-seccol font-brains">CPU Usage</span>
                    </div>
                    <p className="text-lg font-bold text-textcol font-space">{deviceMetrics.resources.cpuUsage !== null ? `${deviceMetrics.resources.cpuUsage}%` : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-cards border border-bordercol">
                    <div className="flex items-center space-x-2 mb-1">
                      <HardDrive className="w-4 h-4 text-textcol" />
                      <span className="text-xs text-seccol font-brains">Memory Usage</span>
                    </div>
                    <p className="text-lg font-bold text-textcol font-space">{deviceMetrics.resources.memoryUsage !== null ? `${deviceMetrics.resources.memoryUsage.toFixed(1)}%` : 'N/A'}</p>
                  </div>
                </div>
                {deviceMetrics.resources.memoryTotal && (
                  <div className="mb-4 p-3 bg-cards border border-bordercol">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-seccol font-brains">Memory Used</span>
                      <span className="text-textcol font-space font-medium">
                        {deviceMetrics.resources.memoryUsed !== null ? `${(deviceMetrics.resources.memoryUsed / 1024 / 1024).toFixed(2)} MB` : 'N/A'} / {deviceMetrics.resources.memoryTotal !== null ? `${(deviceMetrics.resources.memoryTotal / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-seccol font-brains">No resource metrics available</div>
            )}
            {deviceMetrics.interfaces && deviceMetrics.interfaces.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-textcol mb-2 font-space">Interfaces ({deviceMetrics.interfaces.length})</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {deviceMetrics.interfaces.slice(0, 5).map((iface: any, index: number) => (
                    <div key={index} className="p-3 bg-cards border border-bordercol">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textcol font-space">{iface.name}</span>
                        <span className={`text-xs px-2 py-1 rounded font-brains ${
                          iface.operStatus === 'UP' ? 'bg-green-100 text-green-800' :
                          iface.operStatus === 'DOWN' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {iface.operStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-seccol font-brains">Type:</span>
                          <span className="text-textcol font-space ml-1">{iface.type}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Speed:</span>
                          <span className="text-textcol font-space ml-1">{iface.speedMbps} Mbps</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">MTU:</span>
                          <span className="text-textcol font-space ml-1">{iface.mtu}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Bytes In:</span>
                          <span className="text-textcol font-space ml-1">{iface.bytesIn}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Bytes Out:</span>
                          <span className="text-textcol font-space ml-1">{iface.bytesOut}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Errors:</span>
                          <span className="text-textcol font-space ml-1">{iface.inputErrors + iface.outputErrors}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {deviceMetrics.interfaces.length > 5 && (
                    <div className="text-center text-xs text-seccol font-brains">
                      +{deviceMetrics.interfaces.length - 5} more interfaces
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : deviceMetrics && device.type === 'SERVER' ? (
          <div className="mb-6 p-4 bg-light border border-bordercol">
            <h4 className="text-md font-semibold text-textcol mb-4 font-space flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Server Metrics
            </h4>
            
            {/* System Information */}
            <div className="mb-4 p-3 bg-cards border border-bordercol">
              <h5 className="text-sm font-medium text-textcol mb-2 font-space">System Information</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-seccol font-brains">Name:</span>
                  <span className="text-textcol font-space">{(deviceMetrics as any)?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-seccol font-brains">Uptime:</span>
                  <span className="text-textcol font-space">{(deviceMetrics as any)?.uptime ? `${Math.floor((deviceMetrics as any).uptime / 3600)}h ${Math.floor(((deviceMetrics as any).uptime % 3600) / 60)}m` : 'N/A'}</span>
                </div>
                {(deviceMetrics as any)?.location && (
                  <div className="flex justify-between">
                    <span className="text-seccol font-brains">Location:</span>
                    <span className="text-textcol font-space">{(deviceMetrics as any).location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            {(deviceMetrics as any)?.resources && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-cards border border-bordercol">
                    <div className="flex items-center space-x-2 mb-1">
                      <Cpu className="w-4 h-4 text-textcol" />
                      <span className="text-xs text-seccol font-brains">CPU Usage</span>
                    </div>
                    <p className="text-lg font-bold text-textcol font-space">{(deviceMetrics as any).resources.cpuUsage !== null ? `${(deviceMetrics as any).resources.cpuUsage.toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-cards border border-bordercol">
                    <div className="flex items-center space-x-2 mb-1">
                      <HardDrive className="w-4 h-4 text-textcol" />
                      <span className="text-xs text-seccol font-brains">Memory Usage</span>
                    </div>
                    <p className="text-lg font-bold text-textcol font-space">{(deviceMetrics as any).resources.memoryUsage !== null ? `${(deviceMetrics as any).resources.memoryUsage.toFixed(1)}%` : 'N/A'}</p>
                  </div>
                </div>
                {(deviceMetrics as any).resources.memoryTotal && (
                  <div className="mb-4 p-3 bg-cards border border-bordercol">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-seccol font-brains">Memory Used</span>
                      <span className="text-textcol font-space font-medium">
                        {(deviceMetrics as any).resources.memoryUsed !== null ? `${((deviceMetrics as any).resources.memoryUsed / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A'} / {(deviceMetrics as any).resources.memoryTotal !== null ? `${((deviceMetrics as any).resources.memoryTotal / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Disk Storage */}
            {(deviceMetrics as any)?.disks && (deviceMetrics as any).disks.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-textcol mb-2 font-space">Disk Storage ({(deviceMetrics as any).disks.length})</h5>
                <div className="space-y-2">
                  {(deviceMetrics as any).disks.map((disk: any, index: number) => (
                    <div key={index} className="p-3 bg-cards border border-bordercol">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textcol font-space">{disk.description || `Disk ${disk.index}`}</span>
                        <span className="text-sm text-seccol font-brains">{disk.usedGB?.toFixed(1)} / {disk.sizeGB?.toFixed(1)} GB</span>
                      </div>
                      <div className="w-full bg-light rounded-full h-2">
                        <div 
                          className="bg-textcol h-2 rounded-full" 
                          style={{ width: `${disk.usagePercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-seccol font-brains mt-1">
                        {disk.usagePercent?.toFixed(1)}% used
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Network Interfaces */}
            {(deviceMetrics as any)?.interfaces && (deviceMetrics as any).interfaces.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-textcol mb-2 font-space">Network Interfaces ({(deviceMetrics as any).interfaces.length})</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(deviceMetrics as any).interfaces.slice(0, 3).map((iface: any, index: number) => (
                    <div key={index} className="p-3 bg-cards border border-bordercol">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textcol font-space">{iface.name}</span>
                        <span className={`text-xs px-2 py-1 rounded font-brains ${
                          iface.operStatus === 'UP' ? 'bg-green-100 text-green-800' :
                          iface.operStatus === 'DOWN' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {iface.operStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-seccol font-brains">Speed:</span>
                          <span className="text-textcol font-space ml-1">{iface.speedMbps} Mbps</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Bytes In:</span>
                          <span className="text-textcol font-space ml-1">{iface.bytesIn}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Bytes Out:</span>
                          <span className="text-textcol font-space ml-1">{iface.bytesOut}</span>
                        </div>
                        <div>
                          <span className="text-seccol font-brains">Errors:</span>
                          <span className="text-textcol font-space ml-1">{iface.inputErrors + iface.outputErrors}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(deviceMetrics as any).interfaces.length > 3 && (
                    <div className="text-center text-xs text-seccol font-brains">
                      +{(deviceMetrics as any).interfaces.length - 3} more interfaces
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Monitors Section */}
        <div>
          <h4 className="text-md font-semibold text-textcol mb-4 font-space">Monitors ({device.monitors.length})</h4>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 bg-light border border-bordercol">
              <Loader2 className="w-6 h-6 text-textcol animate-spin" />
              <span className="ml-2 text-seccol font-brains">Loading monitor data...</span>
            </div>
          ) : device.monitors.length === 0 ? (
            <div className="text-center py-8 bg-light border border-bordercol">
              <Activity className="w-12 h-12 text-seccol mx-auto mb-3" />
              <p className="text-seccol font-brains">No monitors configured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {device.monitors.map((monitor) => {
                const results = monitorResults[monitor.id] || [];
                const latestResult = results.length > 0 ? results[0] : monitor.latestResult;
                
                return (
                  <div key={monitor.id} className="p-4 bg-light border border-bordercol">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getMonitorIcon(monitor.method)}
                        <div>
                          <h5 className="font-semibold text-textcol font-space">{monitor.method}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium font-brains ${
                            monitor.enabled ? 'bg-green-100 text-green-800' : 'bg-light text-seccol'
                          }`}>
                            {monitor.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(latestResult?.status || 'UNKNOWN')}
                        <span className={`text-sm font-medium font-brains ${getStatusColor(latestResult?.status || 'UNKNOWN')}`}>
                          {latestResult?.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>

                    {/* Monitor Configuration */}
                    {/* {monitor.config && Object.keys(monitor.config).length > 0 && (
                      <div className="mb-3 space-y-1">
                        {Object.entries(monitor.config).map(([key, value]) => (
                          <div key={key} className="text-xs text-seccol font-brains">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )} */}

                    {/* Monitor Details */}
                    <div className="flex flex-wrap gap-3">
                      {getMonitorDetails(monitor.method, monitor.config, latestResult)}
                    </div>

                    {/* Recent Results */}
                    {results.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-bordercol">
                        <h6 className="text-sm font-medium text-textcol mb-2 font-space">Recent Results ({results.length})</h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {results.slice(0, 5).map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-cards rounded border border-bordercol text-sm gap-3 overflow-x-auto">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(result.status)}
                                <span className={`font-medium font-brains ${getStatusColor(result.status)}`}>
                                  {result.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-seccol">
                                <span className="font-brains">{result.latency !== null ? `${result.latency}ms` : 'N/A'}</span>
                                <span className="font-brains">{new Date(result.checkedAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))}
                          {results.length > 5 && (
                            <div className="text-center text-xs text-seccol font-brains">
                              +{results.length - 5} more results
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-bordercol text-sm text-seccol font-brains">
                        No recent results available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}