import React, { useState, useEffect, useRef } from 'react';
import { BOOT_SEQUENCE } from '../constants/gameData';

interface BootScreenProps {
  onComplete: () => void;
  speakSystem: (text: string) => void;
}

/**
 * Pantalla de arranque del sistema.
 * Muestra una secuencia de texto animado al iniciar la aplicación.
 */
const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const fullText = BOOT_SEQUENCE.join('\n');
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Animación de texto al iniciar
  useEffect(() => {
    if (!hasStarted) return;

    const audio = new Audio('/Texto escribiendose.mp3');
    audio.loop = true;
    audio.volume = 0.7;
    typingAudioRef.current = audio;
    audio.play().catch(() => {});

    const interval = setInterval(() => {
      setCharIndex(prev => {
        const next = prev + 1;
        if (next >= fullText.length) {
          clearInterval(interval);
          typingAudioRef.current?.pause();
          setIsDone(true);
          return fullText.length;
        }
        return next;
      });
    }, 25);

    return () => {
      clearInterval(interval);
      typingAudioRef.current?.pause();
    };
  }, [fullText, hasStarted]);

  // Navegación por teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (!hasStarted) {
        setHasStarted(true);
      } else if (isDone) {
        onComplete();
      } else {
        // Skip animation
        setCharIndex(fullText.length);
        setIsDone(true);
        typingAudioRef.current?.pause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasStarted, isDone, fullText.length, onComplete]);

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

  const displayedText = fullText.slice(0, charIndex);
  const paragraphs = displayedText.split('\n');

  return (
    <div className="h-full flex flex-col items-start justify-center p-12 font-mono text-amber-500 bg-black">
      <div className="space-y-4 max-w-4xl">
        {paragraphs.map((line, i) => (
          <p key={i} className="text-xl leading-relaxed">
            {line}
            {i === paragraphs.length - 1 && !isDone && (
              <span className="animate-pulse">_</span>
            )}
          </p>
        ))}
        {isDone && (
          <button
            onClick={onComplete}
            className="mt-8 border-2 border-amber-500 px-8 py-3 text-xl tracking-widest font-bold hover:bg-amber-500 hover:text-black transition-all animate-pulse"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
};

export default BootScreen;
