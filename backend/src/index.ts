import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import timetableRoutes from './routes/timetable';
import roomRoutes from './routes/rooms';
import subjectRoutes from './routes/subjects';
import teacherRoutes from './routes/teachers';
import studentGroupRoutes from './routes/studentGroups';
import timeSlotsRoutes from './routes/timeSlots';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/student-groups', studentGroupRoutes);
app.use('/api/time-slots', timeSlotsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-timetable', (timetableId: string) => {
    socket.join(`timetable:${timetableId}`);
    console.log(`Client ${socket.id} joined timetable:${timetableId}`);
  });

  socket.on('timetable-update', (data) => {
    const { timetableId, changes } = data;
    socket.to(`timetable:${timetableId}`).emit('timetable-changed', changes);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
