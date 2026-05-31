// src/services/liveSyncService.ts
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class LiveSyncService {
  private socket: Socket | null = null;

  connect(stateId: string) {
    if (!this.socket) {
      // Connect to the NestJS WebSocket Gateway
      this.socket = io(BACKEND_URL, {
        auth: { token: 'YOUR_ADMIN_JWT_TOKEN' }, // Replace with actual Auth context
        query: { stateId } // Multi-tenancy: Only subscribe to Ekiti State events
      });

      this.socket.on('connect', () => {
        console.log(`[DASHBOARD] Connected to live stream for State: ${stateId}`);
      });

      this.socket.on('disconnect', () => {
        console.warn('[DASHBOARD] Live stream disconnected. Reconnecting...');
      });
    }
  }

  // Subscribe to new properties being processed by the hubs
  onNewTransaction(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('transaction.completed', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const liveSync = new LiveSyncService();