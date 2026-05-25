import { GameNode, CrimeType } from '../types/game';

// --- Constantes de tiempo del juego ---
export const GAME_START_DATE = new Date(2005, 9, 14); // Mes 9 = octubre
export const GAME_DAY_DURATION = 300; // segundos reales por día de juego (5 minutos)
const GAME_DAY_SECONDS = 8 * 3600;
const GAME_SPEED = GAME_DAY_SECONDS / GAME_DAY_DURATION;

// --- Nombre de nivel ---
export const getLevelName = (level: number): string => {
  switch (level) {
    case 1: return 'LAS PRIMERAS SEÑALES';
    case 2: return 'EL RUMOR VIRAL';
    case 3: return 'LA CUENTA FANTASMA';
    case 4: return 'ATAQUE COORDINADO';
    case 5: return 'EL NÚCLEO DE LA VERDAD';
    default: return 'INVESTIGACIÓN';
  }
};

// --- Fecha del juego basada en el día ---
export const getCurrentGameDate = (day: number): string => {
  const date = new Date(GAME_START_DATE);
  date.setDate(date.getDate() + day - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

// --- Hora del juego basada en el tiempo restante ---
export const getCurrentGameTime = (timeRemaining: number): string => {
  const elapsedReal = Math.max(0, GAME_DAY_DURATION - timeRemaining);
  const elapsedGameSeconds = elapsedReal * GAME_SPEED;
  const totalSeconds = 10 * 3600 + elapsedGameSeconds;
  const cappedSeconds = Math.min(GAME_DAY_SECONDS + 10 * 3600, totalSeconds);
  const hours24 = Math.min(18, Math.floor(cappedSeconds / 3600));
  const minutes = Math.floor((cappedSeconds % 3600) / 60);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = ((hours24 + 11) % 12) + 1;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

// --- Profundidad del árbol ---
export const getTreeDepth = (node: GameNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
};

// --- Tipos de delito disponibles según el día ---
export const getAvailableCrimeTypes = (day: number): CrimeType[] => {
  if (day <= 2) return ['Injuria', 'None'];
  if (day <= 4) return ['Injuria', 'Calumnia', 'None'];
  if (day <= 6) return ['Injuria', 'Calumnia', 'Suplantación', 'None'];
  if (day <= 8) return ['Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento', 'None'];
  return ['Injuria', 'Calumnia', 'Suplantación', 'Hostigamiento', 'Amenazas', 'None'];
};
