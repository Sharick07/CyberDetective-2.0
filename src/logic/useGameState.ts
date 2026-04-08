import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Evidence, CrimeType } from '../types/game';
import { generateDayEvidences } from './gameEngine';
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
  dayEarnings: number;
}

const INITIAL_STATE: GameState = {
  playerName: '',
  day: 1,
  level: 1,
  money: 500,
  integrity: 100,
  amonestations: 0,
  evidenceCollected: [],
  processedEvidenceIds: [],
  tree: null,
  currentEvidence: null,
  isGameOver: false,
  gameOverReason: '',
  gameOverType: '',
  hasAcceptedBribe: false,
  bribeCount: 0,
  pendingBribeOffer: null,
  timeRemaining: 600,
  timerActive: true,
  dayEarnings: 0,
  totalNodesInserted: 0,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [message, setMessage] = useState<string>('');
  const [dayTransitionInfo, setDayTransitionInfo] = useState<DayTransitionInfo | null>(null);
  const [avlRotationFlag, setAvlRotationFlag] = useState(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setTimedMessage = useCallback((msg: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(msg);
    messageTimerRef.current = setTimeout(() => setMessage(''), 5000);
  }, []);

  // Generate evidences for day 1 when the game starts (playerName set, no evidence yet, no processed IDs)
  useEffect(() => {
    if (
      state.playerName !== '' &&
      state.day === 1 &&
      !state.isGameOver &&
      state.evidenceCollected.length === 0 &&
      state.processedEvidenceIds.length === 0
    ) {
      const newEvidences = generateDayEvidences(1, []);
      setState(prev => ({
        ...prev,
        evidenceCollected: newEvidences,
        currentEvidence: newEvidences[0] || null,
      }));
    }
    // Intentionally does NOT include evidenceCollected.length — fires only at day start
  }, [state.playerName, state.day, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer — pauses during transitions and game over
  useEffect(() => {
    if (state.isGameOver || dayTransitionInfo !== null || !state.timerActive) {
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) return { ...prev, timeRemaining: 0, timerActive: false };
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; } };
  }, [state.isGameOver, state.timerActive, dayTransitionInfo]);

  // Auto-trigger day end when timer expires
  useEffect(() => {
    if (state.timeRemaining === 0 && !state.timerActive && !state.isGameOver && dayTransitionInfo === null) {
      startDayTransition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timerActive]);

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
      // Correct classification
      const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      AVLTree.rotationCount = 0;
      const newTree = AVLTree.insert(
        state.tree,
        newNodeId,
        evidence.id,
        selectedCrime,
        evidence.gravity
      );
      if (AVLTree.rotationCount > 0) setAvlRotationFlag(f => f + 1);
      const newTotalNodes = state.totalNodesInserted + 1;

      setState(prev => ({
        ...prev,
        tree: newTree,
        money: prev.money + 100,
        dayEarnings: prev.dayEarnings + 100,
        evidenceCollected: prev.evidenceCollected.filter(e => e.id !== evidenceId),
        processedEvidenceIds: [...prev.processedEvidenceIds, evidenceId],
        currentEvidence: null,
        totalNodesInserted: newTotalNodes,
      }));
      setTimedMessage(`✓ CASO INSERTADO EN EL ÁRBOL — Delito: ${selectedCrime} — Nodo #${newTotalNodes}`);
    } else {
      // Wrong classification — evidence STAYS in the list
      const newAmonestations = state.amonestations + 1;
      if (newAmonestations >= 5) {
        setState(prev => ({
          ...prev,
          amonestations: newAmonestations,
          money: prev.money - 50,
          isGameOver: true,
          gameOverReason: 'Desestimado por incompetencia. Has acumulado 5 amonestaciones sin posibilidad de rehabilitación.',
          gameOverType: 'incompetencia',
        }));
      } else {
        setState(prev => ({
          ...prev,
          amonestations: newAmonestations,
          money: prev.money - 50,
          // evidenceCollected is NOT modified — player must retry
        }));
        setTimedMessage(`CLASIFICACIÓN INCORRECTA — Amonestación #${newAmonestations}/5 — Multa: $50`);
      }
    }
  };

  // Calculates end-of-day summary and opens the transition modal. Does NOT apply state yet.
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
        ? 'Desalojado por insolvencia económica. No pudiste pagar la renta del día.'
        : '',
      isFinalDay,
      dayEarnings: state.dayEarnings,
    });
  };

  // Applies end-of-day changes after the player dismisses the modal.
  const confirmEndDay = () => {
    if (!dayTransitionInfo) return;

    // Game over by insolvency
    if (dayTransitionInfo.isGameOverNext) {
      setState(prev => ({
        ...prev,
        money: dayTransitionInfo.moneyAfter,
        isGameOver: true,
        gameOverReason: dayTransitionInfo.gameOverReason,
        gameOverType: 'insolvencia',
      }));
      setDayTransitionInfo(null);
      return;
    }

    // Final day reached
    if (dayTransitionInfo.isFinalDay) {
      setState(prev => ({
        ...prev,
        day: 10,
        timeRemaining: 600,
        timerActive: true,
        dayEarnings: 0,
      }));
      setDayTransitionInfo(null);
      return;
    }

    const nextDay = dayTransitionInfo.completedDay + 1;
    const nextLevel = dayTransitionInfo.nextLevel;

    // Generate evidences for the new day, excluding already processed IDs
    const newEvidences = generateDayEvidences(nextLevel, state.processedEvidenceIds);

    // Bribe offer: only on days 7 and 9, maximum 2 times total
    const shouldOfferBribe = (nextDay === 7 || nextDay === 9) && state.bribeCount < 2;
    const bribeAmount = shouldOfferBribe
      ? 300 + Math.floor(Math.random() * 301)  // $300–$600
      : null;

    setState(prev => ({
      ...prev,
      money: dayTransitionInfo.moneyAfter,
      day: nextDay,
      level: nextLevel,
      evidenceCollected: newEvidences,
      currentEvidence: newEvidences[0] || null,
      timeRemaining: 600,
      timerActive: true,
      dayEarnings: 0,
      pendingBribeOffer: bribeAmount,
      bribeCount: shouldOfferBribe ? prev.bribeCount + 1 : prev.bribeCount,
    }));

    setDayTransitionInfo(null);
  };

  const acceptBribe = () => {
    const amount = state.pendingBribeOffer;
    if (amount === null) return;
    setState(prev => ({
      ...prev,
      money: prev.money + amount,
      integrity: Math.max(0, prev.integrity - 30),
      hasAcceptedBribe: true,
      pendingBribeOffer: null,
    }));
    setTimedMessage(`Has aceptado el soborno. +$${amount} — Tu integridad ha caído. Asuntos Internos está vigilando.`);
  };

  const rejectBribe = () => {
    setState(prev => ({
      ...prev,
      integrity: Math.min(100, prev.integrity + 5),
      pendingBribeOffer: null,
    }));
    setTimedMessage('Has rechazado el soborno. Integridad +5%. Valeria puede confiar en ti.');
  };

  const submitFinalVerdict = (isGuilty: boolean) => {
    if (isGuilty) {
      if (state.hasAcceptedBribe) {
        setState(prev => ({
          ...prev,
          isGameOver: true,
          gameOverReason: 'Veredicto correcto — pero Asuntos Internos descubrió los sobornos. Arrestado por corrupción y prevaricato. Valeria no obtuvo justicia.',
          gameOverType: 'corrupcion',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isGameOver: true,
          gameOverReason: 'VICTORIA: Valeria está a salvo. Has identificado al culpable, construido el caso y mantenido tu integridad. La justicia fue cumplida.',
          gameOverType: 'victoria',
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isGameOver: true,
        gameOverReason: 'Veredicto incorrecto. El agresor escapó por falta de pruebas. Caso desestimado. Valeria sigue sin justicia.',
        gameOverType: 'veredicto',
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
    rejectBribe,
    submitFinalVerdict,
    resetGame,
    saveGame,
    loadGame,
    setMessage: setTimedMessage
  };
}
