import React from 'react';

interface GameOverScreenProps {
  reason: string;
  onRestart: () => void;
}

/**
 * Pantalla de fin de juego.
 * Muestra el motivo de la derrota y permite reiniciar la partida.
 */
const GameOverScreen: React.FC<GameOverScreenProps> = ({ reason, onRestart }) => (
  <div className="h-full flex flex-col items-center justify-center p-12 bg-black text-center space-y-8">
    <div className="retro-border p-12 bg-black border-red-600 max-w-xl">
      <h1 className="text-6xl font-black text-red-600 mb-4 uppercase">FIN DEL JUEGO</h1>
      <div className="h-1 bg-red-600 w-full mb-6"></div>
      <p className="text-xl text-white mb-8">{reason}</p>
      <button onClick={onRestart} className="btn-primary bg-red-600 hover:bg-red-700">
        REINICIAR TERMINAL
      </button>
    </div>
  </div>
);

export default GameOverScreen;
