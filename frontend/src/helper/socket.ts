import { io, Socket } from 'socket.io-client';

class SocketManager {
  socket: Socket | null = null;

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io(
        import.meta.env.VITE_SOCKET_URL || ('https://task-mate-full-stack.onrender.com' as string),
        {
          auth: {
            userId,
          },
          transports: ['websocket'],
          reconnection: true,
        },
      );
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
