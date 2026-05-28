import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useMultiplayer() {
  const [roomId, setRoomId] = useState('');
  const [roomState, setRoomState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      // Fuerza el uso exclusivo de la red local (Wi-Fi)
      const serverUrl = `http://${window.location.hostname}:3001`;
      socket = io(serverUrl);
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleRoomUpdate = (state: any) => {
      console.log('Servidor respondió con el estado de la sala:', state);
      setRoomState(state);
    };
    const handleGameStart = () => {
      console.log('¡Inicia la competencia!');
      // Más adelante, aquí cambiaremos al Tablero Competitivo de juego
    };

    // Si el socket ya estaba conectado antes de que el useEffect se montara
    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room_update', handleRoomUpdate);
    socket.on('game_start', handleGameStart);

    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('room_update', handleRoomUpdate);
      socket?.off('game_start', handleGameStart);
    };
  }, []);

  const joinRoom = (id: string, playerName: string) => {
    console.log(`Enviando petición al servidor para la sala: ${id}`);
    setRoomId(id);
    socket?.emit('join_room', { roomId: id, playerName });
  };

  const setReady = () => {
    socket?.emit('ready', roomId);
  };

  return { isConnected, roomId, roomState, joinRoom, setReady };
}