import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useGameState } from './logic/useGameState';
import { CRIME_INFO, CrimeType } from './types/game';
import { AVLTree } from './logic/avlTree';
import { 
  Terminal, 
  Search, 
  FileText, 
  Map as MapIcon, 
  Layout, 
  HelpCircle, 
  Settings, 
  LogOut,
  Printer,
  Coffee,
  X,
  Maximize2,
  Minus,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  User
} from 'lucide-react';

// --- Types ---
type Screen = 'boot' | 'intro' | 'main-menu' | 'case-tree' | 'investigation-map' | 'tactical-board' | 'game-over';

// --- Components ---

const Header = ({ title, subtitle, screen, day, level }: { title: string; subtitle?: string; screen: Screen; day: number; level: number }) => (
  <header className="retro-border bg-black flex items-center justify-between px-3 py-1 text-sm z-50">
    <div className="flex items-center space-x-4">
      <span className="font-bold uppercase tracking-wider">{title}</span>
      <span className="text-xs font-vt323">🕒 DÍA {day} - 10:14 📁</span>
    </div>
    <div className="flex-1 text-center truncate px-4 text-xs opacity-80">
      {subtitle || "NETCITY - UNIDAD DE CRÍMENES DIGITALES - ESTADO: CASO ACTIVO - VALERIA #801"}
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-xs bg-cyber-orange text-black px-2 font-bold">
        {screen === 'main-menu' ? 'TERMINAL PRINCIPAL' : `NIVEL ${level} - ${getLevelName(level)}`}
      </span>
      <div className="flex space-x-1">
        <div className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"><Minus size={8} /></div>
        <div className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"><Maximize2 size={8} /></div>
        <div className="w-3 h-3 border border-cyber-orange flex items-center justify-center text-[8px]"><X size={8} /></div>
      </div>
    </div>
  </header>
);

const getLevelName = (level: number) => {
  switch(level) {
    case 1: return 'LAS PRIMERAS SEÑALES';
    case 2: return 'EL RUMOR VIRAL';
    case 3: return 'LA CUENTA FANTASMA';
    case 4: return 'ATAQUE COORDINADO';
    case 5: return 'EL NÚCLEO DE LA VERDAD';
    default: return 'INVESTIGACIÓN';
  }
};

const Footer = ({ message, amonestations, money }: { message?: string; amonestations: number; money: number }) => (
  <footer className="h-20 flex space-x-2 mt-2">
    <div className="retro-border flex-1 bg-black p-2 overflow-hidden">
      <div className="text-[10px] mb-1 opacity-70 uppercase">Mensaje del Detective</div>
      <p className="text-sm">
        Alex: <span className="text-orange-200 italic">"{message || "Analiza la evidencia central. Si cumple los requisitos de Injuria (Art. 220), selecciónalo y clasifícalo para insertarlo en el Árbol de la Verdad."}"</span>
      </p>
    </div>
    <div className="retro-border w-1/4 bg-black p-2 flex flex-col justify-between">
      <div className="text-[10px] opacity-70 uppercase">Estado de la Investigación:</div>
      <div className="flex items-center space-x-2 text-xl font-vt323">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={cn(i < amonestations ? "text-red-500" : "text-cyber-orange")}>
            {i < amonestations ? "[🗙]" : "[ ]"}
          </span>
        ))}
      </div>
    </div>
    <div className="retro-border w-1/4 bg-black p-2 flex flex-col justify-between">
      <div className="text-[10px] opacity-70 uppercase">Fondos Familiares:</div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-vt323 text-green-500">${money}</span>
        <div className="text-[8px] text-right opacity-60">
          COSTO DIARIO: $150<br/>(RENTA + COMIDA)
        </div>
      </div>
    </div>
  </footer>
);

// --- New Screens ---

const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootSequence = [
    "INICIANDO TERMINAL SECURE-OS...",
    "CARGANDO MÓDULO DE ACCESIBILIDAD...",
    "CONEXIÓN ESTABLECIDA CON: NETCITY CENTRAL.",
    "SISTEMA: Bienvenido a NetCity. En nuestra ciudad digital, la conexión lo es todo. Foros, redes sociales, mensajería instantánea... los estudiantes viven en línea. Pero en los últimos meses, la red se ha oscurecido. Las alertas por casos de ciberacoso y bullying han saturado nuestros servidores. Lo que pasa en la pantalla, está destruyendo vidas en el mundo real.",
    "PRESIONE [ENTER] PARA CONTINUAR"
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        setLines(prev => [...prev, bootSequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && lines.length >= bootSequence.length) onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lines]);

  return (
    <div className="h-full flex flex-col items-start justify-center p-12 font-mono text-amber-500 bg-black">
      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.p 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("text-lg", i === lines.length - 1 && "animate-pulse")}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  );
};

