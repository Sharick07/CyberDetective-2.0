import React, { useState } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';

export default function LobbyScreen({ playerName, onBack }: { playerName: string, onBack: () => void }) {
  const { isConnected, roomId, roomState, joinRoom, setReady } = useMultiplayer();
  const [inputRoom, setInputRoom] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  if (!roomState) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
        <div className="retro-border p-8 max-w-md w-full bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange">LOBBY COMPETITIVO</h2>
          <p className="text-sm font-vt323 opacity-70">
            Conexión al Servidor Central: 
            <span className={isConnected ? "text-green-500 ml-2" : "text-yellow-500 ml-2"}>
              {isConnected ? 'ESTABLECIDA' : 'CONECTANDO...'}
            </span>
          </p>
          
          <div className="space-y-4 pt-4 border-t border-cyber-orange/30">
            <button
              disabled={!isConnected || isJoining}
              onClick={() => {
                setIsJoining(true);
                const newRoomId = 'SALA-' + Math.floor(1000 + Math.random() * 9000);
                joinRoom(newRoomId, playerName || 'Detective Anon');
                setTimeout(() => setIsJoining(false), 3000); // Por si el servidor no responde
              }}
              className="btn-primary w-full disabled:opacity-50 bg-green-900/40 border-green-500 text-green-400 hover:bg-green-700/60 hover:text-white transition-colors"
            >
              {isJoining ? 'CREANDO...' : 'CREAR NUEVA SALA'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-cyber-orange/30"></div>
              <span className="flex-shrink-0 mx-4 text-cyber-orange/50 text-xs uppercase">O Únete a una existente</span>
              <div className="flex-grow border-t border-cyber-orange/30"></div>
            </div>

            <input
              type="text"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DE SALA (ej. CASO1)"
              className="bg-black border-2 border-cyber-orange text-cyber-orange px-4 py-2 w-full text-center focus:outline-none uppercase font-bold"
            />
            <button
              disabled={!isConnected || !inputRoom || isJoining}
              onClick={() => {
                setIsJoining(true);
                joinRoom(inputRoom, playerName || 'Detective Anon');
                setTimeout(() => setIsJoining(false), 3000);
              }}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isJoining ? 'CONECTANDO...' : 'UNIRSE A LA SALA'}
            </button>
            <button onClick={onBack} className="text-sm text-cyber-orange/70 hover:text-cyber-orange underline w-full mt-2">Volver al Menú Principal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
      <div className="retro-border p-8 max-w-md w-full bg-black text-center space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase text-cyber-orange/70 mb-2">CÓDIGO DE LA SALA</h2>
          <div className="flex items-center justify-center gap-4 bg-cyber-orange/10 border-2 border-cyber-orange p-4">
            <span className="text-4xl font-black tracking-widest text-white">{roomId}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="border-2 border-cyber-orange text-xs px-3 py-2 bg-cyber-orange text-black hover:bg-white hover:border-white transition-colors font-bold"
              title="Copiar código"
            >COPIAR</button>
          </div>
          <p className="text-[10px] text-cyber-orange/50 mt-2 uppercase tracking-widest">Comparte este código con tu oponente</p>
        </div>
        
        <div className="space-y-2 text-left border border-cyber-orange/30 p-4 bg-cyber-orange/5">
          <h3 className="text-sm font-bold border-b border-cyber-orange/30 pb-2 mb-2">DETECTIVES EN LA SALA:</h3>
          {Object.entries(roomState.players).map(([id, player]: [string, any]) => (
            <div key={id} className="flex justify-between items-center text-sm font-vt323">
              <span>🕵️ {player.name}</span>
              <span className={player.ready ? 'text-green-500 font-bold' : 'text-yellow-500 animate-pulse'}>
                {player.ready ? '[LISTO]' : '[ESPERANDO...]'}
              </span>
            </div>
          ))}
        </div>

        {roomState.status === 'playing' ? (
          <p className="text-green-500 font-bold text-xl animate-pulse mt-4 bg-green-900/20 p-2 border border-green-500">
            ¡COMPETENCIA INICIADA! PREPARANDO EVIDENCIAS...
          </p>
        ) : (
          <button onClick={setReady} className="btn-primary w-full mt-4">ESTOY LISTO</button>
        )}
      </div>
    </div>
  );
}