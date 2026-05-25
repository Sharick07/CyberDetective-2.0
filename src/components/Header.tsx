import React from 'react';
import { Pause, Minus, Maximize2, X } from 'lucide-react';
import { Screen, INTERNAL_SCREENS } from '../types/screens';
import { getLevelName } from '../constants/gameHelpers';

interface HeaderProps {
  title: string;
  subtitle?: string;
  screen: Screen;
  day: number;
  level: number;
  onPause: () => void;
  onToggleFullscreen: () => void;
}

/**
 * Header global de la aplicación.
 * Muestra el estado del caso, el nivel actual y controles de ventana.
 */
const Header: React.FC<HeaderProps> = ({
  screen,
  level,
  onPause,
  onToggleFullscreen,
}) => (
  <header className="retro-border bg-black flex items-center justify-between px-3 py-1 text-sm z-50">
    {/* Izquierda: Botón PAUSA */}
    <div className="flex items-center">
      {INTERNAL_SCREENS.includes(screen) && (
        <button
          onClick={onPause}
          className="btn-action text-[10px] px-2 py-0.5 shrink-0 flex items-center gap-1"
          title="Pausa"
        >
          <Pause size={12} />
        </button>
      )}
    </div>

    {/* Centro: Estado del caso */}
    <div className="flex-1 text-center truncate px-4 text-xs opacity-80">
      Estado: caso activo - Valeria #801
    </div>

    {/* Derecha: Nivel y botones de ventana */}
    <div className="flex items-center space-x-4">
      <span className="text-xs bg-cyber-orange text-black px-2 font-bold">
        {screen === 'main-menu'
          ? 'TERMINAL PRINCIPAL'
          : `NIVEL ${level} - ${getLevelName(level)}`}
      </span>
      <div className="flex space-x-1">
        <button
          onClick={() => document.exitFullscreen().catch(() => {})}
          className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"
          title="Salir de pantalla completa"
        ><Minus size={8} /></button>
        <button
          onClick={onToggleFullscreen}
          className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"
          title="Pantalla completa"
        ><Maximize2 size={8} /></button>
        <button
          onClick={() => window.close()}
          className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"
          title="Cerrar"
        ><X size={8} /></button>
      </div>
    </div>
  </header>
);

export default Header;
