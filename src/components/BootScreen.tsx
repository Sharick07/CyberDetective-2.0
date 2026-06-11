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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;

      if (!hasStarted) {
        setHasStarted(true);
      } else if (isDone) {
        onComplete();
      } else {
        setCharIndex(fullText.length);
        setIsDone(true);
        typingAudioRef.current?.pause();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [hasStarted, isDone, fullText.length, onComplete]);

  if (!hasStarted) {
    return (
      <div
        className="h-full flex items-center justify-center bg-black cursor-pointer transition-colors duration-300"
        onClick={() => setHasStarted(true)}
      >
        <div
          className="animate-pulse px-8 py-4 text-2xl tracking-widest font-bold"
          style={{
            color: '#00f9ff',
            border: '2px solid #00f9ff',
            textShadow: '0 0 10px rgba(0,249,255,0.8)',
            boxShadow: `
              0 0 10px rgba(0,249,255,0.4),
              0 0 20px rgba(0,249,255,0.3),
              inset 0 0 10px rgba(0,249,255,0.15)
            `,
          }}
        >
          [ INICIAR SISTEMA ]
        </div>
      </div>
    );
  }

  const displayedText = fullText.slice(0, charIndex);
  const paragraphs = displayedText.split('\n');

  return (
    <div
      className="h-full flex flex-col items-start justify-center p-12 bg-black"
      style={{
        color: '#00f9ff',
        textShadow: '0 0 6px rgba(0,249,255,0.4)',
      }}
    >
      <div className="space-y-4 max-w-4xl">
        {paragraphs.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: '1.25rem',
              lineHeight: 1.7,
              color: '#b8feff',
            }}
          >
            {line}
            {i === paragraphs.length - 1 && !isDone && (
              <span
                className="animate-pulse"
                style={{
                  color: '#00f9ff',
                }}
              >
                _
              </span>
            )}
          </p>
        ))}

        {isDone && (
          <button
            onClick={onComplete}
            className="mt-8 px-8 py-3 text-xl tracking-widest font-bold transition-all animate-pulse"
            style={{
              background: 'transparent',
              color: '#00f9ff',
              border: '2px solid #00f9ff',
              textShadow: '0 0 8px rgba(0,249,255,0.6)',
              boxShadow: `
                0 0 10px rgba(0,249,255,0.4),
                0 0 20px rgba(0,249,255,0.25)
              `,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00f9ff';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#00f9ff';
            }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
};

export default BootScreen;