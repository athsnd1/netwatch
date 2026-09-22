# NetWatch

A comprehensive network device monitoring system with real-time health checks, multi-protocol support, and a modern web dashboard.

## Overview

NetWatch is a full-stack network monitoring solution that enables users to monitor the health and performance of network devices (routers, servers, printers, web servers, PCs, phones) using multiple monitoring protocols. It features automated scheduled monitoring, real-time dashboards, and a clean React-based frontend.

## Architecture

```
netwatch/
├── netwatch-backend/     # Express.js + TypeScript API server
├── netwatch-frontend/    # React 19 + Vite + Tailwind CSS dashboard
└── README.md
```

## Features

### Monitoring Protocols
- **ICMP** - Ping-based reachability checks
- **TCP** - Port connectivity verification
- **HTTP/HTTPS** - Web service health checks with status codes, latency, response size
- **SNMP** - Device metrics collection (printers, routers, servers) with MIB support

### Device Types Supported
- Router
- Server
- Web Server
- Printer
- PC
- Phone

### Core Capabilities
- **Automated Monitoring** - Cron-based scheduler runs checks every 30 seconds
- **Real-time Dashboard** - Live device status, monitor results, and statistics
- **Device Management** - CRUD operations for devices and monitors
- **Web Server Monitoring** - Dedicated endpoints for HTTP/HTTPS service monitoring
- **Historical Data** - Monitoring results stored with timestamps
- **Redis Caching** - Performance optimization for device queries
- **Clerk Authentication** - Secure user authentication and authorization

## Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Auth**: Clerk
- **Scheduler**: node-cron
- **Logging**: Pino
- **Validation**: Zod

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 7
- **UI Components**: Base UI, Lucide React, Huge Icons
- **Auth**: Clerk React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- Clerk account for authentication

### Backend Setup

```bash
cd netwatch-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd netwatch-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/netwatch
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
PORT=3000
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Health | `GET /api/health` | Server health check |
| Users | `GET /api/users/me` | Get current user |
| Devices | `POST /api/devices` | Create device with monitors |
| Devices | `GET /api/devices` | List all devices |
| Devices | `GET /api/devices/:id` | Get device details |
| Devices | `PATCH /api/devices/:id` | Update device |
| Devices | `DELETE /api/devices/:id` | Delete device |
| Monitors | `POST /api/devices/:id/monitors` | Add monitor to device |
| Monitors | `GET /api/devices/:id/monitors` | List device monitors |
| Monitors | `GET /api/devices/:id/monitors/:monitorId/results` | Get monitor results |
| Monitors | `PATCH /api/devices/:id/monitors/:monitorId` | Update monitor |
| Monitors | `DELETE /api/devices/:id/monitors/:monitorId` | Delete monitor |
| Dashboard | `GET /api/dashboard/overview` | Dashboard overview stats |
| Dashboard | `GET /api/dashboard/summary` | Monitoring statistics |
| Dashboard | `GET /api/dashboard/devices/:id/realtime` | Real-time device data |
| Web Server | `POST /api/webserver/check` | Single HTTP check |
| Web Server | `GET /api/webserver/metrics` | Web server metrics |
| Web Server | `POST /api/webserver/monitor` | Extended monitoring session |

Full API documentation: [netwatch-frontend/API_DOCUMENTATION.md](netwatch-frontend/API_DOCUMENTATION.md)

## Monitoring Configuration Examples

### ICMP (Ping)
```json
{ "method": "ICMP" }
```

### TCP (Port Check)
```json
{ "method": "TCP", "config": { "port": 80 } }
```

### HTTP/HTTPS
```json
{ "method": "HTTP", "config": { "url": "http://example.com" } }
```

### SNMP
```json
{ "method": "SNMP", "config": { "community": "public" } }
```

## Project Structure

### Backend
```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Entry point
├── lib/prisma.ts             # Prisma client
├── config/redis.config.ts    # Redis configuration
├── middleware/               # Auth, validation middleware
├── routes/                   # API route definitions
├── controllers/              # Request handlers
├── services/                 # Business logic
│   ├── device.service.ts
│   ├── user.service.ts
│   ├── webserver.service.ts
│   ├── dashboard.service.ts
│   └── monitoring/           # Protocol-specific services
│       ├── icmp.service.ts
│       ├── tcp.service.ts
│       ├── http.service.ts
│       ├── snmp.service.ts
│       ├── monitoring.service.ts
│       ├── monitor.scheduler.ts
│       └── printers|routers|servers/  # Device-specific SNMP
├── validators/               # Zod schemas
├── types/                    # TypeScript types
└── tests/                    # Test files
```

### Frontend
```
src/
├── components/               # Reusable UI components
├── pages/                    # Page components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities (axios, query client)
├── types/                    # TypeScript types
└── styles/                   # Global styles
```

## Development

### Backend Commands
```bash
npm run dev      # Start with hot reload (tsx)
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend Commands
```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check and build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Database Schema

Key models:
- **User** - Clerk-synced user accounts
- **Device** - Network devices with type, address, status
- **DeviceMonitor** - Monitoring configuration per device (method, config)
- **MonitoringResult** - Historical check results with latency and status

## Monitoring Flow

1. Scheduler runs every 30 seconds (`*/30 * * * * *`)
2. Fetches all enabled monitors
3. Executes protocol-specific checks (ICMP/TCP/HTTP/SNMP)
4. Stores results in `MonitoringResult` table
5. Aggregates device status (HEALTHY/DOWN/UNKNOWN)
6. Frontend polls dashboard endpoints for real-time updates

## License

MIT