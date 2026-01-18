import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import timetableRoutes from './routes/timetable.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import constraintRoutes from './routes/constraint.routes';
import exportRoutes from './routes/export.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './services/socket.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'HorarioCentros API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user',
      },
      users: {
        'GET /api/users': 'Get all users (admin)',
        'GET /api/users/:id': 'Get user by id',
        'PUT /api/users/:id': 'Update user',
      },
      timetables: {
        'GET /api/timetables': 'Get all timetables',
        'GET /api/timetables/:id': 'Get timetable by id',
        'POST /api/timetables': 'Create timetable',
        'PUT /api/timetables/:id': 'Update timetable',
        'DELETE /api/timetables/:id': 'Delete timetable',
      },
      constraints: {
        'GET /api/constraints': 'Get all constraints',
        'POST /api/constraints': 'Create constraint',
        'PUT /api/constraints/:id': 'Update constraint',
        'DELETE /api/constraints/:id': 'Delete constraint',
      },
      export: {
        'GET /api/export/pdf/:id': 'Export timetable as PDF',
        'GET /api/export/ical/:id': 'Export timetable as iCal',
      },
    },
  });
});

// Error handler
app.use(errorHandler);

// Socket.io setup
setupSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api/docs`);
  console.log(`🔌 WebSocket server ready`);
});

export { app, io };
