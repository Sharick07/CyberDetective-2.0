import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { TUTORIAL_CLIPS, AlexClip } from '../hooks/useAlexVoice';

const PADDING = 10;

interface TutorialStep {
  message: (name: string) => string;
  highlightId: string | null;
  label?: string;
}

const STEPS: TutorialStep[] = [
  {
    highlightId: null,
    label: 'Bienvenida',
    message: (name) =>
      `¡Buenos días, Detective ${name}! Es tu primer día en este caso. Déjame guiarte por tu lugar de trabajo antes de que comiences la investigación.`,
  },
  {
    highlightId: 'tutorial-evidence-panel',
    label: 'Evidencias',
    message: () =>
      'EVIDENCIAS PENDIENTES — Aquí aparecen todos los comentarios que Valeria ha recibido. Haz clic en uno para seleccionarlo y prepararlo para clasificar.',
  },
  {
    highlightId: 'tutorial-crime-panel',
    label: 'Clasificación',
    message: () =>
      'CLASIFICACIÓN DE DELITO — Con una evidencia seleccionada, elige aquí el tipo de delito que mejor la describe. Si el comentario es positivo o neutro, selecciona "None".',
  },
  {
    highlightId: 'tutorial-classify-btn',
    label: 'Clasificar',
    message: () =>
      'CLASIFICAR E INSERTAR — Una vez elegido el tipo de delito, presiona este botón para procesar la evidencia. ¡Cada clasificación correcta te da $10 y añade un nodo al árbol!',
  },
  {
    highlightId: 'tutorial-tree-panel',
    label: 'Árbol AVL',
    message: () =>
      'ÁRBOL DE LA VERDAD — Aquí se construye el expediente. Cada evidencia bien clasificada aparece como un nodo. El árbol AVL se autoequilibra para mantener la investigación eficiente.',
  },
  {
    highlightId: 'tutorial-navigation',
    label: 'Navegación',
    message: () =>
      'NAVEGACIÓN — Estos tres botones te permiten cambiar entre el Árbol del Caso, el Mapa de Investigación y el Tablero Táctico. El Tablero se desbloquea a partir del Día 2.',
  },
  {
    highlightId: null,
    label: '¡Listos!',
    message: (name) =>
      `¡Todo listo, Detective ${name}! Recuerda: 5 amonestaciones terminan el juego, y cada día cuesta $50. Selecciona tu primera evidencia y comienza a construir el caso. ¡Buena suerte!`,
  },
];

interface Props {
  playerName: string;
  onComplete: () => void;
  playAudio: (clip: AlexClip) => void;
}

