# NetWatch Backend API Documentation

## Overview
NetWatch is a network device monitoring system that supports real-time monitoring of various device types including routers, servers, printers, web servers, PCs, and phones. The backend provides RESTful APIs for device management, monitoring configuration, and real-time data retrieval.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except `/health`) require authentication via Clerk JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-clerk-jwt-token>
```

## Data Models

### Device
```typescript
{
  id: string;
  userId: string;
  name: string;
  type: "ROUTER" | "SERVER" | "WEB_SERVER" | "PRINTER" | "PC" | "PHONE";
  address: string;
  status: "UNKNOWN" | "HEALTHY" | "DOWN";
  createdAt: string;
  updatedAt: string;
  monitors: DeviceMonitor[];
}
```

### DeviceMonitor
```typescript
{
  id: string;
  deviceId: string;
  method: "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";
  enabled: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
```

### MonitoringResult
```typescript
{
  id: string;
  monitorId: string;
  status: "UNKNOWN" | "HEALTHY" | "DOWN";
  latency: number | null;
  checkedAt: string;
}
```

### User
```typescript
{
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### Health Check
**GET** `/health`
- No authentication required
- Returns server status

### User Management

**GET** `/users/me`
- Get current authenticated user information
- Response: User object

### Device Management

**POST** `/devices`
- Create a new device with monitors
- Request Body:
```typescript
{
  name: string;
  type: "ROUTER" | "SERVER" | "WEB_SERVER" | "PRINTER" | "PC" | "PHONE";
  address: string;
  monitors: Array<{
    method: "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";
    config?: Record<string, unknown>;
  }>;
}
```
- Response: Created device with monitors

**GET** `/devices`
- Get all devices for authenticated user
- Response: Array of devices with monitors

**GET** `/devices/:id`
- Get specific device by ID
- Response: Device object with monitors

**PATCH** `/devices/:id`
- Update device information
- Request Body:
```typescript
{
  name?: string;
  type?: "ROUTER" | "SERVER" | "WEB_SERVER" | "PRINTER" | "PC" | "PHONE";
  address?: string;
}
```
- Response: Success message

**DELETE** `/devices/:id`
- Delete a device and all associated monitors
- Response: Success message

### Device Monitors (Nested Routes)

**POST** `/devices/:id/monitors`
- Add a monitor to a device
- Request Body:
```typescript
{
  method: "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";
  config?: Record<string, unknown>;
}
```
- Response: Created monitor

**GET** `/devices/:id/monitors`
- Get all monitors for a specific device
- Response: Array of monitors

**GET** `/devices/:id/monitors/:monitorId/results`
- Get monitoring results for a specific monitor
- Response: Array of monitoring results (ordered by most recent)

**PATCH** `/devices/:id/monitors/:monitorId`
- Update monitor configuration
- Request Body:
```typescript
{
  config?: Record<string, unknown>;
  enabled?: boolean;
}
```
- Response: Updated monitor

**DELETE** `/devices/:id/monitors/:monitorId`
- Delete a monitor from a device
- Response: Success message

### Standalone Monitor Management

**POST** `/monitors`
- Create a standalone monitor
- Request Body:
```typescript
{
  deviceId: string;
  method: "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";
  config?: Record<string, unknown>;
}
```
- Response: Created monitor

**GET** `/monitors`
- Get all monitors for authenticated user
- Response: Array of monitors with device information

**GET** `/monitors/:id`
- Get specific monitor by ID
- Response: Monitor object with device information

**GET** `/monitors/:id/results`
- Get monitoring results for a specific monitor
- Response: Array of monitoring results

**PATCH** `/monitors/:id`
- Update monitor configuration
- Request Body:
```typescript
{
  config?: Record<string, unknown>;
  enabled?: boolean;
}
```
- Response: Updated monitor

**DELETE** `/monitors/:id`
- Delete a monitor
- Response: Success message

### Dashboard & Real-time Data

**GET** `/dashboard/overview`
- Get dashboard overview data
- Response:
```typescript
{
  totalDevices: number;
  healthyDevices: number;
  downDevices: number;
  unknownDevices: number;
  totalMonitors: number;
  activeMonitors: number;
  recentActivity: Array<{
    deviceId: string;
    deviceName: string;
    status: string;
    timestamp: string;
  }>;
}
```

**GET** `/dashboard/summary`
- Get monitoring summary statistics
- Response:
```typescript
{
  byStatus: {
    HEALTHY: number;
    DOWN: number;
    UNKNOWN: number;
  };
  byType: {
    ROUTER: number;
    SERVER: number;
    WEB_SERVER: number;
    PRINTER: number;
    PC: number;
    PHONE: number;
  };
  byMethod: {
    ICMP: number;
    TCP: number;
    HTTP: number;
    HTTPS: number;
    SNMP: number;
  };
}
```

**GET** `/dashboard/devices/:id/realtime`
- Get real-time data for a specific device
- Response:
```typescript
{
  device: {
    id: string;
    name: string;
    type: string;
    address: string;
    status: string;
  };
  monitors: Array<{
    id: string;
    method: string;
    enabled: boolean;
    latestResult: {
      status: string;
      latency: number | null;
      checkedAt: string;
    } | null;
  }>;
}
```

### Web Server Monitoring

**POST** `/webserver/check`
- Perform a single web server health check
- Request Body:
```typescript
{
  url: string;
}
```
- Response:
```typescript
{
  url: string;
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  statusCode: number | null;
  responseSize: number | null;
  timestamp: string;
}
```

**GET** `/webserver/metrics?url=<url>`
- Get web server metrics over time
- Query Parameters:
  - `url` (required): The URL to monitor
- Response:
```typescript
{
  uptime: number | null;
  responseTime: number | null;
  statusCode: number | null;
  responseSize: number | null;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  lastCheckTime: string;
}
```

**POST** `/webserver/monitor`
- Monitor a web server over a specified duration
- Request Body:
```typescript
{
  url: string;
  duration?: number; // milliseconds, default 60000 (1 minute)
  interval?: number; // milliseconds, default 5000 (5 seconds)
}
```
- Response:
```typescript
{
  url: string;
  duration: number;
  interval: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number | null;
  uptime: number;
  checks: Array<{
    url: string;
    status: "HEALTHY" | "DOWN";
    latency: number | null;
    statusCode: number | null;
    responseSize: number | null;
    timestamp: string;
  }>;
  startTime: string;
  endTime: string;
}
```

## Monitor Configuration Examples

### ICMP Monitor (Ping)
```json
{
  "method": "ICMP"
}
```

### TCP Monitor (Port Check)
```json
{
  "method": "TCP",
  "config": {
    "port": 80
  }
}
```

### HTTP Monitor
```json
{
  "method": "HTTP",
  "config": {
    "url": "http://example.com"
  }
}
```

### HTTPS Monitor
```json
{
  "method": "HTTPS",
  "config": {
    "url": "https://example.com"
  }
}
```

### SNMP Monitor
```json
{
  "method": "SNMP",
  "config": {
    "community": "public"
  }
}
```

## Monitoring Schedule
- Monitors run automatically every 30 seconds via cron job
- Results are stored in the database with timestamps
- Device status is updated based on latest monitor results

## Error Responses
All endpoints may return error responses in the following format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Environment Setup
The backend requires the following environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk API secret key
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `PORT` - Server port (default: 3000)
- `CLIENT_URL` - Frontend URL for CORS

## Development Server
Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Frontend Integration Recommendations

### Polling Strategy
For real-time updates, the frontend should poll the following endpoints:
- `/dashboard/overview` - Every 30-60 seconds for dashboard updates
- `/dashboard/devices/:id/realtime` - Every 10-30 seconds for device-specific updates
- `/dashboard/summary` - Every 60 seconds for statistics updates

### WebSockets Consideration
For true real-time updates, consider implementing WebSocket connections in the future to push updates instead of polling.

### Authentication Flow
1. Implement Clerk authentication on the frontend
2. Store the JWT token securely
3. Include the token in all API requests
4. Handle token refresh and expiration

### Error Handling
- Implement retry logic for failed requests
- Show user-friendly error messages
- Handle network connectivity issues
- Implement loading states for better UX

### Data Caching
- Cache device lists and monitor configurations
- Invalidate cache when changes are made
- Use optimistic updates for better perceived performance