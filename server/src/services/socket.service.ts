import { Server, Socket } from 'socket.io';
import { CollaborationEvent } from '../models/types';

const activeUsers = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-timetable', (data: { timetableId: string; userId: string; userName: string }) => {
      const { timetableId, userId, userName } = data;
      
      socket.join(timetableId);
      
      if (!activeUsers.has(timetableId)) {
        activeUsers.set(timetableId, new Set());
      }
      activeUsers.get(timetableId)?.add(userId);

      const event: CollaborationEvent = {
        userId,
        userName,
        action: 'join',
        timetableId,
        timestamp: new Date(),
      };

      io.to(timetableId).emit('user-joined', event);
      io.to(timetableId).emit('active-users', {
        users: Array.from(activeUsers.get(timetableId) || []),
      });
    });

    socket.on('leave-timetable', (data: { timetableId: string; userId: string; userName: string }) => {
      const { timetableId, userId, userName } = data;
      
      socket.leave(timetableId);
      activeUsers.get(timetableId)?.delete(userId);

      const event: CollaborationEvent = {
        userId,
        userName,
        action: 'leave',
        timetableId,
        timestamp: new Date(),
      };

      io.to(timetableId).emit('user-left', event);
      io.to(timetableId).emit('active-users', {
        users: Array.from(activeUsers.get(timetableId) || []),
      });
    });

    socket.on('timetable-update', (data: any) => {
      const { timetableId, userId, userName, change } = data;

      const event: CollaborationEvent = {
        userId,
        userName,
        action: 'edit',
        timetableId,
        timestamp: new Date(),
        data: change,
      };

      socket.to(timetableId).emit('timetable-changed', event);
    });

    socket.on('slot-drag', (data: any) => {
      const { timetableId, userId, slotId, position } = data;
      socket.to(timetableId).emit('slot-dragging', { userId, slotId, position });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
