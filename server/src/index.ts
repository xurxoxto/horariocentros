import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import timetableRoutes from './routes/timetable.routes';
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
      users: {
        'GET /api/users': 'Obtener todos los usuarios',
        'GET /api/users/:id': 'Obtener usuario por id',
        'PUT /api/users/:id': 'Actualizar usuario',
      },
      timetables: {
        'GET /api/timetables': 'Obtener todos los horarios',
        'GET /api/timetables/:id': 'Obtener horario por id',
        'POST /api/timetables': 'Crear horario',
        'PUT /api/timetables/:id': 'Actualizar horario',
        'DELETE /api/timetables/:id': 'Eliminar horario',
      },
      constraints: {
        'GET /api/constraints': 'Obtener todas las restricciones',
        'POST /api/constraints': 'Crear restricción',
        'PUT /api/constraints/:id': 'Actualizar restricción',
        'DELETE /api/constraints/:id': 'Eliminar restricción',
      },
      export: {
        'GET /api/export/pdf/:id': 'Exportar horario como PDF',
        'GET /api/export/ical/:id': 'Exportar horario como iCal',
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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación API disponible en http://localhost:${PORT}/api/docs`);
  console.log(`🔌 Servidor WebSocket listo`);
});

export { app, io };
