const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // Permite conexiones locales desde React
});

// Memoria del servidor para guardar las salas y las puntuaciones
const rooms = {};

io.on('connection', (socket) => {
  console.log('Detective conectado al modo competitivo:', socket.id);

  socket.on('join_room', ({ roomId, playerName }) => {
    socket.join(roomId);
    console.log(`[SERVER] ${playerName || 'Detective'} intenta unirse a la sala: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        status: 'waiting', // waiting, playing, finished
      };
      console.log(`[SERVER] [+] Nueva sala creada exitosamente: ${roomId}`);
    }
    
    // Inicializar jugador con 0 puntos
    rooms[roomId].players[socket.id] = { name: playerName, score: 0, ready: false };
    io.to(roomId).emit('room_update', rooms[roomId]);
    console.log(`[SERVER] [>] Estado enviado a la sala ${roomId} (${Object.keys(rooms[roomId].players).length} jugadores).`);
  });

  socket.on('ready', (roomId) => {
    if (rooms[roomId] && rooms[roomId].players[socket.id]) {
      rooms[roomId].players[socket.id].ready = true;
      
      const players = Object.values(rooms[roomId].players);
      const allReady = players.every(p => p.ready);
      
      // Si todos están listos y hay al menos 2 personas
      if (allReady && players.length > 1) {
        rooms[roomId].status = 'playing';
        io.to(roomId).emit('game_start');
      }
      io.to(roomId).emit('room_update', rooms[roomId]);
    }
  });
});

server.listen(3001, () => {
  console.log('Servidor de CyberDetective (Competitivo) listo en puerto 3001');
});