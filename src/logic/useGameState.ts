import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Evidence, CrimeType, CatalogueEntry, BribeRecord, LevelCulprit } from '../types/game';
import { generateDayEvidences, EVIDENCE_TEMPLATES, AUTHORS, GRAVITY_RANGE, getRandomAge, FULL_NAME_BY_AUTHOR, REAL_EVIDENCE_POOL } from './gameEngine';
import { AVLTree } from './avlTree';
import { playAlexClip, ALEX_CLIPS } from '../hooks/useAlexVoice';

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
  timerActive: false,
  awaitingDayEnd: false,
  messagesGeneratedToday: 0,
  dayEarnings: 0,
  totalNodesInserted: 0,
  rootAgeExclusionAge: null,
  rootAgeExclusionRemaining: 0,
  cataloguedLog: [],
  penalizedEvidenceIds: [],
  tutorialStep: 0,
  bribeHistory: [],
  levelCulprits: [],
};

const SUSPECT_FULL_NAMES = [
  'Carlos Andrés Méndez', 'Valentina Rojas Pardo', 'Sebastián Duarte Ríos',
  'Mariana Castillo Vega', 'Diego Alejandro Torres', 'Camila Fernández Ruiz',
  'Andrés Felipe Moreno', 'Lucía Herrera Pinto', 'Julián Esteban Cárdenas',
  'Isabella Gómez Salazar', 'Mateo Ramírez Ortiz', 'Daniela Vargas León',
  'Santiago Ospina Mejía', 'Sofía Restrepo Cruz', 'Nicolás Peña Bravo',
  'Laura Jiménez Soto', 'Tomás Acevedo Gil', 'Paula Andrea Rincón',
  'Emilio Zapata Muñoz', 'Gabriela Navarro Díaz',
];

const MALE_FIRST_NAMES = ['Eduardo', 'Carlos', 'Juan', 'Alberto', 'Rodrigo', 'Fernando', 'Mario', 'Gustavo', 'Hernán'];
const FEMALE_FIRST_NAMES = ['María', 'Sandra', 'Patricia', 'Claudia', 'Ana', 'Rosa', 'Gloria', 'Liliana', 'Esperanza'];
const LAWYER_NAMES = ['Dr. Ramírez & Asociados', 'Lic. Gómez Defensa Legal', 'Dr. Pérez Abogados', 'Estudio Jurídico Vargas', 'Dra. Morales & Cía.'];

const makeBribeRecord = (culprit: LevelCulprit, day: number, originDay: number): BribeRecord => {
  const parts = culprit.fullName.split(' ');
  const lastName = parts.length >= 3 ? parts.slice(2).join(' ') : parts.slice(1).join(' ');
  const relIdx = Math.floor(Math.random() * 3); // 0=Padre, 1=Madre, 2=Abogado
  let sender: string;
  let relationship: string;
  if (relIdx === 0) {
    sender = `${MALE_FIRST_NAMES[Math.floor(Math.random() * MALE_FIRST_NAMES.length)]} ${lastName}`;
    relationship = `Padre de ${culprit.fullName}`;
  } else if (relIdx === 1) {
    sender = `${FEMALE_FIRST_NAMES[Math.floor(Math.random() * FEMALE_FIRST_NAMES.length)]} ${lastName}`;
    relationship = `Madre de ${culprit.fullName}`;
  } else {
    sender = LAWYER_NAMES[Math.floor(Math.random() * LAWYER_NAMES.length)];
    relationship = `Abogado/a de ${culprit.fullName}`;
  }
  return {
    day,
    originDay,
    amount: 200 + Math.floor(Math.random() * 401),
    status: 'pending',
    sender,
    relationship,
    targetSuspect: culprit.fullName,
    targetEvidenceId: culprit.evidenceId,
  };
};

const pickFullName = (usedNames: string[]): string => {
  const available = SUSPECT_FULL_NAMES.filter(n => !usedNames.includes(n));
  const pool = available.length > 0 ? available : SUSPECT_FULL_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
};

