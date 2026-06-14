import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : window.location.origin;

    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
}
