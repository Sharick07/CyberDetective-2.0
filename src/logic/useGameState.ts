import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Evidence, CrimeType, CatalogueEntry, BribeRecord } from '../types/game';
import { generateDayEvidences, EVIDENCE_TEMPLATES, AUTHORS, GRAVITY_RANGE, getRandomAge } from './gameEngine';
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
  money: 0,
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
  timeRemaining: 300,
  timerActive: true,
  awaitingDayEnd: false,
  messagesGeneratedToday: 0,
  dayEarnings: 0,
  totalNodesInserted: 0,
  rootAgeExclusionAge: null,
  rootAgeExclusionRemaining: 0,
  cataloguedLog: [],
  tutorialStep: 0,
  bribeHistory: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [message, setMessage] = useState<string>('');
  const [alexAlertMessage, setAlexAlertMessage] = useState<string>('');
  const [dayTransitionInfo, setDayTransitionInfo] = useState<DayTransitionInfo | null>(null);
  const [avlRotationFlag, setAvlRotationFlag] = useState(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scheduledMessagesRef = useRef<{ targetGameSeconds: number; evidence: Evidence }[]>([]);
  const scheduleInitializedRef = useRef(false);
  const nextMessageTimeRef = useRef<number | null>(null);

  const setTimedMessage = useCallback((msg: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(msg);
    messageTimerRef.current = setTimeout(() => setMessage(''), 5000);
  }, []);

  const GAME_DAY_DURATION = 300;
  const GAME_DAY_SECONDS = 8 * 3600;
  const GAME_SPEED = GAME_DAY_SECONDS / GAME_DAY_DURATION;
  const GAME_START_SECONDS = 10 * 3600;

  const formatGameTime = (gameSeconds: number) => {
    const totalSeconds = GAME_START_SECONDS + Math.min(gameSeconds, GAME_DAY_SECONDS);
    const hours24 = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hour12 = ((hours24 + 11) % 12) + 1;
    return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const createRandomValeriaMessage = (day: number, targetGameSeconds: number, excludeAge: number | null = null): Evidence => {
    // Generate evidence using day-based filtering
    const availableCrimeTypes: string[] = ['None']; // Positive comments always available
    if (day <= 2) {
      availableCrimeTypes.push('Injuria');
    } else if (day <= 4) {
      availableCrimeTypes.push('Injuria', 'Calumnia');
    } else if (day <= 6) {
      availableCrimeTypes.push('Injuria', 'Calumnia', 'Suplantación');
    } else if (day <= 8) {
      availableCrimeTypes.push('Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento');
    } else {
      availableCrimeTypes.push('Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento', 'Amenazas');
    }

    // Filter templates to only include available crime types
    const filteredTemplates: any[] = [];
    Object.entries(EVIDENCE_TEMPLATES).forEach(([level, templates]) => {
      (templates as any[]).forEach((template: any) => {
        if (availableCrimeTypes.includes(template.crime)) {
          filteredTemplates.push(template);
        }
      });
    });

    const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
    const content = template.content[Math.floor(Math.random() * template.content.length)];
    const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
    const age = getRandomAge(excludeAge);
    const level = Math.min(5, Math.max(1, day));
    const [minG, maxG] = GRAVITY_RANGE[level];
    const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));

    // Unique ID
    const id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    return {
      id,
      type: template.type,
      author,
      age,
      content: `"${author}: ${content}"`,
      timestamp: formatGameTime(targetGameSeconds),
      gravity,
      correctCrime: template.crime,
      details: template.details,
    };
  };

  const scheduleNextMessage = (currentGameSeconds: number, messagesGenerated: number) => {
    if (messagesGenerated >= 40 && currentGameSeconds < 6 * 3600) {
      nextMessageTimeRef.current = null;
      return;
    }
    if (currentGameSeconds >= 6 * 3600) {
      nextMessageTimeRef.current = null;
      return;
    }
    const delay = 180 + Math.floor(Math.random() * (600 - 180 + 1));
    nextMessageTimeRef.current = currentGameSeconds + delay;
  };

  // Generate evidences for day 1 when the game starts (playerName set, no evidence yet, no processed IDs)
  useEffect(() => {
    if (
      state.playerName !== '' &&
      state.day === 1 &&
      !state.isGameOver &&
      state.evidenceCollected.length === 0 &&
      state.processedEvidenceIds.length === 0
    ) {
      const excludeAge = state.rootAgeExclusionRemaining > 0 ? state.rootAgeExclusionAge : null;
      const newEvidences = generateDayEvidences(1, [], excludeAge);
      // Assign proper timestamps for day 1 starting messages (around 10:00-10:30 AM)
      const timestampedEvidences = newEvidences.map((evidence, index) => ({
        ...evidence,
        timestamp: formatGameTime(0 + (index * 300)), // 10:00 AM + 5 minutes per message
        content: `${evidence.content} (recibido a las ${formatGameTime(0 + (index * 300))})`,
      }));
      setState(prev => ({
        ...prev,
        evidenceCollected: timestampedEvidences,
        currentEvidence: timestampedEvidences[0] || null,
        rootAgeExclusionRemaining: prev.rootAgeExclusionAge !== null
          ? Math.max(0, prev.rootAgeExclusionRemaining - timestampedEvidences.length)
          : prev.rootAgeExclusionRemaining,
      }));
    }
    // Intentionally does NOT include evidenceCollected.length — fires only at day start
  }, [state.playerName, state.day, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial step 1: explain pending evidence when day 1 loads
  useEffect(() => {
    if (
      state.day === 1 &&
      state.tutorialStep === 0 &&
      state.evidenceCollected.length > 0 &&
      state.processedEvidenceIds.length === 0 &&
      !state.isGameOver
    ) {
      setState(prev => ({ ...prev, tutorialStep: 1 }));
      setAlexAlertMessage(
        'Día 1, Detective. Tienes evidencias pendientes en pantalla. Lee cada comentario con cuidado y clasifícalo con el delito correcto: Injuria, Calumnia, Suplantación, Hostigamiento, Amenazas o Concierto para delinquir. Si el comentario es positivo o neutro, elige None. Cada error suma una amonestación. ¡Comienza cuando estés listo!'
      );
    }
  }, [state.evidenceCollected.length, state.day, state.tutorialStep, state.processedEvidenceIds.length, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial step 2: explain navigation bar after first classification
  useEffect(() => {
    if (
      state.day === 1 &&
      state.tutorialStep === 1 &&
      state.processedEvidenceIds.length === 1 &&
      !state.isGameOver
    ) {
      setState(prev => ({ ...prev, tutorialStep: 2 }));
      setAlexAlertMessage(
        '¡Bien hecho! Ahora presta atención a la barra inferior derecha. Allí encontrarás dos herramientas clave: el MAPA DE INVESTIGACIÓN (ícono de pin), donde se visualizan las capas del acoso catalogadas y puedes asignar penas posibles a cada evidencia; y el TABLERO TÁCTICO (ícono de capas), donde puedes comparar hipótesis, revisar el árbol de delitos y hacer anotaciones sobre el caso. Úsalas para construir tu expediente.'
      );
    }
  }, [state.processedEvidenceIds.length, state.day, state.tutorialStep, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial step 1: explain pending evidence when day 1 loads
  useEffect(() => {
    if (
      state.day === 1 &&
      state.tutorialStep === 0 &&
      state.evidenceCollected.length > 0 &&
      state.processedEvidenceIds.length === 0 &&
      !state.isGameOver
    ) {
      setState(prev => ({ ...prev, tutorialStep: 1 }));
      setAlexAlertMessage(
        'Día 1, Detective. Tienes evidencias pendientes en pantalla. Lee cada comentario con cuidado y clasifícalo con el delito correcto: Injuria, Calumnia, Suplantación, Hostigamiento, Amenazas o Concierto para delinquir. Si el comentario es positivo o neutro, elige None. Cada error suma una amonestación. ¡Comienza cuando estés listo!'
      );
    }
  }, [state.evidenceCollected.length, state.day, state.tutorialStep, state.processedEvidenceIds.length, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial step 2: explain navigation bar after first classification
  useEffect(() => {
    if (
      state.day === 1 &&
      state.tutorialStep === 1 &&
      state.processedEvidenceIds.length === 1 &&
      !state.isGameOver
    ) {
      setState(prev => ({ ...prev, tutorialStep: 2 }));
      setAlexAlertMessage(
        '¡Bien hecho en tu primera clasificación! Ahora pon atención a la barra inferior derecha. Allí encuentras dos herramientas clave: el MAPA DE INVESTIGACIÓN (icóno de pin), donde se visualizan las capas del acoso catalogadas y puedes asignar penas posibles a cada evidencia; y el TABLERO TÁCTICO (icóno de capas), donde puedes revisar el árbol de delitos, comparar hipótesis y hacer anotaciones. Úsalas para construir tu expediente.'
      );
    }
  }, [state.processedEvidenceIds.length, state.day, state.tutorialStep, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize message scheduling at day start
  useEffect(() => {
    if (state.playerName !== '' && state.day >= 1 && !state.isGameOver && nextMessageTimeRef.current === null) {
      const delay = 180 + Math.floor(Math.random() * (600 - 180 + 1));
      nextMessageTimeRef.current = delay; // start from beginning of day
    }
  }, [state.playerName, state.day, state.isGameOver]);

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

  useEffect(() => {
    if (state.timeRemaining < 0 || state.isGameOver) return;

    const elapsedReal = Math.max(0, GAME_DAY_DURATION - state.timeRemaining);
    const elapsedGameSeconds = Math.round(elapsedReal * GAME_SPEED);

    // Handle scheduled messages (legacy, but keep for now)
    const dueMessages = scheduledMessagesRef.current.filter(event => elapsedGameSeconds >= event.targetGameSeconds);
    if (dueMessages.length > 0) {
      setState(prev => ({
        ...prev,
        evidenceCollected: [...prev.evidenceCollected, ...dueMessages.map(event => event.evidence)],
      }));
      scheduledMessagesRef.current = scheduledMessagesRef.current.filter(event => elapsedGameSeconds < event.targetGameSeconds);
    }

    // Dynamic message generation
    if (nextMessageTimeRef.current !== null && elapsedGameSeconds >= nextMessageTimeRef.current) {
      const excludeAge = state.rootAgeExclusionRemaining > 0 ? state.rootAgeExclusionAge : null;
      const newMessage = createRandomValeriaMessage(state.day, nextMessageTimeRef.current, excludeAge);
      setState(prev => ({
        ...prev,
        evidenceCollected: [...prev.evidenceCollected, newMessage],
        messagesGeneratedToday: prev.messagesGeneratedToday + 1,
        rootAgeExclusionRemaining: prev.rootAgeExclusionRemaining > 0
          ? Math.max(0, prev.rootAgeExclusionRemaining - 1)
          : 0,
      }));
      scheduleNextMessage(elapsedGameSeconds, state.messagesGeneratedToday + 1);
    }

    // After 4:00 PM, if no pending evidences, schedule more messages
    if (elapsedGameSeconds >= 6 * 3600 && state.evidenceCollected.length === 0 && nextMessageTimeRef.current === null) {
      scheduleNextMessage(elapsedGameSeconds, state.messagesGeneratedToday);
    }
  }, [state.timeRemaining, state.isGameOver, state.level, state.messagesGeneratedToday]);

  // Auto-trigger day end when timer expires
  useEffect(() => {
    if (state.timeRemaining === 0 && !state.timerActive && !state.isGameOver && dayTransitionInfo === null) {
      if (state.currentEvidence === null) {
        startDayTransition();
      } else if (!state.awaitingDayEnd) {
        setState(prev => ({
          ...prev,
          awaitingDayEnd: true,
        }));
        setTimedMessage('El día terminó. Clasifica la evidencia actual para continuar al siguiente día.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timerActive, state.timeRemaining, state.currentEvidence, state.isGameOver, dayTransitionInfo]);

  useEffect(() => {
    if (state.awaitingDayEnd && state.timeRemaining === 0 && !state.isGameOver && state.currentEvidence === null && dayTransitionInfo === null) {
      setState(prev => ({ ...prev, awaitingDayEnd: false }));
      startDayTransition();
    }
  }, [state.awaitingDayEnd, state.currentEvidence, state.timeRemaining, state.isGameOver, dayTransitionInfo]);

  const setPlayerName = (name: string) => {
    setState(prev => ({ ...prev, playerName: name }));
  };

  const selectEvidence = (evidence: Evidence) => {
    setState(prev => ({ ...prev, currentEvidence: evidence }));
  };

  const pauseGame = useCallback(() => {
    setState(prev => ({ ...prev, timerActive: false }));
  }, []);

  const resumeGame = useCallback(() => {
    if (!state.isGameOver && dayTransitionInfo === null) {
      setState(prev => ({ ...prev, timerActive: true }));
    }
  }, [state.isGameOver, dayTransitionInfo]);

  const classifyCrime = (evidenceId: string, selectedCrime: CrimeType) => {
    const evidence = state.evidenceCollected.find(e => e.id === evidenceId);
    if (!evidence) return;

    if (selectedCrime === evidence.correctCrime) {
      // Correct classification
      let newTree = state.tree;
      let newTotalNodes = state.totalNodesInserted;
      let messageText = '';
      let rootAgeExclusionAge = state.rootAgeExclusionAge;
      let rootAgeExclusionRemaining = state.rootAgeExclusionRemaining;
      const oldRootAge = state.tree?.age ?? null;

      if (selectedCrime !== 'None') {
        // Only insert into tree if it's an actual crime, not a positive comment
        const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        AVLTree.rotationCount = 0;
        newTree = AVLTree.insert(
          state.tree,
          newNodeId,
          evidence.id,
          selectedCrime,
          evidence.age,
          evidence.gravity
        );
        if (AVLTree.rotationCount > 0) setAvlRotationFlag(f => f + 1);
        newTotalNodes = state.totalNodesInserted + 1;
        const newRootAge = newTree.age;
        if (newRootAge !== oldRootAge) {
          rootAgeExclusionAge = newRootAge;
          rootAgeExclusionRemaining = 6;
        }
        messageText = `✓ CASO INSERTADO EN EL ÁRBOL — Delito: ${selectedCrime} — Nodo #${newTotalNodes} — +$10`;
      } else {
        // Positive comment discarded
        messageText = `✓ COMENTARIO POSITIVO DESCARTADO — No es evidencia de delito — +$10`;
      }

      const correctCatalogueEntry: CatalogueEntry | null = selectedCrime !== 'None' ? {
        evidenceId: evidence.id,
        crimeType: selectedCrime,
        day: state.day,
        level: state.level,
        content: evidence.content,
        type: evidence.type,
        author: evidence.author,
      } : null;

      setState(prev => {
        const remaining = prev.evidenceCollected.filter(e => e.id !== evidenceId);
        return {
          ...prev,
          tree: newTree,
          money: prev.money + 10,
          dayEarnings: prev.dayEarnings + 10,
          evidenceCollected: remaining,
          processedEvidenceIds: [...prev.processedEvidenceIds, evidenceId],
          currentEvidence: remaining[0] || null,
          awaitingDayEnd: prev.awaitingDayEnd && prev.timeRemaining === 0 ? false : prev.awaitingDayEnd,
          totalNodesInserted: newTotalNodes,
          rootAgeExclusionAge,
          rootAgeExclusionRemaining,
          ...(correctCatalogueEntry ? { cataloguedLog: [...prev.cataloguedLog, correctCatalogueEntry] } : {}),
        };
      });

      // Schedule next message if needed
      const elapsedReal = Math.max(0, GAME_DAY_DURATION - state.timeRemaining);
      const elapsedGameSeconds = Math.round(elapsedReal * GAME_SPEED);
      if (state.messagesGeneratedToday < 40 && elapsedGameSeconds < 6 * 3600 && nextMessageTimeRef.current === null) {
        scheduleNextMessage(elapsedGameSeconds, state.messagesGeneratedToday);
      }
      setTimedMessage(messageText);
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
        const isPositiveComment = evidence.correctCrime === 'None';
        const selectedIsCrime = selectedCrime !== 'None';
        let newTree = state.tree;
        let newTotalNodes = state.totalNodesInserted;
        let alexWarning = '';
        let rootAgeExclusionAge = state.rootAgeExclusionAge;
        let rootAgeExclusionRemaining = state.rootAgeExclusionRemaining;
        const oldRootAge = state.tree?.age ?? null;

        let incorrectCatalogueEntry: CatalogueEntry | null = null;

        if (!isPositiveComment && selectedIsCrime) {
          // Incorrect crime classification: still insert into tree using the selected crime
          const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          AVLTree.rotationCount = 0;
          newTree = AVLTree.insert(
            state.tree,
            newNodeId,
            evidence.id,
            selectedCrime,
            evidence.age,
            evidence.gravity
          );
          if (AVLTree.rotationCount > 0) setAvlRotationFlag(f => f + 1);
          newTotalNodes = state.totalNodesInserted + 1;
          const newRootAge = newTree.age;
          if (newRootAge !== oldRootAge) {
            rootAgeExclusionAge = newRootAge;
            rootAgeExclusionRemaining = 6;
          }
          incorrectCatalogueEntry = { evidenceId: evidence.id, crimeType: selectedCrime, day: state.day, level: state.level, content: evidence.content, type: evidence.type, author: evidence.author };
          alexWarning = `⚠️ IMPORTANTE: Alex detectó que clasificaste mal esta evidencia. Se insertó en el árbol con la etiqueta elegida para que puedas revisar el error. Acepta este mensaje para continuar.`;
        } else if (!isPositiveComment && !selectedIsCrime) {
          alexWarning = `⚠️ IMPORTANTE: Clasificaste esta evidencia real como None. No se insertó en el árbol. Revisa los criterios de delito antes de continuar.`;
        } else if (isPositiveComment && selectedIsCrime) {
          // Positive comment mistakenly classified as crime: insert into tree anyway
          const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          AVLTree.rotationCount = 0;
          newTree = AVLTree.insert(
            state.tree,
            newNodeId,
            evidence.id,
            selectedCrime,
            evidence.age,
            evidence.gravity
          );
          if (AVLTree.rotationCount > 0) setAvlRotationFlag(f => f + 1);
          newTotalNodes = state.totalNodesInserted + 1;
          const newRootAge = newTree.age;
          if (newRootAge !== oldRootAge) {
            rootAgeExclusionAge = newRootAge;
            rootAgeExclusionRemaining = 6;
          }
          incorrectCatalogueEntry = { evidenceId: evidence.id, crimeType: selectedCrime, day: state.day, level: state.level, content: evidence.content, type: evidence.type, author: evidence.author };
          alexWarning = `⚠️ IMPORTANTE: Este comentario es positivo, pero lo marcaste como delito. Se insertó en el árbol con la etiqueta elegida. Revisa tu criterio en la próxima clasificación.`;
        }

        const remaining = state.evidenceCollected.filter(e => e.id !== evidenceId);

        setState(prev => ({
          ...prev,
          tree: newTree,
          money: prev.money,
          amonestations: newAmonestations,
          evidenceCollected: remaining,
          processedEvidenceIds: [...prev.processedEvidenceIds, evidenceId],
          currentEvidence: remaining[0] || null,
          awaitingDayEnd: prev.awaitingDayEnd && prev.timeRemaining === 0 ? false : prev.awaitingDayEnd,
          totalNodesInserted: newTotalNodes,
          rootAgeExclusionAge,
          rootAgeExclusionRemaining,
          ...(incorrectCatalogueEntry ? { cataloguedLog: [...prev.cataloguedLog, incorrectCatalogueEntry] } : {}),
        }));

        if (alexWarning && !alexAlertMessage) {
          setAlexAlertMessage(alexWarning);
        }
        setTimedMessage(`CLASIFICACIÓN INCORRECTA — Amonestación #${newAmonestations}/5`);
      }
    }
  };

  // Calculates end-of-day summary and opens the transition modal. Does NOT apply state yet.
  const startDayTransition = () => {
    const totalCost = 50;
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
        timeRemaining: 300,
        timerActive: true,
        dayEarnings: 0,
      }));
      setDayTransitionInfo(null);
      return;
    }

    const nextDay = dayTransitionInfo.completedDay + 1;
    const nextLevel = dayTransitionInfo.nextLevel;

    // Generate evidences for the new day, excluding already processed IDs
    const excludeAge = state.rootAgeExclusionRemaining > 0 ? state.rootAgeExclusionAge : null;
    const rawEvidences = generateDayEvidences(nextDay, state.processedEvidenceIds, excludeAge);
    // Assign proper timestamps for new day starting messages (around 10:00-10:30 AM)
    const newEvidences = rawEvidences.map((evidence, index) => ({
      ...evidence,
      timestamp: formatGameTime(0 + (index * 300)), // 10:00 AM + 5 minutes per message
      content: `${evidence.content} (recibido a las ${formatGameTime(0 + (index * 300))})`,
    }));

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
      timeRemaining: 300,
      timerActive: true,
      dayEarnings: 0,
      pendingBribeOffer: bribeAmount,
      bribeCount: shouldOfferBribe ? prev.bribeCount + 1 : prev.bribeCount,
      bribeHistory: shouldOfferBribe && bribeAmount !== null
        ? [...prev.bribeHistory, { day: nextDay, amount: bribeAmount, status: 'pending' } as BribeRecord]
        : prev.bribeHistory,
      messagesGeneratedToday: 0,
    }));

    scheduleInitializedRef.current = false;
    nextMessageTimeRef.current = null;
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
      bribeHistory: prev.bribeHistory.map((b, i) =>
        i === prev.bribeHistory.length - 1 && b.status === 'pending'
          ? { ...b, status: 'accepted' as const }
          : b
      ),
    }));
    setTimedMessage(`Has aceptado el soborno. +$${amount} — Tu integridad ha caído. Asuntos Internos está vigilando.`);
  };

  const rejectBribe = () => {
    setState(prev => ({
      ...prev,
      integrity: Math.min(100, prev.integrity + 5),
      pendingBribeOffer: null,
      bribeHistory: prev.bribeHistory.map((b, i) =>
        i === prev.bribeHistory.length - 1 && b.status === 'pending'
          ? { ...b, status: 'rejected' as const }
          : b
      ),
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

  const acknowledgeAlexAlert = () => {
    setAlexAlertMessage('');
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
    setMessage('');
    setAlexAlertMessage('');
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
    resetGame,
    saveGame,
    loadGame,
    setMessage: setTimedMessage,
    pauseGame,
    resumeGame,
  };
}
