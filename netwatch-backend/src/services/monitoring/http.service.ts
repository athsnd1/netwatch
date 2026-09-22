export interface HTTPCheckResult {
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  statusCode: number | null;
  responseSize: number | null;
  headers: Record<string, string>;
}

export async function checkHTTP(url: string): Promise<HTTPCheckResult> {
  const start = Date.now();

  try {
    const response = await fetch(url);

    const responseSize = response.headers.get("content-length")
      ? parseInt(response.headers.get("content-length")!, 10)
      : null;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.ok ? ("HEALTHY" as const) : ("DOWN" as const),
      latency: Date.now() - start,
      statusCode: response.status,
      responseSize,
      headers,
    };
  } catch {
    return {
      status: "DOWN" as const,
      latency: null,
      statusCode: null,
      responseSize: null,
      headers: {},
    };
  }
}

export interface WebServerMetrics {
  uptime: number | null;
  responseTime: number | null;
  statusCode: number | null;
  responseSize: number | null;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  lastCheckTime: Date;
}

export async function getWebServerMetrics(
  url: string,
  checkInterval: number = 30000
): Promise<WebServerMetrics> {
  const results: HTTPCheckResult[] = [];
  const startTime = Date.now();
  const duration = 60000; // 1 minute of monitoring

  while (Date.now() - startTime < duration) {
    const result = await checkHTTP(url);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
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