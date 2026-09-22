import { checkHTTP, type HTTPCheckResult, type WebServerMetrics } from "./monitoring/http.service.js";

export interface WebServerCheckResult {
  url: string;
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  statusCode: number | null;
  responseSize: number | null;
  timestamp: Date;
}

export interface WebServerMonitoringResult {
  url: string;
  duration: number;
  interval: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number | null;
  uptime: number;
  checks: WebServerCheckResult[];
  startTime: Date;
  endTime: Date;
}

export async function checkWebServer(url: string): Promise<WebServerCheckResult> {
  const result = await checkHTTP(url);
  
  return {
    url,
    status: result.status,
    latency: result.latency,
    statusCode: result.statusCode,
    responseSize: result.responseSize,
    timestamp: new Date(),
  };
}

export async function getWebServerMetrics(
  url: string,
  duration: number = 60000,
  interval: number = 5000
): Promise<WebServerMetrics> {
  const results: HTTPCheckResult[] = [];
  const startTime = Date.now();

  while (Date.now() - startTime < duration) {
    const result = await checkHTTP(url);
    results.push(result);
    
    if (Date.now() - startTime < duration) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  const successfulRequests = results.filter((r) => r.status === "HEALTHY");
  const failedRequests = results.filter((r) => r.status === "DOWN");

  const avgResponseTime =
    successfulRequests.length > 0
      ? successfulRequests.reduce((sum, r) => sum + (r.latency || 0), 0) /
        successfulRequests.length
      : null;

  const latestResult = results[results.length - 1];

  return {
    uptime: successfulRequests.length / results.length,
    responseTime: avgResponseTime,
    statusCode: latestResult?.statusCode || null,
    responseSize: latestResult?.responseSize || null,
    successRate: successfulRequests.length / results.length,
    totalRequests: results.length,
    failedRequests: failedRequests.length,
    lastCheckTime: new Date(),
  };
}

export async function monitorWebServer(
  url: string,
  duration: number = 60000,
  interval: number = 5000
): Promise<WebServerMonitoringResult> {
  const checks: WebServerCheckResult[] = [];
  const startTime = new Date();
  
  const endTime = new Date(startTime.getTime() + duration);

  while (new Date() < endTime) {
    const result = await checkWebServer(url);
    checks.push(result);
    
    if (new Date() < endTime) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  const successfulChecks = checks.filter((c) => c.status === "HEALTHY");
  const failedChecks = checks.filter((c) => c.status === "DOWN");

  const averageLatency =
    successfulChecks.length > 0
      ? successfulChecks.reduce((sum, c) => sum + (c.latency || 0), 0) /
        successfulChecks.length
      : null;

  const uptime = successfulChecks.length / checks.length;

  return {
    url,
    duration,
    interval,
    totalChecks: checks.length,
    successfulChecks: successfulChecks.length,
    failedChecks: failedChecks.length,
    averageLatency,
    uptime,
    checks,
    startTime,
    endTime: new Date(),
  };
}