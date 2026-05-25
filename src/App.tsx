import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Mic, MicOff } from 'lucide-react';
import { useGameState } from './logic/useGameState';
import { Screen } from './types/screens';
import { getCurrentGameDate, getCurrentGameTime } from './constants/gameHelpers';
import { useSpeech } from './hooks/useSpeech';
import Header from './components/Header';
import Footer from './components/Footer';
import BootScreen from './components/BootScreen';
import IntroScreen from './components/IntroScreen';
import MainMenu from './components/MainMenu';
import GameOverScreen from './components/GameOverScreen';
import CaseTreeScreen from './components/CaseTreeScreen';
import InvestigationMap from './components/InvestigationMap';
import TacticalBoard from './components/TacticalBoard';
import DayTransitionModal from './components/DayTransitionModal';

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
    holdBribe,
    rejectBribe,
    acceptHeldBribe,
    rejectHeldBribe,
    jailCulprit,
    dismissCulprit,
    addSuspect,
    penalizeEvidence,
    submitFinalVerdict,
    saveGame,
    loadGame,
    resetGame,
    pauseGame,
    resumeGame,
  } = useGameState();

  const [screen, setScreen]               = useState<Screen>('boot');
  const [showHelp, setShowHelp]           = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showPauseRules, setShowPauseRules] = useState(false);
  const [isMuted, setIsMuted]             = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const isMutedRef        = React.useRef(false);
  const isVoiceEnabledRef = React.useRef(true);
  const audioRef          = React.useRef<HTMLAudioElement | null>(null);
  const buttonAudioRef    = React.useRef<HTMLAudioElement | null>(null);

  const { speakSystem, speakAlex } = useSpeech(isMutedRef, isVoiceEnabledRef);

  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keep refs in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isMuted, isVoiceEnabled]);

  // Stop speech when muted/voice disabled
  useEffect(() => {
    if ((isMuted || !isVoiceEnabled) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted, isVoiceEnabled]);

  // Background music
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/sounds/Musica de Fondo.mp3');
      audio.loop = true;
      audio.volume = 0.22;
      audioRef.current = audio;
    }
    const currentMusic = audioRef.current;
    if (!isMuted) currentMusic.play().catch(() => {});
    else currentMusic.pause();

    const unblockPlay = () => {
      if (!isMuted) currentMusic.play().catch(() => {});
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
    buttonAudioRef.current = new Audio('/sounds/Botones.mp3');
    buttonAudioRef.current.volume = 0.45;
  }, []);

  // Global button click sound
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isMutedRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        const audio = buttonAudioRef.current;
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Navigate to game-over when state triggers it
  useEffect(() => {
    if (state.isGameOver) setScreen('game-over');
  }, [state.isGameOver]);

  const currentDate = getCurrentGameDate(state.day);
  const currentTime = getCurrentGameTime(state.timeRemaining);

  const getScreenTitle = () => {
    switch (screen) {
      case 'boot':             return 'SISTEMA INICIANDO...';
      case 'intro':            return 'AUTENTICACIÓN DE USUARIO';
      case 'main-menu':        return `CyberDetective: Terminal de ${state.playerName || 'Alex'}`;
      case 'case-tree':        return 'CyberDetective: El Árbol de la Verdad';
      case 'investigation-map': return 'CyberDetective: Mapa de Investigación';
      case 'tactical-board':   return 'CyberDetective: Pizarra Táctica';
      case 'game-over':        return 'SISTEMA BLOQUEADO';
      default:                 return 'CyberDetective';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-cyber-orange font-vt323">
      {screen !== 'boot' && screen !== 'intro' && screen !== 'main-menu' && (
        <Header
          title={getScreenTitle()}
          screen={screen}
          day={state.day}
          level={state.level}
          onPause={() => { setShowPauseMenu(true); pauseGame(); }}
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
            {screen === 'boot' && (
              <BootScreen onComplete={() => setScreen('intro')} speakSystem={speakSystem} />
            )}
            {screen === 'intro' && (
              <IntroScreen
                onComplete={(name) => { setPlayerName(name); setScreen('main-menu'); }}
                speakSystem={speakSystem}
                speakAlex={speakAlex}
              />
            )}
            {screen === 'main-menu' && (
              <MainMenu
                onNavigate={(s) => { if (s === 'case-tree') resumeGame(); setScreen(s); }}
                setShowHelp={setShowHelp}
                setShowSettings={setShowSettings}
                loadGame={loadGame}
                playerName={state.playerName}
              />
            )}
            {screen === 'case-tree' && (
              <CaseTreeScreen
                state={state}
                avlRotationFlag={avlRotationFlag}
                selectEvidence={selectEvidence}
                classifyCrime={classifyCrime}
                saveGame={saveGame}
                startDayTransition={startDayTransition}
                submitFinalVerdict={submitFinalVerdict}
                acceptBribe={acceptBribe}
                holdBribe={holdBribe}
                rejectBribe={rejectBribe}
              />
            )}
            {screen === 'investigation-map' && (
              <InvestigationMap
                cataloguedLog={state.cataloguedLog}
                currentLevel={state.level}
                levelCulprits={state.levelCulprits}
                addSuspect={addSuspect}
                penalizedEvidenceIds={state.penalizedEvidenceIds}
                onPenalize={penalizeEvidence}
              />
            )}
            {screen === 'tactical-board' && (
              <TacticalBoard
                state={state}
                acceptBribe={acceptBribe}
                holdBribe={holdBribe}
                rejectBribe={rejectBribe}
                acceptHeldBribe={acceptHeldBribe}
                rejectHeldBribe={rejectHeldBribe}
                jailCulprit={jailCulprit}
                dismissCulprit={dismissCulprit}
              />
            )}
            {screen === 'game-over' && (
              <GameOverScreen
                reason={state.gameOverReason}
                onRestart={() => { resetGame(); setScreen('boot'); }}
              />
            )}
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
          day={state.day}
        />
      )}

      {/* Pause menu */}
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
                <button
                  onClick={() => { setShowPauseMenu(false); setShowPauseRules(false); resumeGame(); }}
                  className="text-cyber-orange hover:text-white"
                >
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
                      <svg className="absolute left-0 right-0 top-1/2 w-full h-6 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
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
                    {isVoiceEnabled ? <Mic size={28} /> : (
                      <>
                        <MicOff size={28} />
                        <svg className="absolute left-0 right-0 top-1/2 w-full h-6 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
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

      {/* Help modal */}
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

        {/* Settings modal */}
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
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsVoiceEnabled(v => !v)}>
                  <span className="text-sm uppercase">Narración de Texto</span>
                  <div className="w-10 h-5 bg-gray-800 border border-cyber-orange relative cursor-pointer">
                <div className={`absolute top-0 w-5 h-full transition-all ${isVoiceEnabled ? 'right-0 bg-cyber-orange' : 'left-0 bg-gray-600'}`}></div>
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