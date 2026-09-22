import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PageInfo from "@/components/PageInfo";
import type { DeviceStatus } from '@/types';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Activity, Settings, Trash2, Play, Pause, Loader2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useDevice, useDeviceRealtime, useDeleteDevice, useUpdateMonitor, useDeleteMonitor } from '@/hooks/useApiData';

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMonitorModalOpen, setDeleteMonitorModalOpen] = useState(false);
  const [monitorToDelete, setMonitorToDelete] = useState<string | null>(null);
  const [testingMonitor, setTestingMonitor] = useState<string | null>(null);

  const { data: device, isLoading: loading, error: deviceError } = useDevice(id || '');
  const { data: realtimeData, error: realtimeError } = useDeviceRealtime(id || '');
  const deleteDeviceMutation = useDeleteDevice();
  const updateMonitorMutation = useUpdateMonitor();
  const deleteMonitorMutation = useDeleteMonitor();

  // Refetch data when component mounts to ensure fresh data
  useEffect(() => {
    if (id) {
      queryClient.refetchQueries({ queryKey: ['device', id] });
      queryClient.refetchQueries({ queryKey: ['deviceRealtime', id] });
    }
  }, [id, queryClient]);

  const handleDelete = async () => {
    if (!device || !id) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!device || !id) return;

    try {
      await deleteDeviceMutation.mutateAsync(id);
      toast.success('Device deleted successfully');
      navigate('/dashboard/devices');
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Failed to delete device');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleToggleMonitor = async (monitorId: string, currentEnabled: boolean) => {
    if (!id) return;

    try {
      await updateMonitorMutation.mutateAsync({ 
        deviceId: id, 
        monitorId, 
        data: { enabled: !currentEnabled } 
      });
      toast.success(`Monitor ${currentEnabled ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle monitor:', error);
      toast.error('Failed to toggle monitor');
    }
  };

  const handleDeleteMonitor = async (monitorId: string) => {
    if (!id) return;
    setMonitorToDelete(monitorId);
    setDeleteMonitorModalOpen(true);
  };

  const confirmDeleteMonitor = async () => {
    if (!id || !monitorToDelete) return;

    try {
      await deleteMonitorMutation.mutateAsync({ deviceId: id, monitorId: monitorToDelete });
      toast.success('Monitor deleted successfully');
    } catch (error) {
      console.error('Failed to delete monitor:', error);
      toast.error('Failed to delete monitor');
    } finally {
      setDeleteMonitorModalOpen(false);
      setMonitorToDelete(null);
    }
  };

  const handleTestMonitor = async (monitorId: string) => {
    if (!id) return;

    try {
      setTestingMonitor(monitorId);
      // TanStack Query will automatically refetch the data due to refetchInterval
      // This just shows a loading state for user feedback
      toast.success('Monitoring data refreshed');
    } catch (error) {
      console.error('Failed to refresh monitor data:', error);
      toast.error('Failed to refresh monitor data');
    } finally {
      setTestingMonitor(null);
    }
  };

  if (deviceError || realtimeError) {
    toast.error('Failed to load device data');
  }

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'DOWN':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-seccol" />;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800';
      case 'DOWN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-light text-seccol';
    }
  };

  if (loading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="devices" currentPage="details" pageTitle="Device Details" pageDesc="View device information and monitoring status."/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textcol"></div>
        </div>
      </div>
    );
  }

  if (!device && !loading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="devices" currentPage="details" pageTitle="Device Details" pageDesc="View device information and monitoring status."/>
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
      <PageInfo prevPage="devices" currentPage="details" pageTitle="Device Details" pageDesc="View device information and monitoring status."/>
      
      <div className="mt-6 space-y-6 pl-4">
        {/* Device Overview */}
        <div className="bg-cards p-4 sm:p-6 shadow-sm border border-bordercol">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-light border-1 border-bordercol shrink-0">
                {getStatusIcon(device?.status || 'UNKNOWN')}
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-textcol font-space truncate">{device?.name || 'Unknown Device'}</h2>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium font-brains ${getStatusColor(device?.status || 'UNKNOWN')} w-fit`}>
                    {device?.status || 'UNKNOWN'}
                  </span>
                </div>
                <p className="text-seccol mt-1 font-brains truncate">{device?.type || 'Unknown'}</p>
                <p className="text-seccol font-brains truncate">{device?.address || 'Unknown'}</p>
                <p className="text-sm text-seccol mt-2 font-brains">
                  Created: {device?.createdAt ? new Date(device.createdAt).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:justify-end">
              <button
                onClick={() => navigate('/dashboard/devices')}
                className="flex items-center space-x-2 px-4 py-2 border border-bordercol hover:bg-light transition-colors text-textcol font-space cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => navigate(`/dashboard/devices/${id}/edit`)}
                className="p-2 text-seccol hover:text-textcol bg-cards border-1 border-bordercol hover:bg-light transition-colors cursor-pointer"
                title="Edit Device"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-seccol hover:text-red-600 bg-cards border-1 border-bordercol hover:bg-light transition-colors cursor-pointer"
                title="Delete Device"
              >
                <Trash2 className="w-5 h-5 text-red-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Monitoring Data */}
        {realtimeData && (
          <div className="bg-cards p-4 sm:p-6 shadow-sm border border-bordercol">
            <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Real-time Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 sm:p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Device Status</span>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-textcol font-space">{realtimeData.device.status}</p>
              </div>
              <div className="p-3 sm:p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Active Monitors</span>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-textcol font-space">
                  {realtimeData.monitors.filter(m => m.enabled).length} / {realtimeData.monitors.length}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Last Updated</span>
                </div>
                <p className="text-lg sm:text-lg text-textcol font-space font-semibold">
                  {realtimeData.monitors[0]?.latestResult 
                    ? new Date(realtimeData.monitors[0].latestResult.checkedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monitors */}
        <div className="bg-cards p-4 sm:p-6 shadow-sm border border-bordercol">
          <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Monitors</h3>

          {device?.monitors.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-seccol mx-auto mb-3" />
              <p className="text-seccol font-brains">No monitors configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {device?.monitors.map((monitor) => {
                const realtimeMonitor = realtimeData?.monitors.find(m => m.id === monitor.id);
                const latestResult = realtimeMonitor?.latestResult;

                return (
                  <div key={monitor.id} className="p-3 sm:p-4 bg-light border border-bordercol">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                          <h4 className="font-semibold text-textcol font-space truncate">{monitor.method}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium font-brains w-fit ${
                            monitor.enabled ? 'bg-green-100 text-green-800' : 'bg-light text-seccol'
                          }`}>
                            {monitor.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        
                        {monitor.config && Object.keys(monitor.config).length > 0 && (
                          <div className="text-sm text-seccol font-brains mb-2 flex flex-wrap gap-x-3 gap-y-1">
                            {Object.entries(monitor.config).map(([key, value]) => (
                              <span key={key} className="truncate">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        {latestResult && (
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(latestResult.status as DeviceStatus)}
                              <span className={`font-medium font-brains ${getStatusColor(latestResult.status as DeviceStatus)} px-1 py-0.5 rounded-lg`}>
                                {latestResult.status}
                              </span>
                            </div>
                            {latestResult.latency !== null && (
                              <span className="text-seccol font-brains">
                                Latency: {latestResult.latency}ms
                              </span>
                            )}
                            <span className="text-seccol font-brains">
                              {new Date(latestResult.checkedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 sm:justify-end">
                        <button
                          onClick={() => handleTestMonitor(monitor.id)}
                          disabled={testingMonitor === monitor.id}
                          className="p-2 hover:text-textcol hover:bg-light transition-colors cursor-pointer bg-cards border border-bordercol text-seccol disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Refresh Data"
                        >
                          {testingMonitor === monitor.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Activity className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleMonitor(monitor.id, monitor.enabled)}
                          className="p-2 hover:text-textcol hover:bg-light transition-colors cursor-pointer bg-cards border border-bordercol text-seccol"
                          title={monitor.enabled ? 'Disable Monitor' : 'Enable Monitor'}
                        >
                          {monitor.enabled ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteMonitor(monitor.id)}
                          className="p-2 text-seccol hover:text-red-600 hover:bg-light transition-colors cursor-pointer bg-cards border border-bordercol"
                          title="Delete Monitor"
                        >
                          <Trash2 className="w-5 h-5 text-red-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={device?.name || ''}
        itemType="Device"
      />
      
      <ConfirmDeleteModal
        isOpen={deleteMonitorModalOpen}
        onClose={() => {
          setDeleteMonitorModalOpen(false);
          setMonitorToDelete(null);
        }}
        onConfirm={confirmDeleteMonitor}
        itemName="this monitor"
        itemType="Monitor"
      />
    </div>
  );
}