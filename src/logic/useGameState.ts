import { useState, useEffect, useCallback } from 'react';
import { GameState, Evidence, GameNode, CrimeType } from '../types/game';
import { generateEvidence } from './gameEngine';
import { AVLTree } from './avlTree';

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

  // Auto-generate evidence periodically or on level start
  useEffect(() => {
    if (state.isGameOver) return;
    
    // Initial evidence for the day
    if (state.evidenceCollected.length === 0) {
      const newEvidence = generateEvidence(state.level);
      setState(prev => ({
        ...prev,
        evidenceCollected: [newEvidence],
        currentEvidence: newEvidence
      }));
    }
  }, [state.day, state.level, state.isGameOver]);

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
      // Success
      const newNodeId = Math.random().toString(36).substr(2, 5);
      const newTree = AVLTree.insert(
        state.tree,
        newNodeId,
        evidence.id,
        selectedCrime,
        evidence.gravity
      );
      
      setState(prev => ({
        ...prev,
        tree: newTree,
        money: prev.money + 100,
        evidenceCollected: prev.evidenceCollected.filter(e => e.id !== evidenceId),
        currentEvidence: null
      }));
      setMessage(`¡Correcto! El caso ha sido insertado en el Árbol de la Verdad.`);
    } else {
      // Failure
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
        setMessage(`Error de clasificación. Amonestación recibida. Multa: $50.`);
      }
    }
  };

  const endDay = () => {
    const rent = 100;
    const food = 50;
    const totalCost = rent + food;
    
    setState(prev => {
      const nextMoney = prev.money - totalCost;
      const nextDay = prev.day + 1;
      const nextLevel = Math.ceil(nextDay / 2);
      
      if (nextMoney < 0) {
        return {
          ...prev,
          money: nextMoney,
          isGameOver: true,
          gameOverReason: 'Desalojado por insolvencia económica. No pudiste pagar la renta.'
        };
      }

      if (nextDay > 10) {
        return { ...prev, day: 10 }; // Final verdict phase
      }

      // Chance of bribe starting at level 4
      let bribeAvailable = false;
      if (nextLevel >= 4 && Math.random() > 0.7) {
        bribeAvailable = true;
      }

      return {
        ...prev,
        money: nextMoney,
        day: nextDay,
        level: nextLevel,
        evidenceCollected: [generateEvidence(nextLevel), generateEvidence(nextLevel)], // 2 evidences per day
        hasAcceptedBribe: bribeAvailable ? prev.hasAcceptedBribe : prev.hasAcceptedBribe // Reset or keep? Let's keep it.
      };
    });

    if (state.level >= 4 && Math.random() > 0.7) {
       setMessage('⚠️ ALERTA: Has recibido un mensaje encriptado. Alguien ofrece $500 por "perder" una evidencia clave.');
    }
  };

  const acceptBribe = (amount: number) => {
    setState(prev => ({
      ...prev,
      money: prev.money + amount,
      integrity: prev.integrity - 30,
      hasAcceptedBribe: true
    }));
    setMessage('Has aceptado el soborno. Tu cuenta tiene más fondos, pero tu integridad ha caído.');
  };

  const submitFinalVerdict = (isGuilty: boolean) => {
    // In this simplified logic, the "truth" is always that the root cause was a coordinated attack
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
  };

  const saveGame = useCallback(async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      if (response.ok) setMessage('Progreso guardado en la terminal central.');
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }, [state]);

  const loadGame = useCallback(async () => {
    try {
      const response = await fetch('/api/load');
      const data = await response.json();
      if (data && !data.error) {
        setState(data);
        setMessage('Expediente cargado con éxito.');
        return true;
      } else {
        setMessage('No se encontró ningún expediente guardado.');
        return false;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      return false;
    }
  }, []);

  return {
    state,
    message,
    setPlayerName,
    selectEvidence,
    classifyCrime,
    endDay,
    acceptBribe,
    submitFinalVerdict,
    resetGame,
    saveGame,
    loadGame,
    setMessage
  };
}
