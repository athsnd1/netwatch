import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageInfo from "@/components/PageInfo";
import type { Device, DeviceStatus } from '@/types';
import { Server, Plus, Trash2, Activity, CheckCircle, AlertCircle, Clock, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import DeviceInfoModal from '@/components/DeviceInfoModal';
import { useDevices, useDeleteDevice } from '@/hooks/useApiData';

export default function DevicesPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deviceInfoModalOpen, setDeviceInfoModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const navigate = useNavigate();

  const { data: devices = [], isLoading: loading, error } = useDevices();
  const deleteDeviceMutation = useDeleteDevice();

  const handleDelete = async (deviceId: string, deviceName: string) => {
    setDeviceToDelete({ id: deviceId, name: deviceName });
    setDeleteModalOpen(true);
  };

  const handleDeviceInfo = (device: Device) => {
    setSelectedDevice(device);
    setDeviceInfoModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;

    try {
      await deleteDeviceMutation.mutateAsync(deviceToDelete.id);
      toast.success('Device deleted successfully');
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Failed to delete device');
    } finally {
      setDeleteModalOpen(false);
      setDeviceToDelete(null);
    }
  };

  if (error) {
    toast.error('Failed to load devices');
  }

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
        <PageInfo prevPage="dashboard" currentPage="devices" pageTitle="Devices" pageDesc="Manage connected devices."/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textcol"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-1 pb-10 h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="dashboard" currentPage="devices" pageTitle="Devices" pageDesc="Manage connected devices."/>
      
      <div className="mt-6 pl-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-textcol font-space">Your Devices</h2>
          <button
            onClick={() => navigate('/dashboard/add')}
            className="flex items-center space-x-2 bg-textcol text-white px-4 py-2 hover:bg-hovercol transition-colors font-space cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add Device</span>
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-12 px-2 bg-cards  border border-bordercol">
            <Server className="w-16 h-16 text-seccol mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textcol mb-2 font-space">No devices yet</h3>
            <p className="text-seccol mb-4 font-brains">Start by adding your first device to monitor</p>
            <button
              onClick={() => navigate('/dashboard/add')}
              className="bg-textcol text-white px-6 py-2  hover:bg-hovercol transition-colors font-space"
            >
              Add Your First Device
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-cards p-4 sm:p-6 shadow-sm border border-bordercol hover:shadow-md transition-shadow cursor-pointer group overflow-x-auto" onClick={() => handleDeviceInfo(device)}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-light border-1 border-bordercol shrink-0">
                      <Server className="w-5 h-5 sm:w-6 sm:h-6 text-textcol" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <h3 className="text-base sm:text-lg font-semibold text-textcol font-space truncate">{device.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium font-brains ${getStatusColor(device.status)} w-fit`}>
                          {device.status}
                        </span>
                      </div>
                      <p className="text-sm text-seccol mt-1 font-brains truncate">{device.type}</p>
                      <p className="text-sm text-seccol font-brains truncate">{device.address}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusIcon(device.status)}
                        <span className="text-sm text-textcol font-brains">
                          {device.monitors.length} monitor{device.monitors.length !== 1 ? 's' : ''} configured
                        </span>
                        <span className="text-xs text-seccol font-brains opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                          Click for details
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:ml-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/devices/${device.id}`);
                      }}
                      className="p-2 text-seccol hover:text-textcol hover:bg-light border-1 border-bordercol cursor-pointer transition-all"
                      title="View Details"
                    >
                      <Activity className="w-5 h-5 text-green-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/devices/${device.id}/edit`);
                      }}
                      className="p-2 text-seccol hover:text-textcol hover:bg-light border-1 border-bordercol cursor-pointer transition-all"
                      title="Edit Device"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(device.id, device.name);
                      }}
                      className="p-2 text-seccol hover:text-red-600 hover:bg-light border-1 border-bordercol cursor-pointer transition-all"
                      title="Delete Device"
                    >
                      <Trash2 className="w-5 h-5 text-red-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeviceToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={deviceToDelete?.name || ''}
        itemType="Device"
      />
      
      <DeviceInfoModal
        isOpen={deviceInfoModalOpen}
        onClose={() => {
          setDeviceInfoModalOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onEdit={(deviceId) => navigate(`/dashboard/devices/${deviceId}/edit`)}
      />
    </div>
  );
}
