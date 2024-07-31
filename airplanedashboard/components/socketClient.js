import { useEffect } from 'react';
import io from 'socket.io-client';

const SocketClient = ({ onUpdate }) => {
  useEffect(() => {
    console.log("Connecting to WebSocket...");
    const socket = io('/flight_plane_simulation');

    socket.on('flight_plane_simulation_update', (data) => {
      console.log('Received update:', data);
      if (onUpdate) {
        onUpdate(data);
      }
    });

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, [onUpdate]);

  return null;
};

export default SocketClient;

