export type CrimeType = 'Injuria' | 'Calumnia' | 'Suplantación' | 'Hostigamiento' | 'Amenazas' | 'Concierto para delinquir' | 'None';

export interface Evidence {
  id: string;
  type: 'Tweet' | 'Email' | 'Post' | 'Profile' | 'Chat';
  author: string;
  content: string;
  timestamp: string;
  gravity: number; // 1-10
  correctCrime: CrimeType;
  details: string;
}

export interface GameNode {
  id: string;
  evidenceId: string;
  crimeType: CrimeType;
  gravity: number;
  left: GameNode | null;
  right: GameNode | null;
  height: number;
}

export interface GameState {
  playerName: string;
  day: number;
  level: number;
  money: number;
  integrity: number; // 0-100
  amonestations: number;
  evidenceCollected: Evidence[];
  tree: GameNode | null;
  currentEvidence: Evidence | null;
  isGameOver: boolean;
  gameOverReason: string;
  hasAcceptedBribe: boolean;
}

export const CRIME_INFO: Record<CrimeType, { article: string; description: string; requirements: string[] }> = {
  'Injuria': {
    article: 'Art. 220',
    description: 'El que haga a otra persona imputaciones deshonrosas.',
    requirements: ['Intención ofensiva', 'Afectación al buen nombre']
  },
  'Calumnia': {
    article: 'Art. 221',
    description: 'El que impute falsamente a otro una conducta típica.',
    requirements: ['Imputación falsa', 'Conducta delictiva inexistente']
  },
  'Suplantación': {
    article: 'Ley 1273 (2009)',
    description: 'Suplantación de sitios web para capturar datos personales.',
    requirements: ['Uso de identidad ajena', 'Fines ilícitos']
  },
  'Hostigamiento': {
    article: 'Art. 134B',
    description: 'El que promueva o instigue actos, conductas o comportamientos constitutivos de hostigamiento.',
    requirements: ['Actos repetitivos', 'Criterio de discriminación/odio']
  },
  'Amenazas': {
    article: 'Art. 347',
    description: 'El que por cualquier medio atemorice o amenace a una persona.',
    requirements: ['Temor fundado', 'Daño futuro']
  },
  'Concierto para delinquir': {
    article: 'Art. 340',
    description: 'Cuando varias personas se asocian con el fin de cometer delitos.',
    requirements: ['Asociación criminal', 'Permanencia']
  },
  'None': {
    article: 'N/A',
    description: 'Evidencia no constitutiva de delito penal.',
    requirements: []
  }
};
