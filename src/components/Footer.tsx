import React from 'react';
import { TreeDeciduous, MapPin, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types/screens';

interface FooterProps {
  message?: string;
  alexNote?: string;
  onAcceptAlexNote: () => void;
  currentDate: string;
  currentTime: string;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  day: number;
}

/**
 * Footer de navegación y mensajes del detective.
 * Muestra el mensaje de Alex, la fecha/hora del juego y los botones de navegación.
 */
const Footer: React.FC<FooterProps> = ({
  message,
  alexNote,
  onAcceptAlexNote,
  currentDate,
  currentTime,
  screen,
  onNavigate,
  day,
}) => {
  const displayText = alexNote || message || '';

  return (
    <footer className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2">
      {/* Mensaje del detective Alex */}
      <div className="retro-border flex-1 bg-black p-3 overflow-visible">
        <div className="text-[10px] mb-1 opacity-70 uppercase">Mensaje del Detective</div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <p className="text-sm flex-1 whitespace-pre-wrap break-words">
            Alex:{' '}
            <span className={cn('italic', alexNote ? 'text-red-300' : 'text-orange-200')}>
              {displayText ? `"${displayText}"` : ''}
            </span>
          </p>
          {alexNote && (
            <button
              onClick={onAcceptAlexNote}
              className="btn-action text-[10px] px-2 py-1 bg-red-700 hover:bg-red-600 self-start"
            >
              ACEPTAR
            </button>
          )}
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="retro-border w-1/4 bg-black p-2 flex flex-col justify-between">
        <div className="text-[10px] opacity-70 uppercase">Fecha y Hora</div>
        <div className="text-sm font-vt323">
          <div>{currentDate}</div>
          <div>{currentTime}</div>
        </div>
      </div>

      {/* Navegación */}
      <div className="retro-border w-full md:w-1/4 bg-black p-2 flex flex-col justify-between">
        <div className="text-[10px] opacity-70 uppercase mb-2">Navegación</div>
        <div className="flex justify-between">
          <button
            onClick={() => onNavigate('case-tree')}
            title="Árbol"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border border-cyber-orange bg-black/90 text-cyber-orange transition hover:bg-cyber-orange hover:text-black relative',
              screen === 'case-tree' ? 'bg-cyber-orange text-black' : '',
            )}
          >
            <TreeDeciduous size={18} />
          </button>
          <button
            onClick={() => onNavigate('investigation-map')}
            title="Mapa"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border border-cyber-orange bg-black/90 text-cyber-orange transition hover:bg-cyber-orange hover:text-black',
              screen === 'investigation-map' ? 'bg-cyber-orange text-black' : '',
            )}
          >
            <MapPin size={18} />
          </button>
          <button
            onClick={() => day >= 2 && onNavigate('tactical-board')}
            title={day < 2 ? 'Disponible desde el Día 2' : 'Tablero'}
            disabled={day < 2}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border transition',
              day < 2
                ? 'border-gray-700 bg-black/50 text-gray-600 cursor-not-allowed opacity-40'
                : 'border-cyber-orange bg-black/90 text-cyber-orange hover:bg-cyber-orange hover:text-black',
              screen === 'tactical-board' ? 'bg-cyber-orange text-black' : '',
            )}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