const IntroScreen = ({ onComplete }: { onComplete: (name: string) => void }) => {
  const [name, setName] = useState('');
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
      <div className="retro-border p-8 max-w-2xl bg-black text-center space-y-6">
        <h2 className="text-2xl font-bold uppercase text-cyber-orange underline">Expediente #001: VALERIA</h2>
        <div className="flex gap-6 items-start text-left">
          <div className="w-32 h-40 border-2 border-cyber-orange bg-gray-900 flex items-center justify-center overflow-hidden grayscale opacity-50">
             <img src="https://picsum.photos/seed/valeria/200/300" alt="Valeria" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 space-y-4 text-sm">
            <p>SISTEMA: "Este es nuestro caso de prioridad máxima. Ella es Valeria, una estudiante de secundaria."</p>
            <p>SISTEMA: "Hace unas semanas, comenzó a recibir mensajes en sus redes. Parecía una simple broma pesada... pero escaló. Rápido."</p>
            <p className="text-red-500 font-bold animate-pulse">"Burlas públicas. Mensajes ofensivos. Ataques coordinados."</p>
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-cyber-orange/30">
          <p className="text-sm">AUTENTICANDO USUARIO: DETECTIVE ESPECIALISTA EN CRÍMENES DIGITALES.</p>
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
            onClick={() => onComplete(name)}
            className="btn-primary w-full disabled:opacity-50"
          >
            ACCEDER AL SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
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

const MainMenu = ({ onNavigate, setShowHelp, setShowSettings, loadGame }: { onNavigate: (s: Screen) => void; setShowHelp: (v: boolean) => void; setShowSettings: (v: boolean) => void; loadGame: () => Promise<boolean> }) => {
  const handleLoad = async () => {
    const success = await loadGame();
    if (success) onNavigate('case-tree');
  };

  return (
  <div className="flex-1 grid grid-cols-12 gap-2 h-full overflow-hidden py-2">
    <section className="col-span-3 flex flex-col gap-2">
      <div className="retro-border flex-grow p-4 flex flex-col items-center justify-center bg-black">
        <div className="paper-texture p-2 text-black w-full max-w-[200px]">
          <div className="border-2 border-black p-1 mb-2">
            <div className="w-full aspect-square bg-gray-400 flex items-center justify-center border-2 border-black overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEomVrD_0j_-0xgadr_XbiWMMc9xyqhUQ02m7LDaS28nY85Rahm0xShuzFbQ2Mzz_BXwZl75IBuYxzYMto9Jey1EhMC-adaubNCDbT7BAyPGWeVsfF-pBmtN5jsPs114poypSQwFd-qeFFAVar-aa_YeZWAOlL8CE65FgYaolizFxSYvl9UVR6VspfIotjuejMSx6kDnBHkvC95w94VUXupgMFvgdisMz7c8Y8OhLqaS12HZn-mCftWwvRuPhEwEjwrZwRyMzu3x4" 
                alt="Detective Alex"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="text-center text-xs font-bold leading-tight uppercase">
            Perfil de Alex<br/>(Detective)
          </div>
        </div>
      </div>
      <div className="retro-border p-2 bg-black">
        <h2 className="text-xs font-bold uppercase">Perfil de Alex (Detective)</h2>
      </div>
    </section>

    <section className="col-span-6 flex flex-col gap-2">
      <div className="retro-border p-6 text-center flex flex-col items-center justify-center bg-black relative">
        <div className="absolute top-1 right-1 flex gap-1">
          <span className="text-[10px] border border-cyber-orange px-1">_</span>
          <span className="text-[10px] border border-cyber-orange px-1">□</span>
          <span className="text-[10px] border border-cyber-orange px-1">×</span>
        </div>
        <div className="border-4 border-cyber-orange p-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase">CyberDetective</h1>
        </div>
        <h2 className="text-2xl font-bold mb-1 uppercase">El Árbol de la Verdad</h2>
        <p className="text-sm mb-1">(V. 1.0)</p>
        <p className="text-xs uppercase tracking-widest opacity-70">Sistema de investigación de ciberacoso</p>
      </div>

      <div className="retro-border flex-grow p-4 flex flex-col gap-3 items-center justify-center bg-black">
        <button 
          onClick={() => onNavigate('case-tree')}
          className="w-full max-w-md py-2 border-2 border-cyber-orange bg-cyber-orange text-black font-bold hover:brightness-110 transition-all uppercase"
        >
          <span className="block text-sm">Nueva Investigación</span>
          <span className="block text-[10px]">(Nivel 1: The First Signs)</span>
        </button>
        <button 
          onClick={handleLoad}
          className="w-full max-w-md py-2 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
        >
          Cargar Expediente Guardado
        </button>
        <button 
          onClick={() => setShowHelp(true)}
          className="w-full max-w-md py-2 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
        >
          <span className="block text-sm">Sistema de Ayuda</span>
          <span className="block text-[10px]">(las reglas, árboles, etc.)</span>
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-full max-w-md py-2 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase"
        >
          <span className="block text-sm">Inclusión y Ajustes</span>
          <span className="block text-[10px]">(Accesibilidad, selección apariencia)</span>
        </button>
        <button className="w-full max-w-md py-2 border-2 border-cyber-orange text-cyber-orange font-bold hover:bg-cyber-orange hover:text-black transition-all uppercase">
          Salir de la Terminal
        </button>
      </div>
    </section>

    <section className="col-span-3 flex flex-col gap-2">
      <div className="retro-border flex-grow flex flex-col bg-black">
        <div className="panel-header">Manual de Referencia Táctica</div>
        <div className="flex-grow p-4 flex items-center justify-center">
          <div className="paper-texture p-2 text-black w-full h-full max-h-[160px] flex gap-1">
            <div className="flex-1 border-r border-black p-1 text-[8px] font-bold uppercase">Manual de Referencia Táctica</div>
            <div className="flex-1 p-1 text-[8px] font-bold uppercase">Manual de Referencia Táctica</div>
          </div>
        </div>
      </div>
      <div className="retro-border flex-grow flex flex-col bg-black">
        <div className="panel-header">Manual de Referencia Táctica</div>
        <div className="flex-grow p-4 flex items-center justify-center">
          <div className="paper-texture p-2 text-black w-full h-full max-h-[160px] flex flex-col justify-between relative">
            <div className="flex gap-1 h-3/4">
              <div className="flex-1 border-r border-black p-1 text-[8px] font-bold leading-tight uppercase">Manual de Referencia Táctica</div>
              <div className="flex-1 p-1 text-[8px] font-bold leading-tight uppercase">Manual de Referencia Táctica (Vencedor)</div>
            </div>
            <div className="absolute bottom-2 right-2 stamp text-[8px] bg-paper-bg">
              Manual de<br/>Referencia<br/>Táctica
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

const CaseTree = () => (
  <div className="flex-1 flex space-x-2 overflow-hidden py-2">
    <section className="w-1/4 flex flex-col space-y-2">
      <div className="retro-border flex-1 flex flex-col bg-black">
        <div className="panel-header">Dossier</div>
        <div className="p-4 flex-1 flex items-center justify-center">
          <div className="paper-texture w-full h-full p-4 relative text-sm overflow-hidden">
            <div className="flex space-x-4 mb-4">
              <div className="w-24 h-24 border-2 border-black/20 flex items-center justify-center bg-gray-400/20">
                <img 
                  src="https://lh3.googleusercontent.com/aida/ADBb0ugIvWmTfG5FZ1kvUwNrpp5RF81jBVLshCZnqE6yoWAz-dx1Z5io10VcajDVL2nHXaJIYl_OAAaVzUwOvgOVWTcLZO5LwHRnf2zcZMrFpgL8QEUGunEDfWyWXEg2LdPjFUaiKfwAglGcxa_0pc5cMDgmkA5j8sgWohbT0qk941OjIJrXWiRqsSCtS-rn8y3hGXjU0wf1b8HQpa_Rn-FkyqxmQ5j4hOL1DGcutQoVG7yF5BSsiQnvEhCKFqUZXc53YIuqdpl6zNrH" 
                  alt="Valeria"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-black">
                <p className="font-bold border-b border-black/40 mb-1 uppercase">Expediente: Valeria</p>
                <p className="text-[10px] font-bold uppercase">Reportes:</p>
                <p className="text-[10px]">Mensajes ofensivos detectados (reincidentes)</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <div className="stamp text-xl">Nivel 1</div>
            </div>
          </div>
        </div>
      </div>
      <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
        <div className="panel-header">
          <span>Evidencias Recolectadas</span>
          <div className="flex space-x-1">
            <span className="w-2 h-2 bg-cyber-orange"></span>
            <span className="w-2 h-2 bg-cyber-orange"></span>
          </div>
        </div>
        <div className="p-2 overflow-y-auto space-y-2">
          <div className="bg-paper-bg p-2 text-gray-900 border border-black text-xs">
            <div className="flex justify-between border-b border-black/20 mb-1 pb-1">
              <span className="font-bold">Tweet - @ANON7834</span>
              <span>✖</span>
            </div>
            <p>"¡Nadie te soporta, Valeria! 😠😠😠"</p>
            <p className="mt-2 text-[10px] opacity-70 uppercase">Usuario: ANON 7834 (Cuenta Fantasma)</p>
          </div>
          <div className="bg-gray-800/50 p-2 text-orange-200 border border-cyber-orange/30 text-xs">
            <div className="flex justify-between border-b border-cyber-orange/20 mb-1 pb-1 text-[10px]">
              <span>Email - Dexio:</span>
              <span>➖ 🔳 ✖</span>
            </div>
            <p>De: Dexio</p>
            <p>Asunto: ...</p>
          </div>
        </div>
      </div>
    </section>

    <section className="flex-1 flex flex-col space-y-2">
      <div className="retro-border flex-1 flex flex-col bg-black grid-bg relative overflow-hidden">
        <div className="panel-header">
          <span>▼ Árbol Visual de los Casos (AVL - Balanceado)</span>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-start space-y-12 relative">
          <div className="w-16 h-16 border-2 border-dashed border-cyber-orange/50 flex items-center justify-center">
            <div className="w-4/5 h-4/5 bg-gray-800/40"></div>
          </div>
          <div className="flex space-x-24 relative">
             {/* Lines would be here in a real SVG/Canvas implementation */}
            <div className="w-16 h-16 border-2 border-dashed border-cyber-orange/50 flex items-center justify-center">
              <div className="w-4/5 h-4/5 bg-gray-800/40"></div>
            </div>
            <div className="w-16 h-16 border-2 border-cyber-orange flex items-center justify-center relative shadow-[0_0_15px_rgba(246,147,34,0.5)]">
              <div className="w-full h-full bg-cyber-orange/20"></div>
              <span className="absolute -top-6 left-0 text-[8px] w-32 uppercase font-bold">Nuevo Incidente</span>
            </div>
          </div>
          <div className="flex space-x-8">
            <div className="w-16 h-16 border-2 border-dashed border-cyber-orange/30"></div>
            <div className="w-16 h-16 border-2 border-dashed border-cyber-orange/30"></div>
            <div className="w-16 h-16 border-2 border-dashed border-cyber-orange/10"></div>
          </div>
          
          <div className="absolute right-4 top-10 flex flex-col items-center">
            <span className="text-[8px] mb-2 uppercase font-bold">Lista de Inserción</span>
            <div className="space-y-2">
              <div className="w-8 h-8 border border-cyber-orange/50"></div>
              <div className="w-8 h-8 border border-cyber-orange/50"></div>
              <div className="w-8 h-8 border border-cyber-orange/50"></div>
            </div>
            <div className="mt-2 text-xs">▼</div>
          </div>
        </div>
      </div>
      <div className="retro-border h-24 flex items-center p-4 bg-black space-x-4">
        <div className="text-sm font-bold w-32 leading-tight uppercase">Acciones del Detective</div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          <button className="btn-primary h-full row-span-2 text-lg">Clasificar Delito</button>
          <button className="btn-action">Insertar Nodo</button>
          <button className="btn-action">Aprobar</button>
          <button className="btn-action">Desestimar</button>
          <button className="btn-action">Denegar</button>
        </div>
      </div>
    </section>

    <section className="w-1/3 flex flex-col space-y-2">
      <div className="retro-border flex-1 flex flex-col bg-black">
        <div className="panel-header">Código Penal Colombiano</div>
        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#111]">
          <div className="paper-texture flex p-3 text-gray-900 min-h-[220px]">
            <div className="w-1/2 border-r border-black/20 pr-2">
              <h3 className="font-bold text-sm mb-2 uppercase">Injuria (Art. 220):</h3>
              <p className="text-[10px] leading-tight">Afectación del buen nombre mediante ofensas directas.</p>
              <div className="mt-8 text-center text-xs opacity-50">1</div>
            </div>
            <div className="w-1/2 pl-2 relative">
              <div className="space-y-2 text-[9px] font-bold uppercase">
                <div className="flex items-center"><span className="w-3 h-3 border border-black mr-2"></span> Intención Ofensiva?</div>
                <div className="flex items-center"><span className="w-3 h-3 border border-black mr-2"></span> Repetición?</div>
                <div className="flex items-center"><span className="w-3 h-3 border border-black mr-2"></span> Afecta Reputación?</div>
              </div>
              <div className="absolute bottom-2 right-2 stamp text-[10px]">Injuria</div>
              <div className="mt-4 text-center text-xs opacity-50">2</div>
            </div>
          </div>
          <div className="paper-texture flex p-3 text-gray-900 min-h-[220px]">
            <div className="w-1/2 border-r border-black/20 pr-2">
              <h3 className="font-bold text-sm mb-2 uppercase">Calumnia (Art. 221)</h3>
              <p className="text-[10px] leading-tight">Afectación del buen nombre mediante ofensas directas.</p>
              <p className="font-bold mt-2 text-[10px] uppercase">Denuncia</p>
              <div className="mt-4 space-y-1">
                <div className="h-[1px] bg-black/40 w-full"></div>
                <div className="h-[1px] bg-black/40 w-full"></div>
                <div className="h-[1px] bg-black/40 w-full"></div>
              </div>
              <div className="mt-8 text-center text-xs opacity-50">4</div>
            </div>
            <div className="w-1/2 pl-2">
              <h3 className="font-bold text-sm mb-2 uppercase">Calumnia (Art. 221)</h3>
              <p className="text-[10px] leading-tight">Difusión de acusaciones falsas</p>
              <p className="font-bold mt-2 text-[10px] uppercase">Denuncia</p>
              <div className="mt-4 space-y-1">
                <div className="h-[1px] bg-black/40 w-full"></div>
                <div className="h-[1px] bg-black/40 w-full"></div>
                <div className="h-[1px] bg-black/40 w-full"></div>
              </div>
              <div className="mt-8 text-center text-xs opacity-50">5</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const InvestigationMap = () => (
  <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2">
    <section className="col-span-3 flex flex-col gap-2">
      <div className="bg-paper-bg text-black p-4 h-1/2 relative overflow-hidden retro-border">
        <div className="bg-cyber-orange text-black absolute top-0 left-0 px-4 py-1 text-[10px] font-bold uppercase">Dossier</div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="w-24 h-32 border-2 border-black flex items-center justify-center bg-gray-300">
              <img 
                src="https://lh3.googleusercontent.com/aida/ADBb0ugrgReyL6jBC70aQ45n32o_AMNgiRsi-PXuyQF-CxPmbMmPmYqVXaIn_qB0DF3byAs6CgZyxH9Fpv9aGa1gEZZlPsvDcAoBKtfSyAvR-8mL2XfCVXen3Xk-3aGp9a5kaHngklo86-MniY1YZj9tmFTnulxcvYw23nClMiBK-0A_1M3JUPgZ2iuk0LLYtjA7xvqQ4bxx0jj4aVzS_NY2N8hSforhFr28luIL6tMBGhJ9qxAitZqxhUN8yNPXZC1VHaX_rG5uK7Pm2Q" 
                alt="Valeria"
                className="w-full h-full object-cover grayscale opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow text-[10px] space-y-2">
              <p className="font-bold border-b border-black pb-1 uppercase">Expediente: Valeria</p>
              <p className="font-bold uppercase">Reportes:</p>
              <p>Mensajes ofensivos detectados (reincidentes)</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 stamp text-2xl border-black text-black opacity-80">
            Nivel 1
          </div>
        </div>
      </div>
      <div className="flex-grow retro-border flex flex-col bg-black">
        <div className="panel-header">
          <span>Evidencias Nivel 1</span>
          <div className="flex gap-1">
            <span>_</span>
            <span>×</span>
          </div>
        </div>
        <div className="p-2 flex flex-col gap-2 items-center justify-center h-full">
          <div className="bg-white text-black w-full text-[10px] rounded shadow-lg overflow-hidden">
            <div className="bg-gray-200 p-1 flex justify-between border-b border-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
              </div>
              <span className="text-[8px]">Tweet: @valeria_801</span>
            </div>
            <div className="p-2 border-b border-gray-100">
              <p className="font-bold">¡Nadie te quiere!</p>
              <p className="text-gray-500">#Valeria #NetCity</p>
            </div>
            <div className="p-2 bg-gray-50 italic">
               USUARIO: ANON_78S4 (CUENTA FANTASMA)
             </div>
          </div>
          <div className="bg-gray-100 text-black w-4/5 text-[8px] -mt-2 border border-gray-400 shadow-xl">
            <div className="bg-gray-400 p-1">Email: Desconocido</div>
            <div className="p-2">Asunto: Deja la ciudad...</div>
          </div>
        </div>
      </div>
    </section>

    <section className="col-span-6 retro-border bg-black grid-bg relative overflow-hidden">
      <div className="panel-header">
        <span>▼ Mapa de Investigación - Capas del Acoso</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Radial Orbits */}
        <div className="border border-cyber-orange/20 rounded-full w-[450px] h-[450px] absolute"></div>
        <div className="border border-cyber-orange/20 rounded-full w-[350px] h-[350px] absolute"></div>
        <div className="border border-cyber-orange/20 rounded-full w-[250px] h-[250px] absolute"></div>
        <div className="border border-cyber-orange/20 rounded-full w-[150px] h-[150px] absolute"></div>
        
        {/* Nodes */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-cyber-orange bg-black flex items-center justify-center text-xl">💬</div>
          <div className="text-[8px] text-center mt-1 uppercase font-bold">Capa 1:<br/>Injuria (Art. 220)</div>
        </div>
        
        <div className="absolute top-[30%] right-[20%] flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-white bg-black flex items-center justify-center text-xl relative">
            <span>📢</span>
            <div className="absolute -top-6 text-[8px] bg-cyber-orange text-black px-1 font-bold">HERE</div>
          </div>
          <div className="text-[8px] text-center mt-1 uppercase font-bold">Capa 2:<br/>Calumnia (Art. 221)</div>
        </div>

        <div className="absolute top-[40%] left-[20%] flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-cyber-orange bg-black flex items-center justify-center text-xl">👤</div>
          <div className="text-[8px] text-center mt-1 uppercase font-bold">Capa 3:<br/>Suplantación</div>
        </div>

        <div className="w-16 h-16 border-2 border-cyber-orange bg-black flex items-center justify-center text-2xl relative z-10">
          <span>🤝</span>
          <div className="absolute -bottom-10 text-[8px] text-center w-32 font-bold uppercase">Núcleo de<br/>la Verdad</div>
        </div>
      </div>
      
      <div className="absolute left-10 top-1/2 -translate-y-1/2 text-[8px] opacity-60 text-center w-20 uppercase font-bold">
        Zona de<br/>Chat Pública
      </div>
      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[8px] opacity-60 text-center w-20 uppercase font-bold">
        Foros<br/>Centrales
      </div>
    </section>

    <section className="col-span-3 flex flex-col">
      <div className="retro-border bg-black flex-grow flex flex-col">
        <div className="panel-header">Capa Actual de la Ciudad - Las Primeras</div>
        <div className="flex-grow p-4 bg-paper-bg text-black mx-2 my-2 border border-black shadow-inner">
          <h2 className="text-lg font-bold border-b border-black mb-4 uppercase">Las Primeras Señales</h2>
          <div className="text-[10px] space-y-4">
            <p>
              <strong>SITUACIÓN:</strong> Valeria comienza a recibir mensajes ofensivos en redes sociales. Parecen bromas aisladas pero se repiten.
            </p>
            <div className="space-y-1">
              <strong>OBJETIVOS:</strong>
              <ul className="list-disc list-inside pl-2">
                <li>Recolectar capturas</li>
                <li>Identificar usuario</li>
                <li>Clasificar agresión.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const TacticalBoard = () => (
  <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2">
    <aside className="col-span-3 flex flex-col gap-2">
      <section className="bg-paper-bg text-black p-4 retro-border relative h-1/2 overflow-hidden">
        <div className="absolute top-0 right-0 bg-black text-cyber-orange px-2 py-1 text-[8px] font-bold transform rotate-90 translate-x-4 translate-y-8">DOSSIER</div>
        <h2 className="text-xl font-bold border-b-2 border-black mb-4 uppercase">Expediente: Valeria</h2>
        <div className="flex gap-3 mb-4">
          <div className="w-24 h-24 bg-gray-400 border-2 border-black overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvNr1VaAsLJLJg48Umt6hBYHfOghheGml4eLmXTOCrfMv_JLjp0_0tXBbiO-LEHK8Yunj8uDk4FpA2AUCRQSsOd-QsF8Qmby-Re5ojrFZVeIvemlYXKGYo_hBwmgv4ew99JXa-zok1NYCep8bcQgwowmYJdiUvU156mWamBgD0qQcjqEWywpmqadKA2Avwcvkdr6vfoVrATG8wUN5-Lxxs1ySmZ188BqBH33EaTtno26YV3cncL3_YYGnt1DVJFn6CknCJygyNc2Q" 
              alt="Valeria"
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-xs font-bold uppercase">
            <p>Reportes:</p>
            <p className="font-normal mt-1">Mensajes ofensivos detectados (reincidentes)</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 border-4 border-black p-1 transform -rotate-12">
          <span className="text-2xl font-black">NIVEL 1</span>
        </div>
      </section>
      <section className="flex-1 bg-black border-2 border-cyber-orange/30 p-2 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-2 bg-cyber-orange/10 px-2">
          <span className="text-[10px] font-bold uppercase">Evidencias Nivel 1</span>
          <span className="text-[10px]">[_][×]</span>
        </div>
        <div className="flex-1 bg-gray-900 border border-cyber-orange/50 p-2 overflow-y-auto">
          <div className="bg-white text-black p-2 mb-2 text-[8px] rounded">
            <div className="flex items-center gap-1 border-b pb-1 mb-1">
              <div className="w-3 h-3 bg-blue-400"></div>
              <strong>Tweet:</strong>
            </div>
            <p>"Nadie te quiere. #Valeria #NetCity"</p>
          </div>
          <div className="bg-gray-200 text-black p-2 text-[8px] rounded">
            <div className="flex items-center gap-1 border-b pb-1 mb-1">
              <div className="w-3 h-3 bg-red-400"></div>
              <strong>Email:</strong>
            </div>
            <p>De: Dexio - "¡Kadie te soporta, Valeria! 🙄🙄🙄"</p>
          </div>
        </div>
      </section>
    </aside>

    <main className="col-span-6 bg-[#5d3a1a] border-[12px] border-[#3d2a1a] shadow-inner relative overflow-hidden flex flex-col">
      <div className="bg-[#3d2a1a] text-white px-4 py-1 text-[10px] font-bold flex items-center justify-between uppercase">
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
          <p className="text-[7px] text-gray-800 leading-tight uppercase">Calumnia (Art. 222)<br/>Libertad del buen nombre mediante ofensas directas Denuncia</p>
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
          <div className="text-[8px] text-center font-bold uppercase">ID: 001<br/>Injuria (Art. 220)</div>
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

// --- Main App ---

export default function App() {
  const { 
    state, 
    message, 
    setPlayerName, 
    selectEvidence, 
    classifyCrime, 
    endDay, 
    acceptBribe, 
    submitFinalVerdict, 
    saveGame, 
    loadGame,
    resetGame 
  } = useGameState();
  
  const [screen, setScreen] = useState<Screen>('boot');
  const [selectedCrime, setSelectedCrime] = useState<CrimeType>('None');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const renderTreeNode = (node: any, x: number, y: number, level: number) => {
    if (!node) return null;
    const offset = 120 / (level + 1);
    return (
      <React.Fragment key={node.id}>
        {/* Lines to children */}
        {node.left && (
          <line 
            x1={x} y1={y} x2={x - offset} y2={y + 60} 
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"
          />
        )}
        {node.right && (
          <line 
            x1={x} y1={y} x2={x + offset} y2={y + 60} 
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"
          />
        )}
        
        {/* Node */}
        <g transform={`translate(${x - 20}, ${y - 20})`}>
          <rect 
            width="40" height="40" 
            className="fill-black stroke-cyber-orange stroke-2"
            filter="drop-shadow(0 0 5px rgba(246,147,34,0.5))"
          />
          <text 
            x="20" y="25" 
            textAnchor="middle" 
            className="fill-cyber-orange text-[10px] font-bold font-vt323"
          >
            {node.gravity}
          </text>
          <text 
            x="20" y="50" 
            textAnchor="middle" 
            className="fill-cyber-orange text-[6px] uppercase"
          >
            {node.crimeType.substring(0, 8)}
          </text>
        </g>

        {renderTreeNode(node.left, x - offset, y + 60, level + 1)}
        {renderTreeNode(node.right, x + offset, y + 60, level + 1)}
      </React.Fragment>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 crt-effect relative">
      <div className="scanline" />
      
      {screen !== 'boot' && screen !== 'intro' && (
        <Header 
          title={getScreenTitle()} 
          screen={screen}
          day={state.day}
          level={state.level}
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
            {screen === 'boot' && <BootScreen onComplete={() => setScreen('intro')} />}
            {screen === 'intro' && <IntroScreen onComplete={(name) => { setPlayerName(name); setScreen('main-menu'); }} />}
            {screen === 'main-menu' && <MainMenu onNavigate={setScreen} setShowHelp={setShowHelp} setShowSettings={setShowSettings} loadGame={loadGame} />}
            
            {screen === 'case-tree' && (
              <div className="flex-1 flex space-x-2 overflow-hidden py-2 h-full">
                {/* Panel Izquierdo: Dossier & Evidencias */}
                <section className="w-1/4 flex flex-col space-y-2">
                  <div className="retro-border flex-1 flex flex-col bg-black">
                    <div className="panel-header">Dossier: Valeria</div>
                    <div className="p-4 flex-1 flex items-center justify-center">
                      <div className="paper-texture w-full h-full p-4 relative text-sm overflow-hidden text-black">
                        <div className="flex space-x-4 mb-4">
                          <div className="w-20 h-20 border-2 border-black/20 flex items-center justify-center bg-gray-400/20">
                            <img src="https://picsum.photos/seed/valeria/100/100" alt="Valeria" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold uppercase">Nivel {state.level}</p>
                            <p className="text-[10px]">{getLevelName(state.level)}</p>
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
                    <div className="p-2 overflow-y-auto space-y-2">
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
                            <span>{ev.type} - @{ev.author}</span>
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
                    <div className="panel-header">Árbol de la Verdad (AVL)</div>
                    <div className="flex-1 p-4 relative overflow-auto">
                       <svg className="w-full h-full min-h-[400px]">
                        <g transform="translate(0, 40)">
                          {state.tree ? renderTreeNode(state.tree, 300, 40, 0) : (
                            <text x="50%" y="50%" textAnchor="middle" className="fill-cyber-orange/30 text-xs uppercase font-vt323">
                              Esperando inserción de nodos...
                            </text>
                          )}
                        </g>
                      </svg>
                    </div>
                    {state.level === 4 && (
                      <div className="absolute top-10 right-4 w-48 bg-red-900/80 border border-red-500 p-2 text-[10px] animate-pulse">
                        <p className="font-bold uppercase mb-1">⚠️ LLAMADA ENTRANTE</p>
                        <p>"Detective, soy el padre de uno de los chicos. Tenemos $500 para usted si olvida esta evidencia..."</p>
                        <button onClick={() => acceptBribe(500)} className="mt-2 w-full bg-red-600 text-white py-1 hover:bg-red-500">ACEPTAR SOBORNO</button>
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
                      <button onClick={endDay} className="btn-action h-full flex flex-col items-center justify-center">
                        <Coffee size={16} />
                        <span>TERMINAR DÍA</span>
                      </button>
                      <button onClick={() => setScreen('main-menu')} className="btn-action h-full flex flex-col items-center justify-center">
                        <LogOut size={16} />
                        <span>SALIR</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Panel Derecho: Info Legal & Clasificación */}
                <section className="w-1/3 flex flex-col space-y-2">
                  <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
                    <div className="panel-header">Clasificación de Delito</div>
                    <div className="p-4 flex-1 flex flex-col gap-4 bg-[#0a0a0a]">
                      {state.currentEvidence ? (
                        <>
                          <div className="bg-cyber-orange/10 border border-cyber-orange p-3">
                            <p className="text-[10px] uppercase opacity-60 mb-1">Evidencia Seleccionada:</p>
                            <p className="text-sm font-bold">"{state.currentEvidence.content}"</p>
                            <p className="text-[10px] mt-2 italic">Detalle: {state.currentEvidence.details}</p>
                          </div>
                          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                            {(Object.keys(CRIME_INFO) as CrimeType[]).map(crime => (
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

            {screen === 'investigation-map' && <InvestigationMap />}
            {screen === 'tactical-board' && <TacticalBoard />}
            {screen === 'game-over' && <GameOverScreen reason={state.gameOverReason} onRestart={() => { resetGame(); setScreen('boot'); }} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {screen !== 'boot' && screen !== 'intro' && screen !== 'game-over' && (
        <Footer 
          message={message} 
          amonestations={state.amonestations}
          money={state.money}
        />
      )}

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
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">1. El Árbol de la Verdad (AVL)</h3>
                  <p>Tu objetivo es construir un árbol de decisiones balanceado. Cada evidencia clasificada correctamente se inserta como un nodo. El sistema AVL asegura que la investigación sea eficiente y estructurada.</p>
                </section>
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">2. Clasificación Legal</h3>
                  <p>Debes analizar cada evidencia y compararla con el Código Penal. Si fallas, recibirás una amonestación. 5 amonestaciones significan el fin de tu carrera.</p>
                </section>
                <section>
                  <h3 className="text-cyber-orange font-bold uppercase mb-1">3. Economía de Supervivencia</h3>
                  <p>Cada día tiene un costo de $150. Si te quedas sin dinero, serás desalojado y el juego terminará. ¡Administra bien tus recompensas!</p>
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

      {/* Navigation Shortcuts (for demo purposes) */}
      <div className="fixed bottom-2 right-2 flex flex-col items-end gap-1 z-[100] group">
        <div className="hidden group-hover:flex flex-col gap-1">
          <button onClick={() => setScreen('main-menu')} className="bg-black/80 border border-cyber-orange p-1 text-[8px] uppercase hover:bg-cyber-orange hover:text-black">Menu</button>
          <button onClick={() => setScreen('case-tree')} className="bg-black/80 border border-cyber-orange p-1 text-[8px] uppercase hover:bg-cyber-orange hover:text-black">Tree</button>
          <button onClick={() => setScreen('investigation-map')} className="bg-black/80 border border-cyber-orange p-1 text-[8px] uppercase hover:bg-cyber-orange hover:text-black">Map</button>
          <button onClick={() => setScreen('tactical-board')} className="bg-black/80 border border-cyber-orange p-1 text-[8px] uppercase hover:bg-cyber-orange hover:text-black">Board</button>
        </div>
        <div className="bg-black/80 border border-cyber-orange p-1 text-[8px] uppercase opacity-50 group-hover:opacity-100">
          <Terminal size={12} />
        </div>
      </div>
    </div>
  );
}