const TutorialOverlay: React.FC<Props> = ({ playerName, onComplete, playAudio }) => {
  const [step, setStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Ref so keyboard handler always reads current step without stale closure
  const stepRef = useRef(step);
  stepRef.current = step;

  const currentStep = STEPS[step];

  const updateRect = useCallback(() => {
    if (!currentStep.highlightId) { setHighlightRect(null); return; }
    const el = document.querySelector(`[data-tutorial-id="${currentStep.highlightId}"]`);
    if (el) setHighlightRect(el.getBoundingClientRect());
    else setHighlightRect(null);
  }, [currentStep.highlightId]);

  useLayoutEffect(() => { updateRect(); }, [updateRect]);

  useEffect(() => {
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  // Play audio clip on step change
  useEffect(() => {
    playAudio(TUTORIAL_CLIPS[step]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Keyboard: capture phase so game handlers never see the event ──
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      // Always stop propagation — game must not handle keys during tutorial
      e.stopPropagation();

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (stepRef.current < STEPS.length - 1) setStep(s => s + 1);
        else onComplete();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (stepRef.current > 0) setStep(s => s - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (stepRef.current < STEPS.length - 1) setStep(s => s + 1);
        else onComplete();
      }
    };
    // capture: true → fires before any listener registered with bubble phase
    window.addEventListener('keydown', handle, true);
    return () => window.removeEventListener('keydown', handle, true);
  }, [onComplete]);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onComplete();
  };

  const goPrev = () => { if (step > 0) setStep(s => s - 1); };

  const isLast = step === STEPS.length - 1;
  const msg = currentStep.message(playerName);

  // Dialogue box: place it on the side with the most free space
  const getDialogueStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      maxWidth: 400,
      width: '88vw',
      fontFamily: '"VT323", monospace',
    };
    if (!highlightRect) {
      return { ...base, bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
    }
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const cx = highlightRect.left + highlightRect.width / 2;
    const cy = highlightRect.top + highlightRect.height / 2;
    const dlgW = Math.min(400, sw * 0.88);
    const dlgH = 240;

    const spaceRight  = sw - highlightRect.right;
    const spaceLeft   = highlightRect.left;
    const spaceBottom = sh - highlightRect.bottom;
    const spaceTop    = highlightRect.top;
    const max = Math.max(spaceRight, spaceLeft, spaceBottom, spaceTop);

    if (spaceBottom === max && spaceBottom > dlgH + 20)
      return { ...base, top: highlightRect.bottom + 16, left: Math.max(8, Math.min(sw - dlgW - 8, cx - dlgW / 2)) };
    if (spaceTop === max && spaceTop > dlgH + 20)
      return { ...base, bottom: sh - highlightRect.top + 16, left: Math.max(8, Math.min(sw - dlgW - 8, cx - dlgW / 2)) };
    if (spaceRight === max && spaceRight > dlgW + 20)
      return { ...base, left: highlightRect.right + 16, top: Math.max(8, Math.min(sh - dlgH - 8, cy - dlgH / 2)) };
    return { ...base, right: sw - highlightRect.left + 16, top: Math.max(8, Math.min(sh - dlgH - 8, cy - dlgH / 2)) };
  };

  return (
    <>
      {/*
        SVG overlay — pointerEvents: 'auto' means it CAPTURES all clicks on the game.
        Only the dialogue box (z-index 1000, above the SVG at 998) remains interactive.
        cursor: 'not-allowed' signals to the user that the UI is locked.
      */}
      <svg
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 998,
          pointerEvents: 'auto',
          cursor: 'not-allowed',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tut-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - PADDING}
                y={highlightRect.top - PADDING}
                width={highlightRect.width + PADDING * 2}
                height={highlightRect.height + PADDING * 2}
                fill="black"
                rx="4"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.83)" mask="url(#tut-mask)" />
      </svg>

      {/* Pulsing highlight border — visual only, no pointer events */}
      {highlightRect && (
        <motion.div
          key={`hl-${step}`}
          animate={{
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              '0 0 8px rgba(0,249,255,0.5)',
              '0 0 22px rgba(0,249,255,0.95)',
              '0 0 8px rgba(0,249,255,0.5)',
            ],
          }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            zIndex: 999,
            left: highlightRect.left - PADDING,
            top: highlightRect.top - PADDING,
            width: highlightRect.width + PADDING * 2,
            height: highlightRect.height + PADDING * 2,
            border: '2px solid #00f9ff',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Dialogue box — pointer-events work normally here (above blocking SVG) */}
      <motion.div
        key={`dlg-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={getDialogueStyle()}
      >
        <div style={{ background: '#000', border: '2px solid #00f9ff', boxShadow: `
  0 0 10px rgba(0,249,255,0.4),
  0 0 25px rgba(0,249,255,0.25),
  inset 0 0 10px rgba(0,249,255,0.1)
`, padding: '1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(0,249,255,0.3)' }}>
            <div style={{
              width: 36, height: 36, background: '#00f9ff', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: 11, letterSpacing: '0.04em',
              flexShrink: 0,
            }}>
              ALEX
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#00f9ff', textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1 }}>
                Detective Alex
              </div>
              <div style={{ fontSize: 10, color: 'rgba(0,249,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tutorial — Paso {step + 1} / {STEPS.length} &nbsp;·&nbsp; ← → para navegar
              </div>
            </div>
          </div>

          {/* Message */}
          <p style={{ fontSize: 16, color: '#b8feff', lineHeight: 1.5, marginBottom: 14, minHeight: 60 }}>
            {msg}
          </p>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                title={s.label}
                style={{
                  width: 10, height: 10,
                  background: i === step ? '#00f9ff' : i < step ? 'rgba(0,249,255,0.45)' : 'rgba(0,249,255,0.15)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {step > 0 && (
              <button
                onClick={goPrev}
                style={{
                  padding: '4px 12px', fontSize: 14,
                  border: '1px solid rgba(0,249,255,0.45)',
                  color: 'rgba(0,249,255,0.7)',
                  background: 'transparent', cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontFamily: '"VT323", monospace',
                }}
              >
                ◀ Anterior
              </button>
            )}
            <button
              onClick={goNext}
              style={{
                padding: '4px 18px', fontSize: 15,
                background: '#00f9ff', color: '#000',
                border: 'none', cursor: 'pointer',
                fontWeight: 'bold', textTransform: 'uppercase',
                fontFamily: '"VT323", monospace',
                boxShadow: '0 0 10px rgba(0,249,255,0.5)',
              }}
            >
              {isLast ? '¡Empezar!' : 'Siguiente ▶'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TutorialOverlay;
