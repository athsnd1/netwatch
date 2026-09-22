import { useState } from 'react';
import PageInfo from "@/components/PageInfo";
import type { DeviceStatus } from '@/types';
import { CheckCircle, AlertCircle, Clock, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLogs } from '@/hooks/useApiData';

export default function LogsPage() {
  const [filter, setFilter] = useState<'ALL' | 'HEALTHY' | 'DOWN' | 'UNKNOWN'>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const { data: allResults = [], isLoading: loading, error } = useLogs();

  if (error) {
    toast.error('Failed to load logs');
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
        return 'text-green-600';
      case 'DOWN':
        return 'text-red-600';
      default:
        return 'text-seccol';
    }
  };

  const filteredResults = filter === 'ALL' 
    ? allResults 
    : allResults.filter(item => item.result.status === filter);

  if (loading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="dashboard" currentPage="logs" pageTitle="Logs" pageDesc="View your activity logs."/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textcol"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-1 overflow-x-auto h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="dashboard" currentPage="logs" pageTitle="Logs" pageDesc="View your activity logs."/>
      
      <div className="mt-6 pl-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-textcol font-space">Monitoring Results</h2>
          
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-bordercol  bg-cards hover:bg-light transition-colors text-textcol font-space text-md"
            >
              <Filter className="w-5 h-5" />
              <span>Filter: {filter}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-cards border border-bordercol  shadow-lg z-10">
                {(['ALL', 'HEALTHY', 'DOWN', 'UNKNOWN'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilter(status);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-light transition-colors text-textcol font-brains"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12 bg-cards  border border-bordercol">
            <Clock className="w-16 h-16 text-seccol mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textcol mb-2 font-space">No logs yet</h3>
            <p className="text-seccol font-brains">Monitoring results will appear here once devices are checked</p>
          </div>
        ) : (
          <div className="bg-cards  border border-bordercol overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light border-b-1 border-bordercol">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Monitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Latency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-seccol uppercase tracking-wider font-brains">Checked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bordercol">
                  {filteredResults.map((item, index) => (
                    <tr key={index} className="hover:bg-light transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(item.result.status)}
                          <span className="ml-2 text-sm font-medium text-textcol font-space">{item.deviceName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-seccol font-brains">{item.deviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-seccol font-brains">{item.monitorMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium font-brains ${getStatusColor(item.result.status)}`}>
                          {item.result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-seccol font-brains">
                        {item.result.latency !== null ? `${item.result.latency}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-seccol font-brains">
                        {new Date(item.result.checkedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
