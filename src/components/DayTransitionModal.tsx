import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { DayTransitionInfo } from '../logic/useGameState';
import { LEVEL_DESCRIPTIONS } from '../constants/gameData';

interface DayTransitionModalProps {
  info: DayTransitionInfo;
  onContinue: () => void;
}

/**
 * Modal que aparece al finalizar un día.
 * Muestra el resumen económico y desbloquea el siguiente nivel si corresponde.
 */
const DayTransitionModal: React.FC<DayTransitionModalProps> = ({ info, onContinue }) => {
  const [phase, setPhase] = useState<'summary' | 'level-unlock'>('summary');
  const levelData = LEVEL_DESCRIPTIONS[info.nextLevel];

  const handleContinue = () => {
    if (phase === 'summary' && info.levelChanged) setPhase('level-unlock');
    else onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        {phase === 'summary' ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="retro-border bg-black max-w-lg w-full p-8 space-y-5"
          >
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Informe de jornada</p>
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
                className="text-5xl font-black font-vt323 text-cyber-orange"
              >
                DÍA {info.completedDay} COMPLETADO
              </motion.h2>
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
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                  className={cn(
                    'font-vt323 text-4xl font-bold',
                    info.moneyAfter < 0 ? 'text-red-500' : info.moneyAfter < 50 ? 'text-yellow-400' : 'text-green-400',
                  )}
                >
                  ${info.moneyAfter}
                </motion.span>
              </div>
              {info.isGameOverNext && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-red-500 text-xs font-bold uppercase text-center animate-pulse"
                >
                  ⚠️ Fondos insuficientes — continuar cerrará el caso
                </motion.p>
              )}
            </div>
            <div className="h-px bg-cyber-orange/30" />
            <div className="space-y-2">
              <p className="text-[10px] uppercase opacity-60 tracking-wider">Amonestaciones acumuladas</p>
              <div className="flex gap-2 items-end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.05 * i + 0.3 }}
                    className={cn(
                      'font-vt323 text-2xl',
                      i < info.amonestations ? 'text-red-500' : 'text-cyber-orange/25',
                    )}
                  >
                    {i < info.amonestations ? '[✗]' : '[ ]'}
                  </motion.span>
                ))}
                <span className="text-xs opacity-50 ml-1">{info.amonestations}/5</span>
              </div>
            </div>
            {info.levelChanged && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="border border-cyber-orange bg-cyber-orange/10 p-3 text-center space-y-1"
              >
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Nueva fase desbloqueada</p>
                <p className="font-bold text-cyber-orange uppercase text-sm">
                  {levelData?.icon} NIVEL {info.nextLevel} — {levelData?.name}
                </p>
              </motion.div>
            )}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleContinue}
              className="btn-primary w-full text-base"
            >
              {info.levelChanged ? 'VER NUEVO NIVEL →' : 'CONTINUAR →'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="level-unlock"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.35 }}
            className="retro-border bg-black max-w-lg w-full p-10 text-center space-y-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-[10px] uppercase tracking-[0.4em] opacity-50"
            >
              — Nueva fase desbloqueada —
            </motion.p>
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 140, damping: 10 }}
              className="text-8xl select-none"
            >
              {levelData?.icon}
            </motion.div>
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-vt323 text-2xl text-cyber-orange/60"
              >
                NIVEL {info.nextLevel}
              </motion.p>
              <motion.h2
                initial={{ letterSpacing: '0.6em', opacity: 0 }}
                animate={{ letterSpacing: '0.08em', opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.55 }}
                className="text-3xl font-black uppercase text-cyber-orange"
              >
                {levelData?.name}
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="border border-cyber-orange/30 p-4 text-sm text-cyber-orange/80 leading-relaxed"
            >
              {levelData?.description}
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              onClick={handleContinue}
              className="btn-primary w-full text-base"
            >
              COMENZAR NIVEL {info.nextLevel} →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DayTransitionModal;
