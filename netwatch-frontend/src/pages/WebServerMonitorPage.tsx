import { useState } from 'react';
import PageInfo from "@/components/PageInfo";
import { webserverApi } from '@/api';
import type { WebServerCheckResult, WebServerMetrics, WebServerMonitorResult, DeviceStatus } from '@/types';
import { Activity, Globe, Clock, TrendingUp, CheckCircle, AlertCircle, Play, BarChart3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/react';

export default function WebServerMonitorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'check' | 'metrics' | 'monitor' | null>(null);
  const [checkResult, setCheckResult] = useState<WebServerCheckResult | null>(null);
  const [metrics, setMetrics] = useState<WebServerMetrics | null>(null);
  const [monitorResult, setMonitorResult] = useState<WebServerMonitorResult | null>(null);
  const [duration, setDuration] = useState(10000); // 10 seconds default for testing
  const [interval, setInterval] = useState(2000); // 2 seconds default for testing
  const { getToken } = useAuth();

  const handleSingleCheck = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setLoadingAction('check');
      setMetrics(null);
      setMonitorResult(null);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const result = await webserverApi.check({ url }, token);
      setCheckResult(result);
      toast.success('Health check completed');
    } catch (error) {
      console.error('Failed to check web server:', error);
      toast.error('Failed to check web server');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleGetMetrics = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const toastId = toast.loading(`Retrieving metrics...`);
      setLoadingAction('metrics');
      setCheckResult(null);
      setMonitorResult(null);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const result = await webserverApi.getMetrics(url, token);
      setMetrics(result);
      toast.success('Metrics retrieved', { id: toastId });
    } catch (error) {
      console.error('Failed to get metrics:', error);
      toast.error('Failed to get metrics');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleContinuousMonitor = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setLoadingAction('monitor');
      setCheckResult(null);
      setMetrics(null);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const toastId = toast.loading(`Starting ${duration}ms monitoring...`);
      const result = await webserverApi.monitor({ url, duration, interval }, token);
      setMonitorResult(result);
      toast.success('Monitoring completed', { id: toastId });
    } catch (error) {
      console.error('Failed to monitor web server:', error);
      toast.error('Failed to monitor web server');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

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

  const formatPercent = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return 'N/A';
    const normalizedValue = value >= 0 && value <= 1 ? value * 100 : value;
    return `${normalizedValue.toFixed(2)}%`;
  };

  return (
    <div className="w-full py-4 px-1 h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="dashboard" currentPage="web server" pageTitle="Web Server Monitor" pageDesc="Monitor web servers and local development services."/>
      
      <div className="mt-6 space-y-6 pl-4">
        {/* URL Input */}
        <div className="bg-cards  p-6 shadow-sm border border-bordercol">
          <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Web Server URL</h3>
          <div className="flex space-x-4">
            <input
              type="url"
              className="flex-1 px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
              placeholder="http://localhost:5173 or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSingleCheck}
            disabled={loading}
            className="flex items-center justify-center bg-textcol text-white px-3 py-3  hover:bg-hovercol transition-colors font-space disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingAction === 'check' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span className="text-md">Single Check</span>
              </>
            )}
          </button>
          <button
            onClick={handleGetMetrics}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-textcol text-white px-6 py-3  hover:bg-hovercol transition-colors font-space disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingAction === 'metrics' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                <span>Get Metrics</span>
              </>
            )}
          </button>
          <button
            onClick={handleContinuousMonitor}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-textcol text-white px-6 py-3  hover:bg-hovercol transition-colors font-space disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingAction === 'monitor' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Monitoring...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span className="text-sm">Continuous Monitor</span>
              </>
            )}
          </button>
        </div>

        {/* Monitor Configuration */}
        <div className="bg-cards  p-6 shadow-sm border border-bordercol">
          <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Monitor Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-seccol mb-2 font-brains">Duration (ms)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
                placeholder="10000"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
              <p className="text-xs text-seccol mt-1 font-brains">Default: 10000ms (10 seconds)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-seccol mb-2 font-brains">Interval (ms)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-bordercol  focus:outline-none focus:ring-1 focus:ring-textcol bg-cards text-textcol font-space"
                placeholder="2000"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
              />
              <p className="text-xs text-seccol mt-1 font-brains">Default: 2000ms (2 seconds)</p>
            </div>
          </div>
        </div>

        {/* Single Check Result */}
        {checkResult && (
          <div className="bg-cards  p-6 shadow-sm border border-bordercol">
            <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Health Check Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">URL</span>
                </div>
                <p className="text-sm text-textcol font-space break-all">{checkResult.url}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(checkResult.status)}
                  <span className="text-sm font-medium text-seccol font-brains">Status</span>
                </div>
                <p className={`text-lg font-bold font-space ${getStatusColor(checkResult.status)}`}>{checkResult.status}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Latency</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {checkResult.latency !== null ? `${checkResult.latency}ms` : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Status Code</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {checkResult.statusCode !== null ? checkResult.statusCode : 'N/A'}
                </p>
              </div>
            </div>
            {checkResult.responseSize !== null && (
              <div className="mt-4 p-4 bg-light border-1 border-bordercol">
                <span className="text-sm font-medium text-seccol font-brains">Response Size: </span>
                <span className="text-textcol font-space">{checkResult.responseSize} bytes</span>
              </div>
            )}
            <div className="mt-4 text-sm text-seccol font-brains">
              Checked at: {new Date(checkResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Metrics Result */}
        {metrics && (
          <div className="bg-cards  p-6 shadow-sm border border-bordercol">
            <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Metrics Over Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Uptime</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {formatPercent(metrics.uptime)}
                </p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Response Time</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {metrics.responseTime !== null ? `${metrics.responseTime.toFixed(2)}ms` : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Success Rate</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {formatPercent(metrics.successRate)}
                </p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Total Requests</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">{metrics.totalRequests}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Failed Requests</span>
                </div>
                <p className="text-lg font-bold text-red-600 font-space">{metrics.failedRequests}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Status Code</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">
                  {metrics.statusCode !== null ? metrics.statusCode : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-seccol font-brains">
              Last check: {new Date(metrics.lastCheckTime).toLocaleString()}
            </div>
          </div>
        )}

        {/* Continuous Monitor Result */}
        {monitorResult && (
          <div className="bg-cards p-6 shadow-sm border border-bordercol">
            <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Continuous Monitoring Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Total Checks</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">{monitorResult.totalChecks}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Successful</span>
                </div>
                <p className="text-lg font-bold text-green-600 font-space">{monitorResult.successfulChecks}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Failed</span>
                </div>
                <p className="text-lg font-bold text-red-600 font-space">{monitorResult.failedChecks}</p>
              </div>
              <div className="p-4 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-textcol" />
                  <span className="text-sm font-medium text-seccol font-brains">Uptime</span>
                </div>
                <p className="text-lg font-bold text-textcol font-space">{formatPercent(monitorResult.uptime)}</p>
              </div>
            </div>
            
            {monitorResult.averageLatency !== null && (
              <div className="mb-6 p-4 bg-light border-1 border-bordercol">
                <span className="text-sm font-medium text-seccol font-brains">Average Latency: </span>
                <span className="text-lg font-bold text-textcol font-space">{monitorResult.averageLatency.toFixed(2)}ms</span>
              </div>
            )}

            <div className="bg-light p-4 max-h-64 overflow-y-auto scrollbar-none scrollbar-gutter-auto border-1 border-bordercol">
              <h4 className="text-sm font-medium text-seccol mb-3 font-brains">Check History</h4>
              <div className="space-y-2 ">
                {monitorResult.checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-cards rounded border border-bordercol">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <span className="text-sm text-textcol font-space">{new Date(check.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`font-medium font-brains ${getStatusColor(check.status)}`}>{check.status}</span>
                      {check.latency !== null && (
                        <span className="text-seccol font-brains">{check.latency}ms</span>
                      )}
                      {check.statusCode !== null && (
                        <span className="text-seccol font-brains">{check.statusCode}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-seccol font-brains">
              Duration: {monitorResult.duration}ms | Interval: {monitorResult.interval}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}