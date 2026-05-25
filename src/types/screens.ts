// Tipos de pantallas disponibles en la aplicación
export type Screen =
  | 'boot'
  | 'intro'
  | 'main-menu'
  | 'case-tree'
  | 'investigation-map'
  | 'tactical-board'
  | 'game-over';

// Pantallas internas (muestran Header y Footer de navegación)
export const INTERNAL_SCREENS: Screen[] = [
  'case-tree',
  'investigation-map',
  'tactical-board',
];
