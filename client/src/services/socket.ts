import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTimetable(timetableId: string, userId: string, userName: string) {
    this.socket?.emit('join-timetable', { timetableId, userId, userName });
  }

  leaveTimetable(timetableId: string, userId: string, userName: string) {
    this.socket?.emit('leave-timetable', { timetableId, userId, userName });
  }

  emitUpdate(timetableId: string, userId: string, userName: string, change: any) {
    this.socket?.emit('timetable-update', { timetableId, userId, userName, change });
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user-left', callback);
  }

  onTimetableChanged(callback: (data: any) => void) {
    this.socket?.on('timetable-changed', callback);
  }

  onActiveUsers(callback: (data: any) => void) {
    this.socket?.on('active-users', callback);
  }
}

export const socketService = new SocketService();
