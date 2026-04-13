import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useGameState, DayTransitionInfo } from './logic/useGameState';
import { CRIME_INFO, CrimeType, GameNode, CatalogueEntry, GameState } from './types/game';
import {
  Terminal,
  Search,
  FileText,
  LogOut,
  Coffee,
  X,
  Maximize2,
  Minus,
  Pause,
  TreeDeciduous,
  MapPin,
  Layers,
  Volume2,
  Mic,
  MicOff,
} from 'lucide-react';

// --- Types ---
type Screen = 'boot' | 'intro' | 'main-menu' | 'case-tree' | 'investigation-map' | 'tactical-board' | 'game-over';

// --- Speech Function ---
const useSpeech = (isMutedRef: React.MutableRefObject<boolean>, isVoiceEnabledRef: React.MutableRefObject<boolean>) => {
  const voicesRef = React.useRef<SpeechSynthesisVoice[]>([]);
  const voicesLoadedRef = React.useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        voicesRef.current = available;
        voicesLoadedRef.current = true;
      }
    };

    // Try immediately
    loadVoices();

    // Setup listener for when voices change
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Retry every 100ms for up to 3 seconds
    const retryInterval = setInterval(() => {
      if (!voicesLoadedRef.current) {
        loadVoices();
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(retryInterval);
      if (!voicesLoadedRef.current) {
        voicesLoadedRef.current = true; // Allow fallback TTS
      }
    }, 3000);

    return () => {
      clearInterval(retryInterval);
      clearTimeout(timeout);
    };
  }, []);

  const findVoice = (gender: 'male' | 'female') => {
    const currentVoices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    
    if (currentVoices.length === 0) {
      return undefined;
    }

    const malePatterns = [/male/i, /masculino/i, /hombre/i, /david/i, /juan/i, /jorge/i, /alex/i, /carlos/i, /miguel/i, /detective/i, /professional/i];
    const femalePatterns = [/female/i, /femenino/i, /mujer/i, /sofia/i, /laura/i, /maria/i, /ana/i, /verónica/i, /martina/i, /detective/i, /professional/i];
    const patterns = gender === 'male' ? malePatterns : femalePatterns;

    const matches = currentVoices.filter(voice => patterns.some(rx => rx.test(voice.name)));
    if (matches.length > 0) {
      return matches.find(voice => voice.localService) || matches[0];
    }

    const sameLang = currentVoices.filter(voice => voice.lang.startsWith('es'));
    if (sameLang.length > 0) {
      return sameLang.find(voice => voice.localService) || sameLang[0];
    }

    return currentVoices.find(voice => voice.localService) || currentVoices[0];
  };

  const speakWithVoice = (text: string, gender: 'male' | 'female') => {
    if (!voicesLoadedRef.current) {
      setTimeout(() => speakWithVoice(text, gender), 200);
      return;
    }

    if (isMutedRef.current || !isVoiceEnabledRef.current) {
      return;
    }

    if ('speechSynthesis' in window && text.trim()) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = findVoice(gender);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'es-ES';
      }
      utterance.rate = 0.85;
      utterance.pitch = gender === 'male' ? 0.85 : 0.95;
      utterance.volume = 0.95;
      
      utterance.onerror = (event) => {
        console.error(`[SPEECH ERROR] ${event.error}`);
      };
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('[SPEECH] Exception:', e);
      }
    }
  };

  const speakSystem = (text: string) => speakWithVoice(text, 'female');
  const speakAlex = (text: string) => speakWithVoice(text, 'male');

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return { speakSystem, speakAlex, stopSpeech };
};

// --- Components ---

const INTERNAL_SCREENS: Screen[] = ['case-tree', 'investigation-map', 'tactical-board'];

const Header = ({ title, subtitle, screen, day, level, onPause, onToggleFullscreen }: {
  title: string;
  subtitle?: string;
  screen: Screen;
  day: number;
  level: number;
  onPause: () => void;
  onToggleFullscreen: () => void;
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
        {screen === 'main-menu' ? 'TERMINAL PRINCIPAL' : `NIVEL ${level} - ${getLevelName(level)}`}
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

const getLevelName = (level: number) => {
  switch (level) {
    case 1: return 'LAS PRIMERAS SEÑALES';
    case 2: return 'EL RUMOR VIRAL';
    case 3: return 'LA CUENTA FANTASMA';
    case 4: return 'ATAQUE COORDINADO';
    case 5: return 'EL NÚCLEO DE LA VERDAD';
    default: return 'INVESTIGACIÓN';
  }
};

type FooterProps = {
  message?: string;
  alexNote?: string;
  onAcceptAlexNote: () => void;
  currentDate: string;
  currentTime: string;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
};

const Footer = ({ message, alexNote, onAcceptAlexNote, currentDate, currentTime, screen, onNavigate }: FooterProps) => {
  const displayText = alexNote || message || '';
  return (
    <footer className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2">
      <div className="retro-border flex-1 bg-black p-3 overflow-visible">
        <div className="text-[10px] mb-1 opacity-70 uppercase">Mensaje del Detective</div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <p className="text-sm flex-1 whitespace-pre-wrap break-words">
            Alex: <span className={cn("italic", alexNote ? "text-red-300" : "text-orange-200")}>{displayText ? `"${displayText}"` : ''}</span>
          </p>
          {alexNote && (
            <button onClick={onAcceptAlexNote} className="btn-action text-[10px] px-2 py-1 self-start bg-red-700 hover:bg-red-600">
              ACEPTAR
            </button>
          )}
        </div>
      </div>
      <div className="retro-border w-1/4 bg-black p-2 flex flex-col justify-between">
        <div className="text-[10px] opacity-70 uppercase">Fecha y Hora</div>
        <div className="text-sm font-vt323">
          <div>{currentDate}</div>
          <div>{currentTime}</div>
        </div>
      </div>
      <div className="retro-border w-full md:w-1/4 bg-black p-2 flex flex-col justify-between">
        <div className="text-[10px] opacity-70 uppercase mb-2">Navegación</div>
        <div className="flex justify-between">
          <button
            onClick={() => onNavigate('case-tree')}
            title="Árbol"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border border-cyber-orange bg-black/90 text-cyber-orange transition hover:bg-cyber-orange hover:text-black',
              screen === 'case-tree' ? 'bg-cyber-orange text-black' : ''
            )}
          >
            <TreeDeciduous size={18} />
          </button>
          <button
            onClick={() => onNavigate('investigation-map')}
            title="Mapa"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border border-cyber-orange bg-black/90 text-cyber-orange transition hover:bg-cyber-orange hover:text-black',
              screen === 'investigation-map' ? 'bg-cyber-orange text-black' : ''
            )}
          >
            <MapPin size={18} />
          </button>
          <button
            onClick={() => onNavigate('tactical-board')}
            title="Tablero"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded border border-cyber-orange bg-black/90 text-cyber-orange transition hover:bg-cyber-orange hover:text-black',
              screen === 'tactical-board' ? 'bg-cyber-orange text-black' : ''
            )}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

// --- New Screens ---

const BOOT_SEQUENCE = [
  "INICIANDO TERMINAL SECURE-OS...",
  "CARGANDO MÓDULO DE ACCESIBILIDAD",
  "CONEXIÓN ESTABLECIDA CON: NETCITY CENTRAL.",
  "Bienvenido a NetCity. En nuestra ciudad digital, la conexión lo es todo. Foros, redes sociales, mensajería instantánea... los estudiantes viven en línea. Pero en los últimos meses, la red se ha oscurecido. Las alertas por casos de ciberacoso y bullying han saturado nuestros servidores. Lo que pasa en la pantalla, está destruyendo vidas en el mundo real."
];