// Context-aware penalty hints shown during the sentencing phase in the Investigation Map
const PENALTY_HINTS: Partial<Record<CrimeType, string>> = {
  'Injuria':
    'Considera la difusión y el daño al buen nombre. Insulto en grupo grande o reiterado → Prisión 16-54 meses. Mensaje privado o aislado → Multa o Retractación pública. (Art. 220 C.P.)',
  'Calumnia':
    'La falsa imputación de un delito tiene penas mayores que la injuria. Si fue viral o causó consecuencias reales → Prisión 16-72 meses. Difusión limitada → Multa. (Art. 221 C.P.)',
  'Suplantación':
    '¿Hay perfil falso activo? → Eliminación inmediata. ¿Accedió a cuentas reales? → Prisión 48-96 meses. ¿Hubo ganancia económica? → Multa 100-1000 SMMLV. (Ley 1273/09, Art. 269C)',
  'Hostigamiento':
    'Evalúa la repetición del patrón. Conducta compulsiva y reiterada → Prisión 12-36 meses + Tratamiento psicológico. Contacto directo con la víctima → Medida de alejamiento. (Art. 134B C.P.)',
  'Amenazas':
    'Evalúa la credibilidad e inmediatez. Amenaza con plazo definido o recursos demostrados → Prisión 16-72 meses. Riesgo inminente para la víctima → Detención preventiva. (Art. 347 C.P.)',
  'Concierto para delinquir':
    'Crimen organizado: pena base 6-12 años. ¿Hay jerarquía o coordinación para delitos graves? → Agravante hasta 18 años. ¿Existe el grupo activo? → Disolución. (Art. 340 C.P.)',
};

