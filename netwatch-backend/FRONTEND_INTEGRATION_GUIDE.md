# Frontend Integration Quick Guide

## Quick Start for Frontend Developer

### 1. Project Context
This is a network device monitoring backend with the following key features:
- Multi-device type monitoring (routers, servers, printers, web servers, PCs, phones)
- Multiple monitoring methods (ICMP, TCP, HTTP, HTTPS, SNMP)
- Real-time dashboard data via polling endpoints
- Dedicated web server monitoring for local services
- Authentication via Clerk

### 2. Key Files to Reference
- `API_DOCUMENTATION.md` - Complete API reference
- `src/app.ts` - Main Express app with route configuration
- `src/controllers/` - All controller logic
- `src/services/` - Business logic layer
- `prisma/schema.prisma` - Database schema

### 3. Essential API Endpoints for Frontend

#### Dashboard Real-time Data (Main Integration Point)
```
GET /api/dashboard/overview        // Dashboard statistics
GET /api/dashboard/summary         // Monitoring breakdown
GET /api/dashboard/devices/:id/realtime  // Device-specific live data
```

#### Device Management
```
GET    /api/devices                // List all devices
POST   /api/devices                // Create device
GET    /api/devices/:id            // Get device details
PATCH  /api/devices/:id            // Update device
DELETE /api/devices/:id            // Delete device
```

#### Monitor Management
```
POST   /api/devices/:id/monitors   // Add monitor to device
GET    /api/devices/:id/monitors   // Get device monitors
PATCH  /api/devices/:id/monitors/:id  // Update monitor
DELETE /api/devices/:id/monitors/:id  // Delete monitor
```

#### Web Server Monitoring (Local Services)
```
POST /api/webserver/check          // Single health check
GET  /api/webserver/metrics?url=   // Get metrics over time
POST /api/webserver/monitor        // Continuous monitoring
```

### 4. Data Models

#### Device Object
```typescript
{
  id: string;
  name: string;
  type: "ROUTER" | "SERVER" | "WEB_SERVER" | "PRINTER" | "PC" | "PHONE";
  address: string;
  status: "UNKNOWN" | "HEALTHY" | "DOWN";
  monitors: Monitor[];
}
```

#### Monitor Object
```typescript
{
  id: string;
  method: "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";
  enabled: boolean;
  config: { port?: number; url?: string; community?: string };
}
```

### 5. Integration Strategy

#### Recommended Polling Intervals
- Dashboard overview: Every 30-60 seconds
- Device real-time data: Every 10-30 seconds
- Statistics summary: Every 60 seconds

#### Authentication
All requests need Clerk JWT:
```typescript
headers: {
  'Authorization': `Bearer ${clerkToken}`
}
```

#### Example API Call
```typescript
const getDashboardData = async () => {
  const response = await fetch('http://localhost:3000/api/dashboard/overview', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### 6. Web Server Monitoring for Local Machines

For monitoring local web servers (localhost, development servers, etc.):

```typescript
// Check a local web server
const checkLocalServer = async () => {
  const response = await fetch('http://localhost:3000/api/webserver/check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'http://localhost:5173' // Your local dev server
    })
  });
  return response.json();
};
```

### 7. Monitor Configuration Examples

#### ICMP (Ping)
```json
{ "method": "ICMP" }
```

#### TCP Port Check
```json
{ 
  "method": "TCP",
  "config": { "port": 8080 }
}
```

#### HTTP/HTTPS
```json
{ 
  "method": "HTTP",
  "config": { "url": "http://example.com" }
}
```

#### SNMP
```json
{ 
  "method": "SNMP",
  "config": { "community": "public" }
}
```

### 8. Error Handling
```typescript
try {
  const data = await apiCall();
} catch (error) {
  if (error.status === 401) {
    // Handle authentication
  } else if (error.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

### 9. Testing the Backend

#### Start Backend
```bash
cd netwatch-backend
npm run dev
```

#### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

#### Test with Authentication
You'll need a valid Clerk JWT token to test authenticated endpoints.

### 10. Next Steps for Frontend Developer

1. **Set up Clerk authentication** in your frontend app
2. **Create API service layer** with proper error handling
3. **Implement polling mechanism** for real-time data
4. **Build dashboard components** using the overview endpoint
5. **Create device management UI** using device endpoints
6. **Add web server monitoring** for local development servers
7. **Implement device detail views** with real-time data

### 11. Environment Variables Needed
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
PORT=3000
CLIENT_URL=http://localhost:5173
```

### 12. Common Issues & Solutions

#### CORS Issues
- Ensure `CLIENT_URL` matches your frontend URL
- Backend CORS is configured in `src/app.ts`

#### Authentication Errors
- Verify Clerk JWT token is valid
- Check token expiration
- Ensure token is sent in Authorization header

#### Real-time Data Not Updating
- Check polling intervals
- Verify monitor scheduler is running (30-second intervals)
- Check database connection

### 13. Database Schema Reference
Key models: User, Device, DeviceMonitor, MonitoringResult
- Full schema in `prisma/schema.prisma`
- Supports cascading deletes (device → monitors → results)

### 14. Additional Resources
- Full API documentation: `API_DOCUMENTATION.md`
- Database schema: `prisma/schema.prisma`
- Route configuration: `src/app.ts`
- Example requests: `test.rest` file

---

**Note**: The backend is fully functional and tested. All endpoints are working and ready for frontend integration. The monitoring scheduler runs automatically every 30 seconds to check device health.