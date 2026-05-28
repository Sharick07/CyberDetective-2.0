import React, { useState } from 'react';
import { Screen } from '../types/screens';
import { DETECTIVE_AVATARS } from '../constants/gameData';

interface MainMenuProps {
  onNavigate: (s: Screen) => void;
  setShowHelp: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  loadGame: () => Promise<boolean>;
  playerName: string;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  setShowHelp,
  setShowSettings,
  loadGame,
  playerName,
  isVoiceEnabled,
  onToggleVoice,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [avatarIdx, setAvatarIdx] = useState(0);

  const nextAvatar = () => setAvatarIdx(prev => (prev + 1) % DETECTIVE_AVATARS.length);
  const prevAvatar = () => setAvatarIdx(prev => (prev - 1 + DETECTIVE_AVATARS.length) % DETECTIVE_AVATARS.length);

  const handleLoad = async () => {
    const success = await loadGame();
    if (success) onNavigate('case-tree');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleClose = () => {
    try { window.close(); } catch (_) {}
    onNavigate('boot');
  };

  if (isMinimized) {
    return (
      <div className="flex-1 flex flex-col justify-end items-start h-full p-4">
        <div className="retro-border px-4 py-3 bg-black text-cyber-orange flex items-center justify-between w-72 shadow-lg shadow-cyber-orange/20">
          <span className="text-xs font-bold uppercase truncate tracking-wider">TraceBack (Min.)</span>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setIsMinimized(false)} className="text-xs border border-cyber-orange px-2 hover:bg-cyber-orange hover:text-black transition-colors">□</button>
            <button onClick={handleClose} className="text-xs border border-cyber-orange px-1.5 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">×</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center h-full overflow-hidden p-6 py-10">
      <div className="w-full max-w-5xl flex gap-8 h-full max-h-[600px]">

        {/* PANEL IZQUIERDO: Perfil y Avatar */}
        <section className="w-1/3 retro-border bg-black shadow-lg shadow-cyber-orange/10 p-6 flex flex-col items-center justify-center text-center relative border-cyber-orange/40 shrink-0">
          <h3 className="text-cyber-orange font-bold text-2xl uppercase mb-6 truncate w-full px-2" title={`Perfil de ${playerName || 'Alex'}`}>
            Perfil de <br />
            <span className="text-white">{playerName || 'Alex'}</span>
          </h3>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={prevAvatar} className="text-cyber-orange hover:bg-cyber-orange/20 px-3 py-6 text-2xl font-bold border border-transparent hover:border-cyber-orange transition-all">&lt;</button>
            <div className="w-32 h-32 border-4 border-cyber-orange overflow-hidden bg-gray-800 shadow-xl shadow-cyber-orange/20">
              <img src={DETECTIVE_AVATARS[avatarIdx]} alt="Detective Avatar" className="w-full h-full object-cover" />
            </div>
            <button onClick={nextAvatar} className="text-cyber-orange hover:bg-cyber-orange/20 px-3 py-6 text-2xl font-bold border border-transparent hover:border-cyber-orange transition-all">&gt;</button>
          </div>
          <p className="text-xs opacity-70 uppercase tracking-widest mt-2">Detective Autorizado</p>
          <p className="text-[10px] text-green-400 mt-2 font-bold tracking-widest">[ ESTADO: ACTIVO ]</p>
          <div className="mt-8 border-t border-cyber-orange/30 pt-4 w-full text-[10px] text-cyber-orange/60 uppercase">
            Selecciona tu apariencia para la investigación
          </div>
        </section>

        {/* PANEL DERECHO: Título y Botones */}
        <section className="w-2/3 flex flex-col gap-4 overflow-y-auto cyber-scroll pr-2">
          <div className="retro-border p-8 text-center flex flex-col items-center justify-center bg-black relative shadow-lg shadow-cyber-orange/10 border-cyber-orange/40 shrink-0">
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setIsMinimized(true)} className="text-xs border border-cyber-orange px-1 hover:bg-cyber-orange hover:text-black transition-colors">_</button>
              <button onClick={toggleFullscreen} className="text-xs border border-cyber-orange px-1 hover:bg-cyber-orange hover:text-black transition-colors">□</button>
              <button onClick={handleClose} className="text-xs border border-cyber-orange px-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">×</button>
            </div>
            <div className="border-4 border-cyber-orange p-3 mb-2 inline-block bg-cyber-orange/5">
              <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase text-cyber-orange">TraceBack</h1>
            </div>
            <h2 className="text-2xl font-bold mb-1 uppercase text-white">El Árbol de la Verdad</h2>
            <p className="text-xs uppercase tracking-widest opacity-70">Sistema de investigación de ciberacoso</p>
          </div>

          <div className="retro-border p-6 flex flex-col gap-3 items-center justify-center bg-black shadow-lg shadow-cyber-orange/5 border-cyber-orange/40 flex-grow">
            <button
              onClick={() => onNavigate('case-tree')}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange bg-cyber-orange text-black font-bold hover:brightness-110 transition-all uppercase"
            >
              <span className="block text-base">Nueva Investigación</span>
              <span className="block text-xs mt-1">(Nivel 1: The First Signs)</span>
            </button>
            <button
              onClick={() => onNavigate('multiplayer-lobby')}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange bg-black text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase shadow-md shadow-cyber-orange/20"
            >
              <span className="block text-base">Modo Competitivo Online</span>
              <span className="block text-xs mt-1 opacity-80">(Crea o únete a una sala de investigación)</span>
            </button>
            <button
              onClick={handleLoad}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
            >
              Cargar Expediente Guardado
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
            >
              <span className="block text-base">Sistema de Ayuda</span>
              <span className="block text-xs mt-1 opacity-80">(las reglas, árboles, etc.)</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
            >
              <span className="block text-base">Inclusión y Ajustes</span>
              <span className="block text-xs mt-1 opacity-80">(Accesibilidad, selección apariencia)</span>
            </button>
            <button
              onClick={onToggleVoice}
              className="w-full max-w-lg py-3 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
            >
              <span className="block text-base">
                {isVoiceEnabled ? '🔊 Voz de Alex: ON' : '🔇 Voz de Alex: OFF'}
              </span>
              <span className="block text-xs mt-1 opacity-80">
                {isVoiceEnabled ? 'Clic para silenciar los audios del detective' : 'Clic para activar los audios del detective'}
              </span>
            </button>
            <button
              onClick={handleClose}
              className="w-full max-w-lg py-3 mt-4 border-2 border-red-900/50 text-red-500 font-bold hover:bg-red-900/30 hover:border-red-500 transition-all uppercase opacity-70 hover:opacity-100"
            >
              Salir de la Terminal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainMenu;