// Narrative mastermind: the author whose crimes, when correctly classified, anchor the AVL root.
// Appears across levels 1 (Injuria), 2 (Calumnia), and 4 (Hostigamiento) — age 19.
export const TRUE_CULPRIT_AUTHOR = 'carlosm19'; // Carlos Andrés Méndez

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
    const gameLevel = Math.min(5, Math.max(1, Math.ceil(day / 2)));
    const levelPool = REAL_EVIDENCE_POOL[gameLevel];
    const [minG, maxG] = GRAVITY_RANGE[Math.min(5, Math.max(1, day))];
    const id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    // 60% criminal (from real pool), 40% positive (from None templates)
    if (levelPool && levelPool.length > 0 && Math.random() < 0.6) {
      const item = levelPool[Math.floor(Math.random() * levelPool.length)];
      const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));
      const groupTag = item.type === 'Chat'
        ? `[Grupo de ${300 + Math.floor(Math.random() * 701)} miembros] `
        : '';
      return {
        id,
        type: item.type,
        author: item.author,
        age: item.age,
        content: `${groupTag}"@${item.author}: ${item.content}"`,
        timestamp: formatGameTime(targetGameSeconds),
        gravity: minG + Math.floor(Math.random() * (maxG - minG + 1)),
        correctCrime: item.crime,
        details: item.details,
      };
    }

    // Positive (None) comments — keep original templates
    const noneTemplates: any[] = [];
    Object.values(EVIDENCE_TEMPLATES).forEach(templates => {
      (templates as any[]).forEach((template: any) => {
        if (template.crime === 'None') noneTemplates.push(template);
      });
    });
    const template = noneTemplates[Math.floor(Math.random() * noneTemplates.length)];
    const content = template.content[Math.floor(Math.random() * template.content.length)];
    const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
    const age = getRandomAge(excludeAge);
    const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));
    const groupTag = template.type === 'Chat'
      ? `[Grupo de ${300 + Math.floor(Math.random() * 701)} miembros] `
      : '';
    return {
      id,
      type: template.type,
      author,
      age,
      content: `${groupTag}"${author}: ${content}"`,
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

  // Generate evidences for day 1 when the game starts (playerName set, no evidence yet)
  useEffect(() => {
    if (state.playerName === '' || state.day !== 1 || state.isGameOver) return;

    // Guard is INSIDE the functional setState so it always reads the latest state,
    // never a stale closure value (fixes race conditions in React Strict Mode / batching).
    setState(prev => {
      if (prev.evidenceCollected.length > 0 || prev.processedEvidenceIds.length > 0) return prev;
      const excludeAge = prev.rootAgeExclusionRemaining > 0 ? prev.rootAgeExclusionAge : null;
      const generated = generateDayEvidences(1, [], excludeAge);
      console.log('[GameState] Evidencias Día 1 cargadas:', generated);
      if (generated.length === 0) {
        console.error('[GameState] generateDayEvidences retornó vacío para Día 1 — revisar gameEngine');
        return prev;
      }
      // Stamp game-time timestamps (10:00 AM + 5 min per slot); content is untouched.
      const stamped = generated.map((ev, i) => ({ ...ev, timestamp: formatGameTime(i * 300) }));
      return {
        ...prev,
        evidenceCollected: stamped,
        currentEvidence: stamped[0],
      };
    });
  }, [state.playerName, state.day, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial 0 → 1: Día 1, primera evidencia disponible — saludo de Alex
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
        `¡Buenos días, Detective ${state.playerName}! Como es tu primer día te indicaré cómo utilizar tu lugar de trabajo. En la parte izquierda de tu pantalla encontrarás las evidencias pendientes — selecciónalas y clasifícalas una a una. En la parte derecha verás los tipos de delito disponibles: elige el que mejor describe el comentario. Si es positivo o neutro, selecciona None. ¡Comienza con tu primera evidencia!`
      );
    }
  }, [state.evidenceCollected.length, state.day, state.tutorialStep, state.processedEvidenceIds.length, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutorial 2 → 3: Día 2 — Tablero Táctico desbloqueado, padres llegan
  useEffect(() => {
    if (
      state.day === 2 &&
      state.tutorialStep === 2 &&
      !state.isGameOver
    ) {
      setState(prev => ({ ...prev, tutorialStep: 3 }));
      playAlexClip(ALEX_CLIPS.DIA_2_TABLERO);
      setAlexAlertMessage(
        `¡Bienvenido al Día 2, Detective ${state.playerName}! Hoy comenzarán a llegar los padres de los involucrados. Por eso el TABLERO TÁCTICO ya está disponible (ícono de capas en la barra inferior): úsalo para revisar perfiles de sospechosos, gestionar sobornos y hacer anotaciones. Mantén la integridad intacta y sigue clasificando con cuidado.`
      );
    }
  }, [state.day, state.tutorialStep, state.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (state.day !== 10) {
        startDayTransition();
      }
      // Day 10: the dedicated effect below will trigger startDayTransition when suspects + bribe are also resolved
    }
  }, [state.awaitingDayEnd, state.currentEvidence, state.timeRemaining, state.isGameOver, dayTransitionInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Day 10 completion watch: auto-trigger transition when ALL prerequisites are finally met
  useEffect(() => {
    if (
      state.day === 10 &&
      state.timeRemaining === 0 &&
      !state.timerActive &&
      !state.isGameOver &&
      !state.awaitingDayEnd &&
      dayTransitionInfo === null &&
      state.currentEvidence === null &&
      state.evidenceCollected.length === 0 &&
      !state.levelCulprits.some(c => c.verdict === 'pending') &&
      state.pendingBribeOffer === null
    ) {
      startDayTransition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.levelCulprits, state.pendingBribeOffer, state.evidenceCollected.length, state.currentEvidence, state.awaitingDayEnd, state.timeRemaining, state.timerActive, state.isGameOver, dayTransitionInfo]);

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
        playAlexClip(ALEX_CLIPS.CASO_INSERTADO);
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
        penaltyHint: PENALTY_HINTS[selectedCrime],
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
      // Tutorial: after the very first correct classification on day 1
      if (state.day === 1 && state.tutorialStep === 1 && state.processedEvidenceIds.length === 0) {
        setState(prev => ({ ...prev, tutorialStep: 2 }));
        setAlexAlertMessage(
          `¡Excelente trabajo! Eso es exactamente lo que se espera de ti. Sigue así con las demás evidencias. Además, en la barra inferior derecha encontrarás dos herramientas clave: el ÁRBOL DEL CASO (icóno de árbol) donde se orgániza el expediente de manera jerárquica, y el MAPA DE INVESTIGACIÓN (icóno de pin) donde visualizarás las capas del acoso catalogadas y podrás asignar penas. ¡úsalas!`
        );
      } else {
        setTimedMessage(messageText);
      }
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
          playAlexClip(ALEX_CLIPS.DELITO_COMO_NONE);
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
          incorrectCatalogueEntry = { evidenceId: evidence.id, crimeType: selectedCrime, day: state.day, level: state.level, content: evidence.content, type: evidence.type, author: evidence.author, isFalseEvidence: true };
          alexWarning = `⚠️ IMPORTANTE: Este comentario es positivo, pero lo marcaste como delito. Se insertó en el árbol con la etiqueta elegida. Revisa tu criterio en la próxima clasificación.`;
          playAlexClip(ALEX_CLIPS.POSITIVO_COMO_DELITO);
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
        // Tutorial: after the very first incorrect classification on day 1
        if (state.day === 1 && state.tutorialStep === 1 && state.processedEvidenceIds.length === 0) {
          setState(prev => ({ ...prev, tutorialStep: 2 }));
          setAlexAlertMessage(
            `No te preocupes, Detective. Con la práctica lo irás dominando. Recuerda que cada delito tiene características propias. Sigue revisando las demás evidencias con calma. En la barra inferior derecha encontrarás dos herramientas: el ÁRBOL DEL CASO (icóno de árbol) y el MAPA DE INVESTIGACIÓN (icóno de pin). ¡Úsalas para construir tu expediente!`
          );
        }
        setTimedMessage(`CLASIFICACIÓN INCORRECTA — Amonestación #${newAmonestations}/5`);
      }
    }
  };

  // Calculates end-of-day summary and opens the transition modal. Does NOT apply state yet.
  const startDayTransition = () => {
    // Day 10 blocking: all evidence, suspects and bribes must be resolved first
    if (state.day === 10) {
      const hasPendingEvidence = state.currentEvidence !== null || state.evidenceCollected.length > 0;
      const hasPendingBribe = state.pendingBribeOffer !== null;
      const hasPendingSuspects = state.levelCulprits.some(c => c.verdict === 'pending');
      if (hasPendingEvidence) {
        if (!state.awaitingDayEnd) setState(prev => ({ ...prev, awaitingDayEnd: true }));
        setTimedMessage('⚠️ Último día — Clasifica todos los comentarios pendientes antes de cerrar el caso.');
        return;
      }
      if (hasPendingBribe) {
        setTimedMessage('⚠️ Último día — Tienes un soborno pendiente. Acéptalo o recházalo antes de cerrar.');
        return;
      }
      if (hasPendingSuspects) {
        setTimedMessage('⚠️ Último día — Asigna una condena a todos los sospechosos en el Mapa de Investigación.');
        return;
      }
    }
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
    const completedDay = dayTransitionInfo.completedDay;

    // The tree grows continuously across all days and levels — never reset.
    const trimmedTree = state.tree ?? null;

    const isEndOfLevel = completedDay % 2 === 0;

    // At end-of-level: mark the root as wasRoot and auto-jail it
    const rootEvidenceId = state.tree?.evidenceId ?? null;
    let updatedCulprits = isEndOfLevel && rootEvidenceId
      ? state.levelCulprits.map(c =>
          c.evidenceId === rootEvidenceId ? { ...c, wasRoot: true, verdict: 'jailed' as const } : c
        )
      : state.levelCulprits;

    // If root culprit is not yet in the list, add and auto-jail them
    if (isEndOfLevel && rootEvidenceId && !updatedCulprits.some(c => c.evidenceId === rootEvidenceId)) {
      const entry = state.cataloguedLog.find(e => e.evidenceId === rootEvidenceId);
      const rootNode = state.tree!;
      if (entry) {
        const personData = FULL_NAME_BY_AUTHOR[entry.author];
        const newCulprit: LevelCulprit = {
          level: entry.level,
          author: entry.author,
          fullName: personData ? personData.fullName : pickFullName(updatedCulprits.map(c => c.fullName)),
          age: personData ? personData.age : rootNode.age,
          crimeType: entry.crimeType,
          evidenceId: entry.evidenceId,
          verdict: 'jailed',
          revealed: true,
          wasRoot: true,
        };
        updatedCulprits = [...updatedCulprits, newCulprit];
      }
    }

    // Generate evidences for the new day, excluding already processed IDs
    const excludeAge = state.rootAgeExclusionRemaining > 0 ? state.rootAgeExclusionAge : null;
    const rawEvidences = generateDayEvidences(nextDay, state.processedEvidenceIds, excludeAge);
    console.log(`[GameState] Evidencias Día ${nextDay} cargadas:`, rawEvidences);
    // Stamp game-time timestamps (10:00 AM + 5 min per slot); content is untouched.
    const newEvidences = rawEvidences.map((ev, i) => ({ ...ev, timestamp: formatGameTime(i * 300) }));

    // Bribe offer from day 2+: parent/lawyer of a jailed suspect that hasn't been bribed yet
    // Only ~50% of eligible suspects will actually send a bribe email (random)
    const alreadyBribedIds = state.bribeHistory.map(b => b.targetEvidenceId);
    const eligibleForBribe = updatedCulprits.filter(
      c => c.verdict !== 'dismissed' && !alreadyBribedIds.includes(c.evidenceId)
    );
    const shouldOfferBribe = nextDay >= 2 && eligibleForBribe.length > 0 && Math.random() < 0.5;
    const bribeRecord = shouldOfferBribe
      ? makeBribeRecord(eligibleForBribe[Math.floor(Math.random() * eligibleForBribe.length)], nextDay, completedDay)
      : null;

    setState(prev => ({
      ...prev,
      money: dayTransitionInfo.moneyAfter,
      day: nextDay,
      level: nextLevel,
      tree: trimmedTree,
      rootAgeExclusionAge: prev.rootAgeExclusionAge,
      rootAgeExclusionRemaining: prev.rootAgeExclusionRemaining,
      levelCulprits: updatedCulprits,
      evidenceCollected: newEvidences,
      currentEvidence: newEvidences[0] || null,
      timeRemaining: 300,
      timerActive: true,
      dayEarnings: 0,
      pendingBribeOffer: bribeRecord,
      bribeHistory: bribeRecord ? [...prev.bribeHistory, bribeRecord] : prev.bribeHistory,
      messagesGeneratedToday: 0,
    }));

    scheduleInitializedRef.current = false;
    nextMessageTimeRef.current = null;
    setDayTransitionInfo(null);
  };

  const acceptBribe = () => {
    const bribe = state.pendingBribeOffer;
    if (!bribe) return;
    setState(prev => ({
      ...prev,
      dayEarnings: prev.dayEarnings + bribe.amount,
      integrity: Math.max(0, prev.integrity - 30),
      hasAcceptedBribe: true,
      pendingBribeOffer: null,
      bribeHistory: prev.bribeHistory.map(b =>
        b.targetEvidenceId === bribe.targetEvidenceId && b.status === 'pending'
          ? { ...b, status: 'accepted' as const }
          : b
      ),
    }));
    setTimedMessage(`Has aceptado el soborno de ${bribe.sender}. +$${bribe.amount} se sumará al cierre del día. Integridad -30%.`);
  };

  const holdBribe = () => {
    const bribe = state.pendingBribeOffer;
    if (!bribe) return;
    setState(prev => ({
      ...prev,
      pendingBribeOffer: null,
      bribeHistory: prev.bribeHistory.map(b =>
        b.targetEvidenceId === bribe.targetEvidenceId && b.status === 'pending'
          ? { ...b, status: 'on-hold' as const }
          : b
      ),
    }));
    setTimedMessage('Soborno puesto en espera. Lo encontrarás en el Tablero Táctico.');
  };

  const rejectBribe = () => {
    const bribe = state.pendingBribeOffer;
    if (!bribe) return;
    setState(prev => ({
      ...prev,
      integrity: Math.min(100, prev.integrity + 5),
      pendingBribeOffer: null,
      bribeHistory: prev.bribeHistory.map(b =>
        b.targetEvidenceId === bribe.targetEvidenceId && b.status === 'pending'
          ? { ...b, status: 'rejected' as const }
          : b
      ),
    }));
    setTimedMessage('Has rechazado el soborno. Integridad +5%. Valeria puede confiar en ti.');
  };

  const acceptHeldBribe = useCallback((targetEvidenceId: string) => {
    const bribe = state.bribeHistory.find(b => b.targetEvidenceId === targetEvidenceId && b.status === 'on-hold');
    if (!bribe) return;
    setState(prev => ({
      ...prev,
      dayEarnings: prev.dayEarnings + bribe.amount,
      integrity: Math.max(0, prev.integrity - 30),
      hasAcceptedBribe: true,
      bribeHistory: prev.bribeHistory.map(b =>
        b.targetEvidenceId === targetEvidenceId && b.status === 'on-hold'
          ? { ...b, status: 'accepted' as const }
          : b
      ),
    }));
    setTimedMessage(`Soborno de ${bribe.sender} aceptado. +$${bribe.amount} se sumará al cierre del día. Integridad -30%.`);
  }, [state.bribeHistory]);

  const rejectHeldBribe = useCallback((targetEvidenceId: string) => {
    setState(prev => ({
      ...prev,
      integrity: Math.min(100, prev.integrity + 5),
      bribeHistory: prev.bribeHistory.map(b =>
        b.targetEvidenceId === targetEvidenceId && b.status === 'on-hold'
          ? { ...b, status: 'rejected' as const }
          : b
      ),
    }));
    setTimedMessage('Soborno rechazado. Integridad +5%.');
  }, []);

  const jailCulprit = (evidenceId: string) => {
    const culprit = state.levelCulprits.find(c => c.evidenceId === evidenceId);

    // 30% random bribe trigger when jailing on day >= 2 and no pending offer
    const shouldBribe =
      state.day >= 2 &&
      !state.pendingBribeOffer &&
      !!culprit &&
      Math.random() < 0.3;
    const bribeRecord = shouldBribe && culprit ? makeBribeRecord(culprit, state.day, state.day) : null;

    setState(prev => ({
      ...prev,
      integrity: Math.min(100, prev.integrity + 5),
      levelCulprits: prev.levelCulprits.map(c =>
        c.evidenceId === evidenceId ? { ...c, verdict: 'jailed' as const } : c
      ),
      ...(bribeRecord ? {
        pendingBribeOffer: bribeRecord,
        bribeHistory: [...prev.bribeHistory, bribeRecord],
      } : {}),
    }));

    setTimedMessage(`Sospechoso ${culprit?.fullName ?? ''} enviado a prisión. Integridad +5%.`);

    if (bribeRecord && culprit) {
      setAlexAlertMessage(
        `📬 ¡Detective ${state.playerName}, correo urgente sobre el caso de ${culprit.fullName}!`
      );
    }
  };

  const dismissCulprit = (evidenceId: string) => {
    const culprit = state.levelCulprits.find(c => c.evidenceId === evidenceId);
    setState(prev => ({
      ...prev,
      integrity: Math.max(0, prev.integrity - 10),
      levelCulprits: prev.levelCulprits.map(c =>
        c.evidenceId === evidenceId ? { ...c, verdict: 'dismissed' as const } : c
      ),
    }));
    setTimedMessage(`Sospechoso ${culprit?.fullName ?? ''} desestimado del caso. Integridad -10%.`);
  };

  const submitFinalVerdict = () => {
    const rootEvidenceId = state.tree?.evidenceId ?? null;
    const rootEntry = rootEvidenceId
      ? state.cataloguedLog.find(e => e.evidenceId === rootEvidenceId)
      : null;
    const rootAuthor = rootEntry?.author ?? null;
    const correctCulpritAtRoot = rootAuthor === TRUE_CULPRIT_AUTHOR;

    if (!correctCulpritAtRoot) {
      setState(prev => ({
        ...prev,
        isGameOver: true,
        gameOverReason: `El árbol señala a "@${rootAuthor ?? 'desconocido'}" como culpable principal. Las clasificaciones incorrectas generaron rotaciones AVL que desplazaron al verdadero responsable de la raíz. Valeria no obtuvo justicia.`,
        gameOverType: 'veredicto',
      }));
    } else if (state.hasAcceptedBribe) {
      setState(prev => ({
        ...prev,
        isGameOver: true,
        gameOverReason: 'Identificaste al culpable correcto, pero Asuntos Internos descubrió que aceptaste sobornos durante la investigación. Arrestado por corrupción y prevaricato. Valeria no obtuvo justicia.',
        gameOverType: 'corrupcion',
      }));
    } else {
      setState(prev => ({
        ...prev,
        isGameOver: true,
        gameOverReason: 'VICTORIA: Valeria está a salvo. Identificaste al culpable real, construiste el árbol con precisión y mantuviste tu integridad. La justicia fue cumplida.',
        gameOverType: 'victoria',
      }));
    }
  };

  // Add suspect — called from Investigation Map when a prison penalty is applied
  const addSuspect = (evidenceId: string) => {
    // Don't add duplicate
    if (state.levelCulprits.some(c => c.evidenceId === evidenceId)) return;
    const entry = state.cataloguedLog.find(e => e.evidenceId === evidenceId);
    if (!entry) return;
    // Use real person data if available, otherwise fallback to random name
    const personData = FULL_NAME_BY_AUTHOR[entry.author];
    const newCulprit: LevelCulprit = {
      level: entry.level,
      author: entry.author,
      fullName: personData ? personData.fullName : pickFullName(state.levelCulprits.map(c => c.fullName)),
      age: personData ? personData.age : 18,
      crimeType: entry.crimeType,
      evidenceId: entry.evidenceId,
      verdict: 'pending',
      revealed: true,
      wasRoot: false,
    };
    setState(prev => ({
      ...prev,
      levelCulprits: [...prev.levelCulprits, newCulprit],
    }));
  };

  const acknowledgeAlexAlert = () => {
    setAlexAlertMessage('');
  };

  // Removes a false evidence entry (positive comment wrongly classified as crime) from the catalogue
  const removeFalseEvidence = useCallback((evidenceId: string) => {
    setState(prev => ({
      ...prev,
      cataloguedLog: prev.cataloguedLog.filter(e => e.evidenceId !== evidenceId),
    }));
    setTimedMessage('Evidencia descartada — comentario eliminado del expediente.');
  }, []);

  const checkCanEndGame = useCallback((): { canEnd: boolean; blockingReason: string } => {
    if (state.currentEvidence !== null || state.evidenceCollected.length > 0)
      return { canEnd: false, blockingReason: '⚠ Clasifica todos los comentarios pendientes primero.' };
    if (state.levelCulprits.some(c => c.verdict === 'pending'))
      return { canEnd: false, blockingReason: '⚠ Hay sospechosos sin sentencia. Ve al Tablero Táctico.' };
    if (state.pendingBribeOffer !== null)
      return { canEnd: false, blockingReason: '⚠ Tienes un soborno pendiente de responder.' };
    if (alexAlertMessage !== '')
      return { canEnd: false, blockingReason: '⚠ Hay un mensaje de Alex sin leer. Acéptalo para continuar.' };
    return { canEnd: true, blockingReason: '' };
  }, [state.currentEvidence, state.evidenceCollected.length, state.levelCulprits, state.pendingBribeOffer, alexAlertMessage]);

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

  const penalizeEvidence = useCallback((evidenceId: string) => {
    setState(prev => ({
      ...prev,
      penalizedEvidenceIds: prev.penalizedEvidenceIds.includes(evidenceId)
        ? prev.penalizedEvidenceIds
        : [...prev.penalizedEvidenceIds, evidenceId],
    }));
  }, []);

  // Alex notification when a new bribe arrives
  useEffect(() => {
    if (state.pendingBribeOffer !== null && !state.isGameOver) {
      setAlexAlertMessage(
        `📬 ¡Detective ${state.playerName}, tienes un correo nuevo!`
      );
    }
  }, [state.pendingBribeOffer?.targetEvidenceId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    holdBribe,
    rejectBribe,
    acceptHeldBribe,
    rejectHeldBribe,
    jailCulprit,
    dismissCulprit,
    addSuspect,
    penalizeEvidence,
    removeFalseEvidence,
    checkCanEndGame,
    submitFinalVerdict,
    resetGame,
    saveGame,
    loadGame,
    setMessage: setTimedMessage,
    pauseGame,
    resumeGame,
  };
}
