import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Evidence, GameNode, CrimeType } from '../types/game';
import { generateEvidence } from './gameEngine';
import { AVLTree } from './avlTree';

export interface DayTransitionInfo {
  completedDay: number;
  moneyBefore: number;
  moneyAfter: number;
  moneyDelta: number;
  amonestations: number;
  prevLevel: number;
  nextLevel: number;
  levelChanged: boolean;
  isGameOverNext: boolean;
  gameOverReason: string;
  isFinalDay: boolean;
}

const INITIAL_STATE: GameState = {
  playerName: '',
  day: 1,
  level: 1,
  money: 500,
  integrity: 100,
  amonestations: 0,
  evidenceCollected: [],
  tree: null,
  currentEvidence: null,
  isGameOver: false,
  gameOverReason: '',
  hasAcceptedBribe: false,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [message, setMessage] = useState<string>('');
  const [dayTransitionInfo, setDayTransitionInfo] = useState<DayTransitionInfo | null>(null);
  const [avlRotationFlag, setAvlRotationFlag] = useState(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTimedMessage = useCallback((msg: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(msg);
    messageTimerRef.current = setTimeout(() => setMessage(''), 5000);
  }, []);

  // Auto-generate evidence when the queue is empty (on new day or after classifying all)
  useEffect(() => {
    if (state.isGameOver) return;
    if (state.evidenceCollected.length === 0) {
      const newEvidence = generateEvidence(state.level);
      setState(prev => ({
        ...prev,
        evidenceCollected: [newEvidence],
        currentEvidence: newEvidence
      }));
    }
  }, [state.day, state.level, state.isGameOver, state.evidenceCollected.length]);

  const setPlayerName = (name: string) => {
    setState(prev => ({ ...prev, playerName: name }));
  };

  const selectEvidence = (evidence: Evidence) => {
    setState(prev => ({ ...prev, currentEvidence: evidence }));
  };

  const classifyCrime = (evidenceId: string, selectedCrime: CrimeType) => {
    const evidence = state.evidenceCollected.find(e => e.id === evidenceId);
    if (!evidence) return;

    if (selectedCrime === evidence.correctCrime) {
      const newNodeId = Math.random().toString(36).substr(2, 5);
      AVLTree.rotationCount = 0;
      const newTree = AVLTree.insert(
        state.tree,
        newNodeId,
        evidence.id,
        selectedCrime,
        evidence.gravity
      );
      if (AVLTree.rotationCount > 0) setAvlRotationFlag(f => f + 1);
      setState(prev => ({
        ...prev,
        tree: newTree,
        money: prev.money + 100,
        evidenceCollected: prev.evidenceCollected.filter(e => e.id !== evidenceId),
        currentEvidence: null
      }));
      setTimedMessage(`¡Correcto! El caso ha sido insertado en el Árbol de la Verdad.`);
    } else {
      const newAmonestations = state.amonestations + 1;
      const newMoney = state.money - 50;
      if (newAmonestations >= 5) {
        setState(prev => ({
          ...prev,
          amonestations: newAmonestations,
          isGameOver: true,
          gameOverReason: 'Desestimado por incompetencia (5 amonestaciones).'
        }));
      } else {
        setState(prev => ({
          ...prev,
          amonestations: newAmonestations,
          money: newMoney
        }));
        setTimedMessage(`Error de clasificación. Amonestación recibida. Multa: $50.`);
      }
    }
  };

  // Calculates what will happen at end of day and opens the transition modal.
  // Does NOT apply any state changes yet.
  const startDayTransition = () => {
    const totalCost = 150;
    const moneyAfter = state.money - totalCost;
    const nextDay = state.day + 1;
    const isFinalDay = nextDay > 10;
    const nextLevel = isFinalDay ? state.level : Math.min(5, Math.ceil(nextDay / 2));
    const levelChanged = !isFinalDay && nextLevel !== state.level;
    const isGameOverNext = moneyAfter < 0;

    setDayTransitionInfo({
      completedDay: state.day,
      moneyBefore: state.money,
      moneyAfter,
      moneyDelta: -totalCost,
      amonestations: state.amonestations,
      prevLevel: state.level,
      nextLevel,
      levelChanged,
      isGameOverNext,
      gameOverReason: isGameOverNext
        ? 'Desalojado por insolvencia económica. No pudiste pagar la renta.'
        : '',
      isFinalDay,
    });
  };

  // Applies the end-of-day state changes after the player dismisses the modal.
  const confirmEndDay = () => {
    if (!dayTransitionInfo) return;

    if (dayTransitionInfo.isGameOverNext) {
      setState(prev => ({
        ...prev,
        money: dayTransitionInfo.moneyAfter,
        isGameOver: true,
        gameOverReason: dayTransitionInfo.gameOverReason,
      }));
      setDayTransitionInfo(null);
      return;
    }

    if (dayTransitionInfo.isFinalDay) {
      setState(prev => ({ ...prev, day: 10 }));
      setDayTransitionInfo(null);
      return;
    }

    const newEvidences = [
      generateEvidence(dayTransitionInfo.nextLevel),
      generateEvidence(dayTransitionInfo.nextLevel),
    ];
    setState(prev => ({
      ...prev,
      money: dayTransitionInfo.moneyAfter,
      day: dayTransitionInfo.completedDay + 1,
      level: dayTransitionInfo.nextLevel,
      evidenceCollected: newEvidences,
      currentEvidence: newEvidences[0],
    }));

    if (dayTransitionInfo.nextLevel >= 4 && Math.random() > 0.7) {
      setTimedMessage('⚠️ ALERTA: Has recibido un mensaje encriptado. Alguien ofrece $500 por "perder" una evidencia clave.');
    }

    setDayTransitionInfo(null);
  };

  const acceptBribe = (amount: number) => {
    setState(prev => ({
      ...prev,
      money: prev.money + amount,
      integrity: prev.integrity - 30,
      hasAcceptedBribe: true
    }));
    setTimedMessage('Has aceptado el soborno. Tu cuenta tiene más fondos, pero tu integridad ha caído.');
  };

  const submitFinalVerdict = (isGuilty: boolean) => {
    if (isGuilty) {
      if (state.hasAcceptedBribe) {
        setState(prev => ({
          ...prev,
          isGameOver: true,
          gameOverReason: 'Veredicto correcto, pero Asuntos Internos descubrió los sobornos. Arrestado por corrupción.'
        }));
      } else {
        setState(prev => ({
          ...prev,
          isGameOver: true,
          gameOverReason: 'VICTORIA: Valeria está a salvo y has mantenido tu integridad. ¡Justicia cumplida!'
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isGameOver: true,
        gameOverReason: 'Veredicto incorrecto. El agresor escapó. Caso desestimado.'
      }));
    }
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
    setMessage('');
    setDayTransitionInfo(null);
  };

  const saveGame = useCallback(async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      if (response.ok) {
        setTimedMessage('Progreso guardado en la terminal central.');
      } else {
        setTimedMessage('Error al guardar: el servidor rechazó la solicitud.');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setTimedMessage('Error de conexión: no se pudo guardar el progreso.');
    }
  }, [state, setTimedMessage]);

  const loadGame = useCallback(async () => {
    try {
      const response = await fetch('/api/load');
      const data = await response.json();
      if (data && !data.error) {
        setState(data);
        setTimedMessage('Expediente cargado con éxito.');
        return true;
      } else {
        setTimedMessage('No se encontró ningún expediente guardado.');
        return false;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      setTimedMessage('Error de conexión: no se pudo cargar el expediente.');
      return false;
    }
  }, [setTimedMessage]);

  return {
    state,
    message,
    dayTransitionInfo,
    avlRotationFlag,
    setPlayerName,
    selectEvidence,
    classifyCrime,
    startDayTransition,
    confirmEndDay,
    acceptBribe,
    submitFinalVerdict,
    resetGame,
    saveGame,
    loadGame,
    setMessage: setTimedMessage
  };
}
