declare module 'socket.io' {
  interface Socket {
    data: SocketData;
  }
}

interface SocketData {
  user?: {
    sub: string;
    [key: string]: unknown;
  };
}

export {};
