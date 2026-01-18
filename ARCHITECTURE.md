# Architecture Documentation

## System Overview

HorarioCentros follows a modern three-tier architecture with real-time capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│                     (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages/     │  │  Components  │  │    Store     │     │
│  │   Features   │  │   (React)    │  │  (Zustand)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                          │                                  │
│         ┌────────────────┴────────────────┐                │
│         │                                  │                │
│  ┌──────▼─────┐                  ┌────────▼────────┐       │
│  │ API Client │                  │ Socket.io Client│       │
│  │  (Axios)   │                  │   (WebSocket)   │       │
│  └────────────┘                  └─────────────────┘       │
└───────┬────────────────────────────────────┬───────────────┘
        │                                    │
        │ HTTPS/REST                         │ WebSocket
        │                                    │
┌───────▼────────────────────────────────────▼───────────────┐
│                      APPLICATION TIER                       │
│                   (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Routes    │  │  Middleware  │  │   Services   │     │
│  │   (Express)  │  │ (Auth, CORS) │  │  (Business)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────┐      │
│  │          Socket.io Server (WebSocket)            │      │
│  └──────────────────────────────────────────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Database Queries
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA TIER                              │
│                  (PostgreSQL/SQLite)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Users      │  │  Timetables  │  │  Constraints │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Client Layer

#### React Components
- **Navbar**: Navigation with user menu and theme toggle
- **ThemeToggle**: Dark/light mode switcher
- **TimetableGrid**: Main timetable display with drag-drop
- **TimetableSlot**: Individual time slot component

#### Pages/Features
- **HomePage**: Landing page with features
- **LoginPage**: User authentication
- **RegisterPage**: New user signup
- **DashboardPage**: Role-based dashboard
- **TimetablePage**: Timetable editor with collaboration

#### State Management (Zustand)
- **Theme Store**: Dark mode preference
- **Auth Store**: User session and JWT token

#### Services
- **API Client**: REST API communication (Axios)
- **Socket Service**: Real-time WebSocket connection

### Server Layer

#### Routes
- **/api/auth**: Registration and login
- **/api/users**: User management
- **/api/timetables**: CRUD operations
- **/api/constraints**: Constraint management
- **/api/export**: PDF and iCal export

#### Middleware
- **authenticate**: JWT verification
- **authorize**: Role-based access control
- **errorHandler**: Centralized error handling

#### Services
- **AISchedulingService**: Smart scheduling algorithm
- **SocketService**: WebSocket event handlers

### Data Layer

#### Models (TypeScript Types)
- **User**: Authentication and profile
- **Timetable**: Schedule structure
- **TimetableSlot**: Individual class session
- **Constraint**: Scheduling rules
- **Subject, Class, Period**: Supporting entities

## Data Flow

### REST API Flow
```
Client Request
    ↓
HTTPS (JSON)
    ↓
Express Route
    ↓
Middleware (Auth)
    ↓
Controller Logic
    ↓
Service Layer
    ↓
Database/Memory
    ↓
JSON Response
    ↓
Client Update
```

### WebSocket Flow
```
User Action (Edit)
    ↓
Socket.emit()
    ↓
WebSocket Connection
    ↓
Server Event Handler
    ↓
Broadcast to Room
    ↓
Other Clients Receive
    ↓
UI Auto-Update
```

## Technology Stack Details

### Frontend
- **React 18**: UI library with hooks
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **React DnD**: Drag-and-drop
- **Zustand**: State management
- **React Router**: Navigation
- **Socket.io Client**: WebSocket
- **Axios**: HTTP client
- **Lucide React**: Icon library

### Backend
- **Node.js 18+**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **Socket.io**: WebSocket server
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Zod**: Schema validation
- **PDFKit**: PDF generation
- **ical-generator**: Calendar export

### Development Tools
- **ESLint**: Code linting
- **Jest**: Backend testing
- **Vitest**: Frontend testing
- **nodemon**: Auto-reload
- **ts-node**: TypeScript execution

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates with bcrypt
3. JWT token generated
4. Token sent to client
5. Client stores in localStorage
6. Token included in API requests
7. Middleware validates token
8. Request processed if valid
```

### Authorization Layers
- **Public routes**: No auth required
- **Authenticated routes**: Valid JWT needed
- **Role-based routes**: Specific role required
- **Resource ownership**: Own data only

## Scalability Considerations

### Horizontal Scaling
- Stateless server design
- JWT tokens (no server sessions)
- Database connection pooling
- Load balancer ready

### Vertical Scaling
- Efficient algorithms
- Lazy loading
- Data pagination
- Caching strategies

### Database Scaling
- Index optimization
- Query optimization
- Read replicas (future)
- Sharding (future)

## Real-time Collaboration

### Socket.io Rooms
Each timetable has a dedicated room:
- Users join room on page load
- Changes broadcast to room only
- Active user tracking per room
- Clean disconnect handling

### Conflict Resolution
- Optimistic updates (client-first)
- Server validation
- Conflict detection
- Manual resolution when needed

## Deployment Architecture

### Production Setup
```
Internet
    ↓
HTTPS (443)
    ↓
Nginx Reverse Proxy
    ├─→ Static Files (Client)
    └─→ API/WebSocket (Server)
         ↓
    Node.js Process
         ↓
    PostgreSQL Database
```

### Environment Configuration
- Development: SQLite + local
- Staging: PostgreSQL + test server
- Production: PostgreSQL + cloud

## Performance Optimizations

### Client-Side
- Code splitting
- Lazy loading routes
- Image optimization
- Bundle size optimization
- Service worker (planned)

### Server-Side
- Response compression
- Database query optimization
- Connection pooling
- Caching headers
- Rate limiting

## Monitoring & Logging

### Application Monitoring
- Request/response logging
- Error tracking
- Performance metrics
- User analytics (planned)

### Infrastructure Monitoring
- Server health checks
- Database performance
- Network latency
- Resource usage

## Future Enhancements

### Planned Features
- Database migration system (Prisma)
- Redis caching layer
- Message queue (Bull)
- Microservices architecture
- GraphQL API option
- CDN integration
- Container orchestration (Kubernetes)

---

For implementation details, see individual component documentation.