const BootScreen = ({ onComplete, speakSystem }: { onComplete: () => void; speakSystem: (text: string) => void }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [hasNarrated, setHasNarrated] = useState(false);
  const fullText = BOOT_SEQUENCE.join('\n');
  const typingAudioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!hasStarted) return;

    const audio = new Audio('/Texto escribiendose.mp3');
    audio.loop = true;
    audio.volume = 0.7;
    typingAudioRef.current = audio;

    audio.play().catch(e => console.error("Audio typing block:", e));

    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        const char = fullText.charAt(i);
        setDisplayedText(prev => prev + char);
        i++;
      } else {
        clearInterval(interval);
        if (typingAudioRef.current) {
          typingAudioRef.current.pause();
        }
      }
    }, 25);

    return () => {
      clearInterval(interval);
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
      }
    };
  }, [fullText, hasStarted]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!hasStarted) {
          setHasStarted(true);
        }
        else if (displayedText.length === fullText.length) {
          onComplete();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [displayedText.length, fullText.length, hasStarted, onComplete]);

  useEffect(() => {
    if (hasStarted && displayedText === fullText && !hasNarrated) {
      // speakSystem(BOOT_SEQUENCE.join(' '));
      setHasNarrated(true);
    }
  }, [hasStarted, displayedText, fullText, hasNarrated]);

  if (!hasStarted) {
    return (
      <div 
        className="h-full flex items-center justify-center p-12 font-mono text-amber-500 bg-black cursor-pointer hover:bg-white/5 transition-colors duration-300"
        onClick={() => setHasStarted(true)}
      >
        <div className="animate-pulse border-2 border-amber-500 px-8 py-4 text-2xl tracking-widest font-bold">
          [ INICIAR SISTEMA ]
        </div>
      </div>
    );
  }

  const paragraphs = displayedText.split('\n');

  return (
    <div className="h-full flex flex-col items-start justify-center p-12 font-mono text-amber-500 bg-black">
      <div className="space-y-4 max-w-4xl">
        {paragraphs.map((line, i) => (
          <p key={i} className="text-xl leading-relaxed">
            {line}
            {i === paragraphs.length - 1 && displayedText.length < fullText.length && <span className="animate-pulse">_</span>}
          </p>
        ))}
        {displayedText.length === fullText.length && (
          <button
            onClick={onComplete}
            className="mt-8 border-2 border-amber-500 px-8 py-3 text-xl tracking-widest font-bold hover:bg-amber-500 hover:text-black transition-all animate-pulse"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

const IntroScreen = ({ onComplete, speakSystem, speakAlex }: { onComplete: (name: string) => void; speakSystem: (text: string) => void; speakAlex: (text: string) => void }) => {
  const [phase, setPhase] = useState<'profile' | 'authentication' | 'briefing'>('profile');
  const [name, setName] = useState('');
  const [showInsults, setShowInsults] = useState(false);

  useEffect(() => {
    const audio = new Audio('/sounds/page-turn.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === 'profile') {
      // speakSystem('Este es nuestro caso de prioridad máxima. Ella es Valeria, una estudiante de secundaria.');
      // speakSystem('Hace unas semanas, comenzó a recibir mensajes en sus redes. Parecía una simple broma pesada entre compañeros de clase... pero escaló. Rápido.');
      const timer = setTimeout(() => {
        setShowInsults(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'authentication') {
      // speakAlex('Cada mensaje, cada perfil falso, cada amenaza es una pieza del rompecabezas.');
      // speakSystem('Se te ha habilitado el Árbol de la Verdad, un sistema de análisis de decisiones.');
      // speakSystem('Tu trabajo es analizar cada incidente, cruzar las evidencias con el Código Penal Colombiano e insertarlo en el sistema.');
      // speakSystem('A medida que tomes decisiones, el árbol crecerá y se equilibrará solo.');
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'briefing') {
      // speakSystem('Acceso concedido.');
      // speakSystem('Reconstruir el árbol completo de los delitos, identificar al agresor en la raíz y emitir el reporte de sanciones.');
      // speakSystem('Como parte de tu asignación, el departamento te ha brindado un hogar para ti y tu familia. Al final de cada día, se descontará de tu cuenta el costo del arriendo y la comida, ciento cincuenta dólares diarios. Trabaja bien para mantener tu hogar.');
      // speakSystem('Si te equivocas seleccionando el tipo de caso, recibirás una amonestación y no se te pagará completo al final del día.');
      // speakSystem('A los cinco errores, serás desestimado del caso de Valeria y perderás.');
      // speakSystem('Al finalizar el caso se hará una investigación general sobre ti para determinar tu sentido de la justicia.');
      // speakAlex(`El tiempo corre, Detective ${name}. El caso de Valeria está en tus manos.`);
    }
  }, [phase, name]);

  const handleNext = () => {
    if (phase === 'profile') setPhase('authentication');
    else if (phase === 'authentication' && name) setPhase('briefing');
    else if (phase === 'briefing') onComplete(name);
  };

  if (phase === 'profile') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
        <div className="retro-border p-8 max-w-4xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline animate-pulse">ABRIENDO EXPEDIENTE #001: VALERIA</h2>
          <div className="flex gap-6 items-start text-left">
            <div className="w-32 h-40 border-2 border-cyber-orange bg-gray-900 flex items-center justify-center overflow-hidden grayscale opacity-50">
              <img src="https://picsum.photos/seed/valeria/200/300" alt="Valeria" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 space-y-4 text-sm">
              <p className="text-cyber-orange/80 italic font-vt323 text-base">
                Este es nuestro caso de prioridad máxima. Ella es Valeria, una estudiante de secundaria.
              </p>
              <p className="text-cyber-orange/80 italic font-vt323 text-base">
                Hace unas semanas, comenzó a recibir mensajes en sus redes. Parecía una simple broma pesada entre compañeros de clase... pero escaló. Rápido.
              </p>
              {showInsults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-red-500 font-bold animate-pulse font-vt323 text-base">"Burlas públicas. Mensajes ofensivos a todas horas. Ataques coordinados desde cuentas anónimas."</p>
                  <div className="bg-red-900/20 border border-red-500/30 p-3 text-sm space-y-1 font-vt323">
                    <p className="text-red-400">[CENSURADO] "¡Nadie te quiere!"</p>
                    <p className="text-red-400">[CENSURADO] "Eres patética..."</p>
                    <p className="text-red-400">[CENSURADO] "Desaparece de la ciudad"</p>
                  </div>
                  <p className="text-cyber-orange/80 italic mt-4 font-vt323 text-base">
                    Valeria está aislada y asustada. Necesitamos detener esto antes de que las consecuencias sean irreversibles.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          {showInsults && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="btn-primary mt-6"
            >
              CONTINUAR →
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'authentication') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
        <div className="retro-border p-8 max-w-2xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline">AUTENTICANDO USUARIO: ALEX (DETECTIVE ESPECIALISTA EN CRÍMENES DIGITALES)</h2>
          <div className="space-y-4">
            <p className="text-cyber-orange/80 italic font-vt323 text-lg">
              Aquí es donde entras tú, Detective. Los delincuentes digitales creen que pueden esconderse en el caos de la red, pero nosotros no investigamos de forma lineal. Usamos lógica.
            </p>
            <div className="bg-cyber-orange/10 border border-cyber-orange p-4">
              <p className="text-cyber-orange italic font-vt323 text-lg">
                ALEX : Cada mensaje, cada perfil falso, cada amenaza es una pieza del rompecabezas.
              </p>
            </div>
            <p className="text-cyber-orange/80 italic font-vt323 text-lg">
              Se te ha habilitado el Árbol de la Verdad, un sistema de análisis de decisiones. Tu trabajo es analizar cada incidente, cruzar las evidencias con el Código Penal Colombiano e insertarlo en el sistema. A medida que tomes decisiones, el árbol crecerá y se equilibrará solo.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-cyber-orange/30">
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs uppercase opacity-70">Ingrese su nombre de identificación:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-2 border-cyber-orange text-cyber-orange px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-cyber-orange/50"
                placeholder="NOMBRE DEL DETECTIVE"
                autoFocus
              />
            </div>
            <button
              disabled={!name}
              onClick={handleNext}
              className="btn-primary w-full disabled:opacity-50"
            >
              ACCEDER AL SISTEMA
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'briefing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8 overflow-y-auto">
        <div className="retro-border p-8 max-w-4xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline">ACCESO CONCEDIDO</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyber-orange border-b border-cyber-orange/30 pb-2">OBJETIVO PRINCIPAL</h3>
              <p className="font-vt323 text-base text-cyber-orange/80">
                Reconstruir el árbol completo de los delitos, identificar al agresor en la raíz y emitir el reporte de sanciones.
              </p>

              <h3 className="text-lg font-bold text-cyber-orange border-b border-cyber-orange/30 pb-2">SISTEMA ECONÓMICO</h3>
              <p className="font-vt323 text-base text-cyber-orange/80">
                Como parte de tu asignación, el departamento te ha brindado un hogar para ti y tu familia. Al final de cada día, se descontará de tu cuenta el costo del arriendo y la comida ($50 diarios). Trabaja bien para mantener tu hogar.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-500 border-b border-red-500/30 pb-2">⚠️ ADVERTENCIAS</h3>
              <div className="space-y-2">
                <p className="text-red-400 font-vt323 text-base">
                  • Si te equivocas seleccionando el tipo de caso, recibirás una amonestación y no se te pagará completo al final del día.
                </p>
                <p className="text-red-400 font-vt323 text-base">
                  • A los 5 errores, serás desestimado del caso de Valeria y perderás.
                </p>
                <p className="text-red-400 font-vt323 text-base">
                  • Al finalizar el caso se hará una investigación general sobre ti para determinar tu sentido de la justicia.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cyber-orange/10 border border-cyber-orange p-4">
            <p className="text-cyber-orange italic text-center font-vt323 text-xl">
              El tiempo corre, Detective {name}. El caso de Valeria está en tus manos.
            </p>
          </div>

          <button
            onClick={handleNext}
            className="btn-primary"
          >
            COMENZAR INVESTIGACIÓN →
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const GameOverScreen = ({ reason, onRestart }: { reason: string; onRestart: () => void }) => (
  <div className="h-full flex flex-col items-center justify-center p-12 bg-black text-center space-y-8">
    <div className="retro-border p-12 bg-black border-red-600 max-w-xl">
      <h1 className="text-6xl font-black text-red-600 mb-4 uppercase">FIN DEL JUEGO</h1>
      <div className="h-1 bg-red-600 w-full mb-6"></div>
      <p className="text-xl text-white mb-8">{reason}</p>
      <button onClick={onRestart} className="btn-primary bg-red-600 hover:bg-red-700">REINICIAR TERMINAL</button>
    </div>
  </div>
);

// --- Screens ---

const DETECTIVE_AVATARS = [
  "/personaje%201.png",
  "/personaje%202.png",
  "/personaje%203.png",
  "/personaje%204.png",
  "/personaje%205.png",
  "/personaje%206.png"
];

const MainMenu = ({ onNavigate, setShowHelp, setShowSettings, loadGame, playerName }: { onNavigate: (s: Screen) => void; setShowHelp: (v: boolean) => void; setShowSettings: (v: boolean) => void; loadGame: () => Promise<boolean>; playerName: string; }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [avatarIdx, setAvatarIdx] = useState(0);

  const nextAvatar = () => setAvatarIdx((prev) => (prev + 1) % DETECTIVE_AVATARS.length);
  const prevAvatar = () => setAvatarIdx((prev) => (prev - 1 + DETECTIVE_AVATARS.length) % DETECTIVE_AVATARS.length);

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
    try {
      window.close();
    } catch(e) {}
    onNavigate('boot');
  };

  if (isMinimized) {
    return (
      <div className="flex-1 flex flex-col justify-end items-start h-full p-4">
        <div className="retro-border px-4 py-3 bg-black text-cyber-orange flex items-center justify-between w-72 shadow-lg shadow-cyber-orange/20">
          <span className="text-xs font-bold uppercase truncate tracking-wider">CyberDetective (Min.)</span>
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
          <h3 className="text-cyber-orange font-bold text-2xl uppercase mb-6 truncate w-full px-2" title={`Perfil de ${playerName || "Alex"}`}>
            Perfil de <br />
            <span className="text-white">{playerName || "Alex"}</span>
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
              <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase text-cyber-orange">CyberDetective</h1>
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
            <button onClick={handleClose} className="w-full max-w-lg py-3 mt-4 border-2 border-red-900/50 text-red-500 font-bold hover:bg-red-900/30 hover:border-red-500 transition-all uppercase opacity-70 hover:opacity-100">
              Salir de la Terminal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const CAPA_INFO: { level: number; emoji: string; label: string; sublabel: string; description: string }[] = [
  { level: 1, emoji: '💬', label: 'Injuria', sublabel: 'Art. 220', description: 'Imputaciones deshonrosas que afectan el buen nombre de la víctima.' },
  { level: 2, emoji: '📢', label: 'Calumnia', sublabel: 'Art. 221', description: 'Imputación falsa de conducta delictiva con intención de daño.' },
  { level: 3, emoji: '👤', label: 'Suplantación', sublabel: 'Ley 1273/09', description: 'Uso fraudulento de identidad ajena para cometer actos ilícitos en línea.' },
  { level: 4, emoji: '⚠️', label: 'Amenazas/Hostig.', sublabel: 'Art. 347/134B', description: 'Actos reiterados de intimidación y persecución digital sistemática.' },
  { level: 5, emoji: '🕵️', label: 'Concierto', sublabel: 'Art. 340', description: 'Asociación organizada con fines criminales coordinados contra la víctima.' },
];

const PENALTY_OPTIONS: Record<string, { label: string; detail: string }[]> = {
  'Injuria': [
    { label: 'Multa (13.3 – 120 SMMLV)', detail: 'Sanción económica proporcional a la gravedad del mensaje ofensivo.' },
    { label: 'Prisión 16 a 54 meses', detail: 'Pena privativa de la libertad según el Art. 220 C.P.' },
    { label: 'Retractación pública', detail: 'El agresor debe publicar una disculpa formal en los mismos medios usados.' },
  ],
  'Calumnia': [
    { label: 'Multa (13.3 – 120 SMMLV)', detail: 'Sanción económica por imputar falsamente un delito.' },
    { label: 'Prisión 16 a 72 meses', detail: 'Pena privativa de la libertad según el Art. 221 C.P.' },
    { label: 'Rectificación pública', detail: 'Obligación de corregir públicamente la información falsa difundida.' },
  ],
  'Suplantación': [
    { label: 'Prisión 48 a 96 meses', detail: 'Pena por uso fraudulento de identidad ajena (Ley 1273/09 Art. 269C).' },
    { label: 'Multa 100 a 1000 SMMLV', detail: 'Sanción económica elevada por delito informático de suplantación.' },
    { label: 'Eliminación de perfiles falsos', detail: 'Orden judicial para retirar inmediatamente cuentas fraudulentas.' },
  ],
  'Hostigamiento': [
    { label: 'Prisión 12 a 36 meses', detail: 'Pena por hostigamiento sistemático digital (Art. 134B C.P.).' },
    { label: 'Medida de alejamiento', detail: 'Prohibición legal de todo contacto digital con la víctima.' },
    { label: 'Tratamiento psicológico obligatorio', detail: 'Orden judicial de rehabilitación conductual para el agresor.' },
  ],
  'Amenazas': [
    { label: 'Prisión 16 a 72 meses', detail: 'Pena privativa de la libertad por amenazas (Art. 347 C.P.).' },
    { label: 'Detención preventiva', detail: 'Medida cautelar inmediata ante riesgo fundado para la víctima.' },
    { label: 'Medida de alejamiento', detail: 'Prohibición legal de todo contacto digital y físico con la víctima.' },
  ],
  'Concierto para delinquir': [
    { label: 'Prisión 6 a 12 años', detail: 'Pena base por asociación criminal organizada (Art. 340 C.P.).' },
    { label: 'Prisión hasta 18 años', detail: 'Agravante si el concierto es para cometer delitos graves o reiterados.' },
    { label: 'Disolución del grupo criminal', detail: 'Desarticulación judicial de la organización y cierre de canales usados.' },
  ],
};

const InvestigationMap = ({ cataloguedLog, currentLevel }: { cataloguedLog: CatalogueEntry[]; currentLevel: number }) => {
  const [selectedCapa, setSelectedCapa] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CatalogueEntry | null>(null);
  const [alexMsg, setAlexMsg] = useState<string>('');
  const [penalizedIds, setPenalizedIds] = useState<string[]>([]);

  const filteredLog = selectedCapa !== null
    ? cataloguedLog.filter(e => e.level === selectedCapa)
    : cataloguedLog;

  const visibleLog = filteredLog.filter(e => !penalizedIds.includes(e.evidenceId));

  const byDay = visibleLog.reduce<Record<number, CatalogueEntry[]>>((acc, e) => {
    if (!acc[e.day]) acc[e.day] = [];
    acc[e.day].push(e);
    return acc;
  }, {});

  const capaPositions = [
    'top-[5%] left-1/2 -translate-x-1/2',
    'top-[28%] right-[8%]',
    'top-[28%] left-[8%]',
    'bottom-[18%] right-[18%]',
    'bottom-[18%] left-[18%]',
  ];

  return (
    <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2 h-full min-h-0" style={{ fontFamily: '"JetBrains Mono", "Share Tech Mono", monospace' }}>
      {/* Left panel: catalogued evidences */}
      <section className="col-span-3 flex flex-col h-full min-h-0">
        <div className="flex-1 retro-border flex flex-col bg-black h-full min-h-0">
          <div className="panel-header flex items-center justify-between">
            <span className="truncate">
              {selectedCapa !== null ? `CAPA ${selectedCapa} — ${CAPA_INFO[selectedCapa - 1].label}` : 'TODAS LAS EVIDENCIAS'} ({visibleLog.length})
            </span>
            {selectedCapa !== null && (
              <button onClick={() => { setSelectedCapa(null); setSelectedEntry(null); setAlexMsg(''); }} className="text-[9px] text-cyber-orange underline ml-2 shrink-0">VER TODO</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-3 min-h-0">
            {selectedCapa === null ? (
              <p className="text-cyber-orange/40 text-xs text-center py-8 uppercase tracking-widest">Selecciona una capa<br />para ver sus evidencias</p>
            ) : visibleLog.length === 0 ? (
              <p className="text-cyber-orange/40 text-xs text-center py-8 uppercase tracking-widest">Sin evidencias<br />pendientes en esta capa</p>
            ) : (
              Object.entries(byDay)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, entries]) => (
                  <div key={day}>
                    <div className="text-[11px] uppercase font-bold text-cyber-orange border-b border-cyber-orange/30 pb-1 mb-2 tracking-widest">► Día {day}</div>
                    {entries.map(entry => (
                      <button
                        key={entry.evidenceId}
                        onClick={() => { setSelectedEntry(selectedEntry?.evidenceId === entry.evidenceId ? null : entry); setAlexMsg(''); }}
                        className={cn(
                          "w-full text-left border p-2 mb-2 text-[11px] transition-all",
                          selectedEntry?.evidenceId === entry.evidenceId
                            ? "bg-cyber-orange/20 border-cyber-orange"
                            : "bg-black border-cyber-orange/40 hover:border-cyber-orange/70"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-cyber-orange font-bold uppercase text-[10px]">{entry.crimeType}</span>
                          <span className="text-cyber-orange/40 text-[10px] uppercase">{entry.type}</span>
                        </div>
                        <p className="text-cyber-orange/80 italic leading-tight">{entry.content}</p>
                        <p className="text-cyber-orange/40 mt-1 text-[10px]">— {entry.author}</p>
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Middle panel: orbital map with clickable capa buttons */}
      <section className="col-span-6 retro-border bg-black grid-bg relative overflow-hidden p-0">
        <div className="panel-header !rounded-none !mb-0">
          <span>▼ Mapa de Investigación - Capas del Acoso</span>
        </div>
        <div className="absolute inset-0 top-8 flex items-center justify-center">
          {/* SVG connection lines from nucleus to active capas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {(() => {
              const targets = [[50, 9], [88, 31], [12, 31], [79, 82], [21, 82]];
              return CAPA_INFO.map((capa, i) => {
                if (capa.level > currentLevel) return null;
                const [tx, ty] = targets[i];
                const isSelected = selectedCapa === capa.level;
                return (
                  <line
                    key={capa.level}
                    x1="50" y1="50" x2={tx} y2={ty}
                    stroke={isSelected ? 'rgba(220,38,38,0.7)' : 'rgba(220,38,38,0.3)'}
                    strokeWidth={isSelected ? '0.35' : '0.2'}
                  />
                );
              });
            })()}
          </svg>

          <div className="border border-cyber-orange/20 rounded-full w-[420px] h-[420px] absolute" style={{ zIndex: 1 }}></div>
          <div className="border border-cyber-orange/20 rounded-full w-[320px] h-[320px] absolute" style={{ zIndex: 1 }}></div>
          <div className="border border-cyber-orange/20 rounded-full w-[220px] h-[220px] absolute" style={{ zIndex: 1 }}></div>
          <div className="border border-cyber-orange/20 rounded-full w-[120px] h-[120px] absolute" style={{ zIndex: 1 }}></div>

          {CAPA_INFO.map((capa, i) => {
            const isSelected = selectedCapa === capa.level;
            const isAvailable = capa.level <= currentLevel;
            const count = cataloguedLog.filter(e => e.level === capa.level).length;
            return (
              <button
                key={capa.level}
                onClick={() => { if (isAvailable) { setSelectedCapa(isSelected ? null : capa.level); setSelectedEntry(null); setAlexMsg(''); } }}
                title={isAvailable ? `Ver evidencias de Capa ${capa.level}` : 'Capa no desbloqueada'}
                style={{ zIndex: 2 }}
                className={`absolute ${capaPositions[i]} flex flex-col items-center transition-all ${
                  isAvailable ? 'cursor-pointer hover:scale-110' : 'opacity-30 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 border-2 bg-black flex items-center justify-center text-xl relative transition-all ${
                  isSelected ? 'border-white shadow-[0_0_12px_rgba(246,147,34,0.9)]' : 'border-cyber-orange'
                }`}>
                  <span>{capa.emoji}</span>
                  {isSelected && (
                    <div className="absolute -top-6 text-[8px] bg-cyber-orange text-black px-1 font-bold">ACTIVA</div>
                  )}
                  {count > 0 && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[7px] font-bold rounded-full flex items-center justify-center">{count}</div>
                  )}
                </div>
                <div className="text-[7px] text-center mt-1 uppercase font-bold leading-tight">
                  Capa {capa.level}:<br />{capa.label}<br /><span className="opacity-60">({capa.sublabel})</span>
                </div>
              </button>
            );
          })}

          <div className="w-14 h-14 border-2 border-cyber-orange bg-black flex items-center justify-center text-2xl relative z-10">
            <span>🤝</span>
            <div className="absolute -bottom-10 text-[8px] text-center w-28 font-bold uppercase leading-tight">Núcleo de<br />la Verdad</div>
          </div>
        </div>

        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[7px] opacity-50 text-center w-16 uppercase font-bold leading-tight">
          Zona de<br />Chat Pública
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] opacity-50 text-center w-16 uppercase font-bold leading-tight">
          Foros<br />Centrales
        </div>
      </section>

      {/* Right panel: layer details */}
      <section className="col-span-3 flex flex-col h-full min-h-0">
        <div className="retro-border bg-black flex-grow flex flex-col min-h-0">
          <div className="panel-header">
            {selectedCapa !== null ? `Capa ${selectedCapa}: ${CAPA_INFO[selectedCapa - 1].label}` : 'Estado del Caso'}
          </div>
          <div className="flex-1 p-4 bg-paper-bg text-black mx-2 my-2 border border-black shadow-inner overflow-y-auto min-h-0">
            {selectedCapa !== null ? (
              <div className="text-xs space-y-3">
                {alexMsg && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded">
                    <p className="text-[10px] font-bold text-amber-700 mb-1">🔍 DETECTIVE ALEX</p>
                    <p className="text-[11px] text-amber-900 leading-snug">{alexMsg}</p>
                  </div>
                )}
                <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
                  {CAPA_INFO[selectedCapa - 1].emoji} {CAPA_INFO[selectedCapa - 1].label}
                </h2>
                <p><strong>ARTÍCULO:</strong> {CAPA_INFO[selectedCapa - 1].sublabel}</p>
                <p className="italic text-gray-600">{CAPA_INFO[selectedCapa - 1].description}</p>
                <p><strong>EVIDENCIAS:</strong> {filteredLog.length}</p>
                {filteredLog.length === 0 && (
                  <p className="italic text-gray-500">Sin evidencias catalogadas en esta capa.</p>
                )}
                {visibleLog.length === 0 && filteredLog.length > 0 && (
                  <p className="italic text-green-700 font-bold">✓ Todas las evidencias de esta capa han sido procesadas.</p>
                )}

                {/* Selected evidence detail + penalties */}
                {selectedEntry && (
                  <div className="border-t border-black pt-3 space-y-3">
                    <div className="bg-gray-100 border border-gray-400 p-2 rounded">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Comentario seleccionado:</p>
                      <p className="italic text-gray-800 leading-snug">{selectedEntry.content}</p>
                      <p className="text-gray-500 text-[10px] mt-1">@{selectedEntry.author} · Día {selectedEntry.day} · {selectedEntry.type}</p>
                    </div>

                    <div>
                      <p className="font-bold uppercase border-b border-black pb-1 mb-2">Penas posibles ({selectedEntry.crimeType}):</p>
                      <div className="space-y-2">
                        {(PENALTY_OPTIONS[selectedEntry.crimeType] ?? []).map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const msg = `ALEX: He rastreado al usuario @${selectedEntry.author} y se ha notificado la pena posible: "${opt.label}". ${opt.detail} El caso ha sido registrado en el sistema para seguimiento judicial.`;
                              setAlexMsg(msg);
                              setPenalizedIds(prev => [...prev, selectedEntry.evidenceId]);
                              const next = visibleLog.filter(e => e.evidenceId !== selectedEntry.evidenceId);
                              setSelectedEntry(next[0] || null);
                            }}
                            className="w-full text-left bg-white border border-gray-400 hover:bg-amber-50 hover:border-amber-600 p-2 rounded transition-all"
                          >
                            <p className="font-bold text-[11px]">{opt.label}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{opt.detail}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {!selectedEntry && visibleLog.length > 0 && (
                  <p className="text-gray-400 italic text-[10px] mt-2">Haz clic en una evidencia del panel izquierdo para ver las penas posibles.</p>
                )}
              </div>
            ) : (
              <div className="text-xs space-y-3">
                <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Estado del Caso</h2>
                <p><strong>NIVEL ACTUAL:</strong> {currentLevel}</p>
                <p><strong>TOTAL CATALOGADAS:</strong> {cataloguedLog.length}</p>
                <div>
                  <p className="font-bold border-b border-black inline-block mb-1 uppercase">Por Capa:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 mt-1">
                    {CAPA_INFO.filter(c => c.level <= currentLevel).map(c => (
                      <li key={c.level}>
                        Capa {c.level} ({c.label}): <strong>{cataloguedLog.filter(e => e.level === c.level).length}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-500 italic">Haz clic en una capa del mapa para filtrar las evidencias.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const TacticalBoard = ({ state, acceptBribe, rejectBribe }: {
  state: GameState;
  acceptBribe: () => void;
  rejectBribe: () => void;
}) => (
  <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2 h-full min-h-0">
    {/* Left Panel: Bribe History */}
    <aside className="col-span-3 flex flex-col h-full min-h-0">
      <section className="flex-1 bg-black border-2 border-cyber-orange/30 flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex justify-between items-center px-2 py-1 bg-cyber-orange/10 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest">Sobornos Pendientes</span>
          <span className="text-[10px] text-cyber-orange/60">{state.bribeHistory.filter(b => b.status === 'pending').length} activo(s)</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {state.bribeHistory.length === 0 && (
            <div className="text-[10px] text-cyber-orange/40 italic text-center mt-6">
              Sin sobornos registrados aún.
            </div>
          )}

          {state.bribeHistory.map((bribe, i) => (
            <div
              key={i}
              className={`border p-2 text-[10px] ${
                bribe.status === 'pending'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : bribe.status === 'accepted'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-green-600 bg-green-600/10'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold uppercase tracking-wider">Día {bribe.day}</span>
                <span className={`font-bold uppercase text-[9px] px-1 ${
                  bribe.status === 'pending' ? 'text-yellow-400' :
                  bribe.status === 'accepted' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {bribe.status === 'pending' ? '● PENDIENTE' :
                   bribe.status === 'accepted' ? '✗ ACEPTADO' : '✓ RECHAZADO'}
                </span>
              </div>
              <div className="text-cyber-orange/80">
                Oferta: <span className="font-bold text-cyber-orange">${bribe.amount}</span>
              </div>

              {bribe.status === 'pending' && state.pendingBribeOffer !== null && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={acceptBribe}
                    className="flex-1 bg-red-900/60 border border-red-500 text-red-300 text-[9px] uppercase font-bold py-1 hover:bg-red-800 transition-colors"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={rejectBribe}
                    className="flex-1 bg-green-900/60 border border-green-600 text-green-300 text-[9px] uppercase font-bold py-1 hover:bg-green-800 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="shrink-0 border-t border-cyber-orange/20 px-2 py-1 text-[9px] text-cyber-orange/60 flex justify-between">
          <span>Integridad: <span className={state.integrity < 50 ? 'text-red-400' : 'text-green-400'}>{state.integrity}%</span></span>
          <span>Total ofrecido: ${state.bribeHistory.reduce((s, b) => s + b.amount, 0)}</span>
        </div>
      </section>
    </aside>

    <main className="col-span-6 bg-[#5d3a1a] border-[12px] border-[#3d2a1a] shadow-inner relative overflow-hidden flex flex-col p-0">
      {/* Top bar now extends fully down, no black gap */}
      <div className="bg-[#3d2a1a] text-white px-4 py-1 text-[10px] font-bold flex items-center justify-between uppercase !rounded-none !mb-0">
        <span>▼ Pizarrón Táctico Completo - NetCity Investigation</span>
      </div>
      <div className="flex-1 p-6 relative">
        {/* Red String Connections (Visual) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line x1="100" y1="100" x2="300" y2="80" stroke="red" strokeWidth="2" />
          <line x1="200" y1="150" x2="350" y2="150" stroke="red" strokeWidth="2" />
          <line x1="350" y1="150" x2="450" y2="250" stroke="red" strokeWidth="2" />
        </svg>

        <div className="absolute top-10 left-10 w-32 h-40 bg-white border border-gray-400 p-2 shadow-lg -rotate-3 z-20">
          <div className="h-1 bg-red-800 mb-2"></div>
          <p className="text-[7px] text-gray-800 leading-tight uppercase">Calumnia (Art. 222)<br />Libertad del buen nombre mediante ofensas directas Denuncia</p>
          <div className="mt-4 border-2 border-red-500 text-center text-[10px] font-bold text-red-500 p-1">INJURIA</div>
        </div>

        <div className="absolute top-20 left-48 w-16 h-20 bg-white p-1 shadow-md z-20 border border-gray-300">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB_2S5DYrjA9ZYHAo6KMUF_yJPF0sAAMcsTSeMRgC3Awh_luQTL58EG2mD7lHvdQQugyaU3nHXcQN8AKhbWFU9Ps9OPSgNag8nHoERi-O9J6OGw-_fpNLnALbkk5YZqucnagnugsBKY5Ek64QN_Fkb719pgDqYJHtMuM7PVrLSk7JzzsLXB9GDzzrFG4on0oYYBCBYPFftl5wMkkITbJuOqpDfykqByuOby3ojAID9TaGAr-J3Zit9Y8ME4WWQu86AE1F2gvOnDIM"
            alt="Suspect"
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="absolute top-10 left-80 w-24 h-24 bg-black/80 border-2 border-cyber-orange flex flex-col items-center justify-center text-cyber-orange p-1 z-30">
          <div className="text-lg">💬</div>
          <div className="text-[8px] text-center font-bold uppercase">ID: 001<br />Injuria (Art. 220)</div>
        </div>

        <div className="absolute top-44 left-10 bg-yellow-200 p-2 w-36 text-[9px] font-bold z-40 text-black shadow-md -rotate-1">
          ¡IP de anon_7834 rastreada a NetCity Central!
        </div>

        <div className="absolute bottom-4 left-4 right-4 bg-black/40 border border-white/20 p-2 flex items-center justify-around h-12 backdrop-blur-sm">
          <div className="text-[8px] text-white flex flex-col items-center">
            <div className="w-2 h-2 bg-cyber-orange mb-1"></div>
            NetCity Central
          </div>
          <div className="w-20 h-px bg-white/40"></div>
          <div className="text-[8px] text-white flex flex-col items-center">
            <div className="w-2 h-2 bg-cyber-orange mb-1"></div>
            Deep Net
          </div>
          <div className="w-20 h-px bg-white/40"></div>
          <div className="text-[8px] text-white flex flex-col items-center">
            <div className="w-2 h-2 bg-cyber-orange mb-1"></div>
            NetCity Central
          </div>
        </div>
      </div>
    </main>

    <aside className="col-span-3 flex flex-col gap-2">
      <section className="bg-paper-bg text-black p-4 retro-border relative h-1/2 overflow-hidden">
        <div className="absolute top-0 right-0 bg-black text-cyber-orange px-2 py-1 text-[8px] font-bold uppercase">Capa Actual</div>
        <h2 className="text-lg font-bold mb-2 mt-4 underline uppercase">Las Primeras Señales</h2>
        <div className="text-[10px] space-y-3">
          <p><strong>SITUACIÓN:</strong> Valeria comienza a recibir mensajes ofensivos en redes sociales. Parecen bromas aisladas pero se repiten.</p>
          <div>
            <p className="font-bold border-b border-black inline-block mb-1 uppercase">Objetivos:</p>
            <ul className="list-disc list-inside">
              <li>Recolectar capturas</li>
              <li>Identificar usuario</li>
              <li>Clasificar agresión</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="flex-1 bg-black border-2 border-cyber-orange/20 p-2 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-2 bg-cyber-orange/10 px-2">
          <span className="text-[8px] font-bold uppercase">Resumen Global</span>
        </div>
        <div className="flex-1 bg-orange-50 text-orange-950 p-4 font-bold text-[10px] leading-relaxed border-4 border-double border-orange-900">
          <p>Investigación activa para desentrañar el acoso coordinado contra Valeria.</p>
          <p className="mt-4">Múltiples pistas y delitos identificados.</p>
          <p className="mt-4">Seguir el Árbol de la Verdad.</p>
        </div>
      </section>
    </aside>
  </div>
);

// --- Level metadata ---

const LEVEL_DESCRIPTIONS: Record<number, { name: string; icon: string; description: string }> = {
  1: { name: 'LAS PRIMERAS SEÑALES', icon: '💬', description: 'Mensajes ofensivos en redes sociales. Identifica los casos de Injuria (Art. 220).' },
  2: { name: 'EL RUMOR VIRAL', icon: '📢', description: 'Información falsa se difunde por la red escolar. Clasifica los casos de Calumnia (Art. 221).' },
  3: { name: 'LA CUENTA FANTASMA', icon: '👤', description: 'Alguien usurpa la identidad de Valeria en línea. Investiga la Suplantación (Ley 1273).' },
  4: { name: 'ATAQUE COORDINADO', icon: '⚠️', description: 'El acoso escala a amenazas directas y hostigamiento sistemático. Máxima presión.' },
  5: { name: 'EL NÚCLEO DE LA VERDAD', icon: '🔍', description: 'Fase final. Identifica la red criminal detrás del ataque coordinado y emite el veredicto.' },
};

// --- Day Transition Modal ---

const DayTransitionModal = ({ info, onContinue }: { info: DayTransitionInfo; onContinue: () => void }) => {
  const [phase, setPhase] = useState<'summary' | 'level-unlock'>('summary');
  const levelData = LEVEL_DESCRIPTIONS[info.nextLevel];

  const handleContinue = () => {
    if (phase === 'summary' && info.levelChanged) setPhase('level-unlock');
    else onContinue();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        {phase === 'summary' ? (
          <motion.div key="summary"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="retro-border bg-black max-w-lg w-full p-8 space-y-5"
          >
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Informe de jornada</p>
              <motion.h2 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
                className="text-5xl font-black font-vt323 text-cyber-orange"
              >DÍA {info.completedDay} COMPLETADO</motion.h2>
            </div>
            <div className="h-px bg-cyber-orange/30" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center opacity-70">
                <span className="uppercase text-xs">Fondos anteriores</span>
                <span className="font-vt323 text-xl">${info.moneyBefore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase text-xs opacity-70">Renta</span>
                <span className="font-vt323 text-xl text-red-400">− $30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase text-xs opacity-70">Comida</span>
                <span className="font-vt323 text-xl text-red-400">− $20</span>
              </div>
              <div className="flex justify-between items-center opacity-70">
                <span className="uppercase text-xs">Costo total</span>
                <span className="font-vt323 text-xl text-red-400">− $50</span>
              </div>
              <div className="h-px bg-cyber-orange/20" />
              <div className="flex justify-between items-center">
                <span className="uppercase font-bold text-sm">Fondos actuales</span>
                <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                  className={cn('font-vt323 text-4xl font-bold',
                    info.moneyAfter < 0 ? 'text-red-500' : info.moneyAfter < 50 ? 'text-yellow-400' : 'text-green-400')}
                >${info.moneyAfter}</motion.span>
              </div>
              {info.isGameOverNext && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="text-red-500 text-xs font-bold uppercase text-center animate-pulse"
                >⚠️ Fondos insuficientes — continuar cerrará el caso</motion.p>
              )}
            </div>
            <div className="h-px bg-cyber-orange/30" />
            <div className="space-y-2">
              <p className="text-[10px] uppercase opacity-60 tracking-wider">Amonestaciones acumuladas</p>
              <div className="flex gap-2 items-end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.05 * i + 0.3 }}
                    className={cn('font-vt323 text-2xl', i < info.amonestations ? 'text-red-500' : 'text-cyber-orange/25')}
                  >{i < info.amonestations ? '[✗]' : '[ ]'}</motion.span>
                ))}
                <span className="text-xs opacity-50 ml-1">{info.amonestations}/5</span>
              </div>
            </div>
            {info.levelChanged && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="border border-cyber-orange bg-cyber-orange/10 p-3 text-center space-y-1"
              >
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Nueva fase desbloqueada</p>
                <p className="font-bold text-cyber-orange uppercase text-sm">
                  {levelData?.icon} NIVEL {info.nextLevel} — {levelData?.name}
                </p>
              </motion.div>
            )}
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              onClick={handleContinue} className="btn-primary w-full text-base"
            >{info.levelChanged ? 'VER NUEVO NIVEL →' : 'CONTINUAR →'}</motion.button>
          </motion.div>
        ) : (
          <motion.div key="level-unlock"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.35 }}
            className="retro-border bg-black max-w-lg w-full p-10 text-center space-y-6"
          >
            <motion.p initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="text-[10px] uppercase tracking-[0.4em] opacity-50"
            >— Nueva fase desbloqueada —</motion.p>
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 140, damping: 10 }}
              className="text-8xl select-none"
            >{levelData?.icon}</motion.div>
            <div className="space-y-2">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="font-vt323 text-2xl text-cyber-orange/60"
              >NIVEL {info.nextLevel}</motion.p>
              <motion.h2 initial={{ letterSpacing: '0.6em', opacity: 0 }} animate={{ letterSpacing: '0.08em', opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.55 }}
                className="text-3xl font-black uppercase text-cyber-orange"
              >{levelData?.name}</motion.h2>
            </div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="border border-cyber-orange/30 p-4 text-sm text-cyber-orange/80 leading-relaxed"
            >{levelData?.description}</motion.div>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              onClick={handleContinue} className="btn-primary w-full text-base"
            >COMENZAR NIVEL {info.nextLevel} →</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Helpers ---

const GAME_START_DATE = new Date(2005, 9, 14); // Mes 9 = octubre
const GAME_DAY_DURATION = 300; // segundos reales por día de juego (5 minutos reales)
const GAME_DAY_SECONDS = 8 * 3600;
const GAME_SPEED = GAME_DAY_SECONDS / GAME_DAY_DURATION;

const getCurrentGameDate = (day: number) => {
  const date = new Date(GAME_START_DATE);
  date.setDate(date.getDate() + day - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

const getCurrentGameTime = (timeRemaining: number) => {
  const elapsedReal = Math.max(0, GAME_DAY_DURATION - timeRemaining);
  const elapsedGameSeconds = elapsedReal * GAME_SPEED;
  const totalSeconds = 10 * 3600 + elapsedGameSeconds;
  const cappedSeconds = Math.min(GAME_DAY_SECONDS + 10 * 3600, totalSeconds);
  const hours24 = Math.min(18, Math.floor(cappedSeconds / 3600));
  const minutes = Math.floor((cappedSeconds % 3600) / 60);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = ((hours24 + 11) % 12) + 1;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const getTreeDepth = (node: GameNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
};

// --- Main App ---

export default function App() {
  const {
    state,
    message,
    alexAlertMessage,
    dayTransitionInfo,
    avlRotationFlag,
    setPlayerName,
    selectEvidence,
    classifyCrime,
    startDayTransition,
    confirmEndDay,
    acknowledgeAlexAlert,
    acceptBribe,
    rejectBribe,
    submitFinalVerdict,
    saveGame,
    loadGame,
    resetGame,
    pauseGame,
    resumeGame,
  } = useGameState();

  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const [screen, setScreen] = useState<Screen>('boot');
  const [selectedCrime, setSelectedCrime] = useState<CrimeType>('None');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showPauseRules, setShowPauseRules] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showAvlFlash, setShowAvlFlash] = useState(false);
  const isMutedRef = React.useRef(false);
  const isVoiceEnabledRef = React.useRef(true);

  const { speakSystem, speakAlex, stopSpeech } = useSpeech(isMutedRef, isVoiceEnabledRef);

  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        const text = target.textContent?.trim() || '';
        if (text) {
          // speakSystem(text);
        }
      }
    };
    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => document.removeEventListener('mouseenter', handleMouseEnter, true);
  }, []);

  // Stop speech when mute or voice is toggled
  useEffect(() => {
    if ((isMuted || !isVoiceEnabled) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted, isVoiceEnabled]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const buttonAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const avlFlashTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const treeScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [treeOffset, setTreeOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const treeDragState = React.useRef({ active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });

  const currentDate = getCurrentGameDate(state.day);
  const currentTime = getCurrentGameTime(state.timeRemaining);

  const handleTreePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (!treeScrollRef.current) return;

    treeDragState.current.active = true;
    treeDragState.current.startX = e.clientX;
    treeDragState.current.startY = e.clientY;
    treeDragState.current.startOffsetX = treeOffset.x;
    treeDragState.current.startOffsetY = treeOffset.y;
    treeScrollRef.current.setPointerCapture(e.pointerId);
    treeScrollRef.current.style.cursor = 'grabbing';
  };

  const handleTreePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!treeDragState.current.active || !treeScrollRef.current) return;
    const dx = e.clientX - treeDragState.current.startX;
    const dy = e.clientY - treeDragState.current.startY;
    setTreeOffset({
      x: treeDragState.current.startOffsetX + dx,
      y: treeDragState.current.startOffsetY + dy,
    });
  };

  const endTreeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!treeDragState.current.active || !treeScrollRef.current) return;
    treeDragState.current.active = false;
    treeScrollRef.current.releasePointerCapture(e.pointerId);
    treeScrollRef.current.style.cursor = 'grab';
  };

  // Keep refs in sync with the latest mute/voice settings
  useEffect(() => {
    isMutedRef.current = isMuted;
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isMuted, isVoiceEnabled]);

  const getAvailableCrimeTypes = (day: number): CrimeType[] => {
    if (day <= 2) {
      return ['Injuria', 'None'];
    } else if (day <= 4) {
      return ['Injuria', 'Calumnia', 'None'];
    } else if (day <= 6) {
      return ['Injuria', 'Calumnia', 'Suplantación', 'None'];
    } else if (day <= 8) {
      return ['Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento', 'None'];
    } else {
      return ['Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento', 'Amenazas', 'None'];
    }
  };

  // Background music initialization and playback control (plays everywhere unless muted)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/sounds/Musica de Fondo.mp3');
      audio.loop = true;
      audio.volume = 0.12;
      audioRef.current = audio;
    }

    const currentMusic = audioRef.current;
    
    if (!isMuted) {
      currentMusic.play().catch(() => { });
    } else {
      currentMusic.pause();
    }

    const unblockPlay = () => {
      if (!isMuted) {
        currentMusic.play().catch(() => {});
      }
      window.removeEventListener('click', unblockPlay);
      window.removeEventListener('keydown', unblockPlay);
    };

    window.addEventListener('click', unblockPlay);
    window.addEventListener('keydown', unblockPlay);

    return () => {
      window.removeEventListener('click', unblockPlay);
      window.removeEventListener('keydown', unblockPlay);
    };
  }, [isMuted]);

  // Preload button sound
  useEffect(() => {
    buttonAudioRef.current = new Audio('/Botones.mp3');
    buttonAudioRef.current.volume = 0.45;
  }, []);

  // Global button click sound — covers every <button> in the app without touching each one
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isMutedRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        const audio = buttonAudioRef.current;
        if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // AVL rotation flash — fires whenever avlRotationFlag increments
  useEffect(() => {
    if (avlRotationFlag === 0) return;
    if (avlFlashTimer.current) clearTimeout(avlFlashTimer.current);
    setShowAvlFlash(true);
    avlFlashTimer.current = setTimeout(() => setShowAvlFlash(false), 2000);
  }, [avlRotationFlag]);

  useEffect(() => {
    if (state.isGameOver) setScreen('game-over');
  }, [state.isGameOver]);

  const getScreenTitle = () => {
    switch (screen) {
      case 'boot': return 'SISTEMA INICIANDO...';
      case 'intro': return 'AUTENTICACIÓN DE USUARIO';
      case 'main-menu': return `CyberDetective: Terminal de ${state.playerName || 'Alex'}`;
      case 'case-tree': return 'CyberDetective: El Árbol de la Verdad';
      case 'investigation-map': return 'CyberDetective: Mapa de Investigación';
      case 'tactical-board': return 'CyberDetective: Pizarra Táctica';
      case 'game-over': return 'SISTEMA BLOQUEADO';
      default: return 'CyberDetective';
    }
  };

  const handleClassify = () => {
    if (state.currentEvidence) {
      classifyCrime(state.currentEvidence.id, selectedCrime);
      setSelectedCrime('None');
    }
  };

  const renderTreeNode = (node: GameNode | null, x: number, y: number, level: number): React.ReactNode => {
    if (!node) return null;
    const offset = 120 / (level + 1);
    return (
      <React.Fragment key={node.id}>
        {/* Lines to children */}
        {node.left && (
          <line x1={x} y1={y} x2={x - offset} y2={y + 60}
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        )}
        {node.right && (
          <line x1={x} y1={y} x2={x + offset} y2={y + 60}
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        )}

        {/* Node — outer g positions; inner motion.g animates entry */}
        <g transform={`translate(${x - 20}, ${y - 20})`}>
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            style={{ transformBox: 'fill-box', transformOrigin: '20px 20px', cursor: 'pointer' }}
            filter="url(#crt-glow)"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
            }}
          >
            <rect width="40" height="40" fill="black" stroke={selectedNodeId === node.id ? '#fff' : '#f69322'} strokeWidth={selectedNodeId === node.id ? 2.5 : 2} />
            <text x="20" y="26" textAnchor="middle" fill="#f69322" fontSize="16" fontWeight="bold" fontFamily="VT323, monospace">
              {node.age}
            </text>
            {selectedNodeId === node.id && (() => {
              const entry = state.cataloguedLog.find(e => e.evidenceId === node.evidenceId);
              return entry ? (
                <g transform="translate(44, -4)">
                  <rect x="0" y="0" width="124" height="44" fill="black" stroke="#f69322" strokeWidth="1.5" rx="2" />
                  <text x="6" y="14" fill="#f69322" fontSize="10" fontFamily="VT323, monospace">@{entry.author}</text>
                  <text x="6" y="30" fill="#f69322" fontSize="10" fontFamily="VT323, monospace">{entry.crimeType.toUpperCase()}</text>
                </g>
              ) : null;
            })()}
          </motion.g>
        </g>
        {node.left && renderTreeNode(node.left, x - offset, y + 60, level + 1)}
        {node.right && renderTreeNode(node.right, x + offset, y + 60, level + 1)}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-cyber-orange font-vt323">
      {screen !== 'boot' && screen !== 'intro' && screen !== 'main-menu' && (
        <Header
          title={getScreenTitle()}
          screen={screen}
          day={state.day}
          level={state.level}
          onPause={() => {
            setShowPauseMenu(true);
            pauseGame();
          }}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {screen === 'boot' && <BootScreen onComplete={() => setScreen('intro')} speakSystem={speakSystem} />}
            {screen === 'intro' && <IntroScreen onComplete={(name) => { setPlayerName(name); setScreen('main-menu'); }} speakSystem={speakSystem} speakAlex={speakAlex} />}
            {screen === 'main-menu' && <MainMenu onNavigate={setScreen} setShowHelp={setShowHelp} setShowSettings={setShowSettings} loadGame={loadGame} playerName={state.playerName} />}

            {screen === 'case-tree' && (
              <div className="flex-1 flex space-x-2 overflow-hidden py-2 h-full">
                {/* Panel Izquierdo: Dossier & Evidencias */}
                <section className="w-1/4 flex flex-col space-y-2">
                  <div className="retro-border flex-1 flex flex-col bg-black">
                    <div className="panel-header">Dossier: Valeria</div>
                    <div className="p-4 flex-1 flex items-center justify-center">
                      <div className="paper-texture w-full h-full p-4 relative text-sm overflow-hidden text-black">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-24 h-24 border-2 border-black/20 overflow-hidden bg-gray-300">
                            <img src="/Valeria.png" alt="Valeria" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-gray-600 mb-1">Dossier de Víctima</p>
                            <h2 className="text-base font-bold uppercase leading-tight">Valeria</h2>
                            <p className="text-[10px] uppercase mt-2">Nivel {state.level}</p>
                            <p className="text-[10px] opacity-80">{getLevelName(state.level)}</p>
                          </div>
                        </div>
                        <p className="text-[10px] leading-tight">
                          {state.level === 1 && "Valeria reporta mensajes ofensivos constantes."}
                          {state.level === 2 && "Rumores falsos circulan en la red escolar."}
                          {state.level === 3 && "Se ha detectado un perfil suplantando a la víctima."}
                          {state.level === 4 && "Ataques coordinados masivos. Presión alta."}
                          {state.level === 5 && "Fase final. Identifica al culpable raíz."}
                        </p>
                        <div className="absolute bottom-2 right-2 stamp">ACTIVO</div>
                      </div>
                    </div>
                  </div>
                  <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
                    <div className="panel-header">Evidencias Pendientes ({state.evidenceCollected.length})</div>
                    <div className="p-2 overflow-y-auto flex-1 space-y-2 cyber-scroll">
                      {state.evidenceCollected.map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => selectEvidence(ev)}
                          className={cn(
                            "w-full text-left p-2 text-xs border transition-all",
                            state.currentEvidence?.id === ev.id ? "bg-cyber-orange text-black border-white" : "bg-gray-900 text-cyber-orange border-cyber-orange/30 hover:bg-gray-800"
                          )}
                        >
                          <div className="flex justify-between font-bold mb-1">
                            <span>{ev.type} - @{ev.author} • {ev.age} años</span>
                            <span>{ev.timestamp}</span>
                          </div>
                          <p className="truncate opacity-80">{ev.content}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Panel Central: Árbol */}
                <section className="flex-1 flex flex-col space-y-2">
                  <div className="retro-border flex-1 flex flex-col bg-black grid-bg relative overflow-hidden">
                    <div className="panel-header">
                      Árbol de la Verdad
                      <span className="text-[10px] font-normal opacity-60">
                        {state.tree ? `${getTreeDepth(state.tree)} niveles` : 'vacío'}
                      </span>
                    </div>
                    <div
                    ref={treeScrollRef}
                    className="flex-1 p-4 relative overflow-hidden cursor-grab"
                    onPointerDown={handleTreePointerDown}
                    onPointerMove={handleTreePointerMove}
                    onPointerUp={endTreeDrag}
                    onPointerLeave={endTreeDrag}
                  >
                      {/* SVG height grows with tree depth */}
                      <svg
                        className="w-full"
                        style={{
                          minHeight: `${Math.max(400, getTreeDepth(state.tree) * 80 + 80)}px`,
                        }}
                      >
                        <g transform={`translate(${300 + treeOffset.x}, ${40 + treeOffset.y})`}>
                          {state.tree ? renderTreeNode(state.tree, 300, 40, 0) : (
                            <text x="50%" y="50%" textAnchor="middle" fill="rgba(246,147,34,0.3)" fontSize="12" fontFamily="VT323, monospace">
                              Esperando inserción de nodos...
                            </text>
                          )}
                        </g>
                      </svg>
                    </div>
                    {/* Tree balance flash */}
                    <AnimatePresence>
                      {showAvlFlash && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-400/20 border border-yellow-400 px-5 py-2 text-yellow-300 font-bold text-sm uppercase tracking-widest z-20 pointer-events-none"
                        >
                          ⚡ ÁRBOL EQUILIBRADO
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {state.level === 4 && (
                      <div className="absolute top-10 right-4 w-48 bg-red-900/80 border border-red-500 p-2 text-[10px] animate-pulse">
                        <p className="font-bold uppercase mb-1">⚠️ LLAMADA ENTRANTE</p>
                        <p>"Detective, soy el padre de uno de los chicos. Tenemos $500 para usted si olvida esta evidencia..."</p>
                        <button onClick={() => acceptBribe()} className="mt-2 w-full bg-red-600 text-white py-1 hover:bg-red-500">ACEPTAR SOBORNO</button>
                      </div>
                    )}
                  </div>
                  <div className="retro-border h-24 flex items-center p-2 bg-black space-x-2">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <button onClick={handleClassify} className="btn-primary col-span-2 h-full text-lg">CLASIFICAR E INSERTAR</button>
                      <button onClick={saveGame} className="btn-action h-full flex flex-col items-center justify-center text-blue-400 border-blue-900/50">
                        <FileText size={16} />
                        <span>GUARDAR</span>
                      </button>
                      <button onClick={startDayTransition} className="btn-action h-full flex flex-col items-center justify-center">
                        <Coffee size={16} />
                        <span>TERMINAR DÍA</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Panel Derecho: Info Legal & Clasificación */}
                <section className="w-1/3 flex flex-col space-y-2">
                  <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
                    <div className="panel-header">Clasificación de Delito</div>
                    <div className="p-4 flex-1 min-h-0 flex flex-col gap-4 bg-[#0a0a0a]">
                      {state.currentEvidence ? (
                        <>
                          <div className="bg-cyber-orange/10 border border-cyber-orange p-3">
                            <p className="text-[10px] uppercase opacity-60 mb-1">Evidencia Seleccionada:</p>
                            <p className="text-sm font-bold">"{state.currentEvidence.content}"</p>
                            <p className="text-[10px] mt-2 italic">Detalle: {state.currentEvidence.details}</p>
                          </div>
                          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 cyber-scroll">
                            {getAvailableCrimeTypes(state.day).map(crime => (
                              <button
                                key={crime}
                                onClick={() => setSelectedCrime(crime)}
                                className={cn(
                                  "w-full text-left p-2 border text-xs transition-all",
                                  selectedCrime === crime ? "bg-cyber-orange text-black border-white" : "bg-black text-cyber-orange border-cyber-orange/30 hover:border-cyber-orange"
                                )}
                              >
                                <div className="flex justify-between font-bold">
                                  <span>{crime}</span>
                                  <span className="opacity-60">{CRIME_INFO[crime].article}</span>
                                </div>
                                {selectedCrime === crime && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-2 pt-2 border-t border-black/20 text-[10px]">
                                    <p>{CRIME_INFO[crime].description}</p>
                                    <div className="mt-2 space-y-1">
                                      {CRIME_INFO[crime].requirements.map(req => (
                                        <div key={req} className="flex items-center gap-1">
                                          <div className="w-2 h-2 border border-black"></div>
                                          <span>{req}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                          <Search size={48} className="mb-4" />
                          <p className="uppercase tracking-widest text-xs">Seleccione una evidencia para analizar</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {state.level === 5 && (
                    <div className="retro-border h-32 bg-black p-4 flex flex-col gap-2">
                      <p className="text-[10px] font-bold uppercase text-red-500">VERDICTO FINAL: ¿Es culpable el sospechoso principal?</p>
                      <div className="flex gap-2">
                        <button onClick={() => submitFinalVerdict(true)} className="flex-1 bg-green-900 border border-green-500 text-green-500 py-2 hover:bg-green-500 hover:text-black">CULPABLE</button>
                        <button onClick={() => submitFinalVerdict(false)} className="flex-1 bg-red-900 border border-red-500 text-red-500 py-2 hover:bg-red-500 hover:text-black">INOCENTE</button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {screen === 'investigation-map' && <InvestigationMap cataloguedLog={state.cataloguedLog} currentLevel={state.level} />}
            {screen === 'tactical-board' && <TacticalBoard state={state} acceptBribe={acceptBribe} rejectBribe={rejectBribe} />}
            {screen === 'game-over' && <GameOverScreen reason={state.gameOverReason} onRestart={() => { resetGame(); setScreen('boot'); }} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {screen !== 'boot' && screen !== 'intro' && screen !== 'game-over' && screen !== 'main-menu' && (
        <Footer
          message={message}
          alexNote={alexAlertMessage}
          onAcceptAlexNote={acknowledgeAlexAlert}
          currentDate={currentDate}
          currentTime={currentTime}
          screen={screen}
          onNavigate={setScreen}
        />
      )}

      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center px-4 py-6"
          >
            <div className="retro-border bg-black max-w-xs w-full p-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] uppercase opacity-50 tracking-[0.3em]">Juego en Pausa</p>
                  <h2 className="text-3xl font-black font-vt323 text-cyber-orange">PAUSA</h2>
                </div>
                <button onClick={() => { setShowPauseMenu(false); setShowPauseRules(false); resumeGame(); }} className="text-cyber-orange hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowPauseMenu(false); setShowPauseRules(false); resumeGame(); }}
                  className="btn-primary w-full h-12 text-lg flex items-center justify-center"
                >Reanudar</button>
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="btn-action w-full h-12 flex items-center justify-center relative"
                  aria-label={isMuted ? 'Poner volumen' : 'Quitar volumen'}
                >
                  <span className="relative flex items-center justify-center">
                    <Volume2 size={28} />
                    {isMuted && (
                      <svg className="absolute left-0 right-0 top-1/2 w-full h-6 pointer-events-none" style={{transform: 'translateY(-50%)'}}>
                        <line x1="6" y1="18" x2="22" y2="6" stroke="#ff3c00" strokeWidth="3" strokeLinecap="square" />
                      </svg>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setIsVoiceEnabled(v => !v)}
                  className="btn-action w-full h-12 flex items-center justify-center relative"
                  aria-label={isVoiceEnabled ? 'Desactivar voz' : 'Activar voz'}
                >
                  <span className="relative flex items-center justify-center">
                    {isVoiceEnabled ? (
                      <Mic size={28} />
                    ) : (
                      <>
                        <MicOff size={28} />
                        <svg className="absolute left-0 right-0 top-1/2 w-full h-6 pointer-events-none" style={{transform: 'translateY(-50%)'}}>
                          <line x1="6" y1="18" x2="22" y2="6" stroke="#ff3c00" strokeWidth="3" strokeLinecap="square" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setShowPauseRules(r => !r)}
                  className="btn-action w-full h-12 text-lg flex items-center justify-center"
                >
                  {showPauseRules ? 'Ocultar reglas' : 'Reglas del juego'}
                </button>
                <button
                  onClick={() => { setShowPauseMenu(false); setShowPauseRules(false); resetGame(); setScreen('main-menu'); }}
                  className="w-full h-12 text-lg flex items-center justify-center border border-red-700 text-red-500 hover:bg-red-900/30 transition-colors font-vt323 uppercase tracking-widest"
                >
                  Menú Principal
                </button>
              </div>
              {showPauseRules && (
                <div className="retro-border bg-[#0a0a0a] p-4 text-sm space-y-3 max-h-[45vh] overflow-y-auto">
                  <p className="uppercase text-[10px] tracking-widest opacity-50">Reglas del juego</p>
                  <ul className="list-disc ml-4 space-y-2">
                    <li>Clasifica cada evidencia correctamente para ganar $10.</li>
                    <li>Las malas clasificaciones no suman dinero y aumentan tus amonestaciones.</li>
                    <li>5 amonestaciones terminan el juego.</li>
                    <li>Cada día cuesta $50 ($30 renta y $20 comida).</li>
                    <li>Usa el árbol, el mapa y el tablero para organizar tu investigación.</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <div className="retro-border bg-black max-w-2xl w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-cyber-orange pb-2">
                <h2 className="text-xl font-bold uppercase">Manual de Operaciones</h2>
                <button onClick={() => setShowHelp(false)} className="text-cyber-orange hover:text-white"><X /></button>
              </div>
              <div className="space-y-4 text-sm overflow-y-auto max-h-[60vh] pr-2">
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">1. El Árbol de la Verdad</h3>
                  <p>Tu objetivo es construir un árbol de decisiones balanceado. Cada evidencia clasificada correctamente se inserta como un nodo. El árbol ajusta su forma automáticamente para mantener la investigación eficiente y estructurada.</p>
                </section>
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">2. Clasificación Legal</h3>
                  <p>Debes analizar cada evidencia y compararla con el Código Penal. Si fallas, recibirás una amonestación. 5 amonestaciones significan el fin de tu carrera.</p>
                </section>
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">3. Economía de Supervivencia</h3>
                  <p>Cada día tiene un costo de $50 ($30 renta y $20 comida). Si te quedas sin dinero, serás desalojado y el juego terminará. ¡Administra bien tus recompensas!</p>
                </section>
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">4. Integridad vs. Corrupción</h3>
                  <p>A partir del Nivel 4, podrías recibir ofertas de soborno. Aceptar dinero fácil te ayudará económicamente, pero pondrá en riesgo tu veredicto final.</p>
                </section>
              </div>
              <button onClick={() => setShowHelp(false)} className="btn-primary w-full">ENTENDIDO</button>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <div className="retro-border bg-black max-w-md w-full p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-cyber-orange pb-2">
                <h2 className="text-xl font-bold uppercase">Ajustes del Sistema</h2>
                <button onClick={() => setShowSettings(false)} className="text-cyber-orange hover:text-white"><X /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase">Alto Contraste</span>
                  <div className="w-10 h-5 bg-gray-800 border border-cyber-orange relative cursor-pointer">
                    <div className="absolute left-0 top-0 w-5 h-full bg-cyber-orange"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase">Narración de Texto</span>
                  <div className="w-10 h-5 bg-gray-800 border border-cyber-orange relative cursor-pointer">
                    <div className="absolute right-0 top-0 w-5 h-full bg-gray-600"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase">Subtítulos</span>
                  <div className="w-10 h-5 bg-gray-800 border border-cyber-orange relative cursor-pointer">
                    <div className="absolute left-0 top-0 w-5 h-full bg-cyber-orange"></div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="btn-primary w-full">GUARDAR CAMBIOS</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Transition Modal */}
      <AnimatePresence>
        {dayTransitionInfo && (
          <DayTransitionModal info={dayTransitionInfo} onContinue={confirmEndDay} />
        )}
      </AnimatePresence>

    </div>
  );
}
