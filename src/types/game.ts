export type CrimeType = 'Injuria' | 'Calumnia' | 'Suplantación' | 'Hostigamiento' | 'Amenazas' | 'Concierto para delinquir' | 'None';

export interface Evidence {
  id: string;
  type: 'Tweet' | 'Email' | 'Post' | 'Profile' | 'Chat';
  author: string;
  age: number; // 15-25
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
  age: number;
  gravity: number;
  left: GameNode | null;
  right: GameNode | null;
  height: number;
}

export interface CatalogueEntry {
  evidenceId: string;
  crimeType: CrimeType;
  day: number;
  level: number;
  content: string;
  type: Evidence['type'];
  author: string;
}

export interface BribeRecord {
  day: number;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface LevelCulprit {
  level: number;
  author: string;
  fullName: string;
  age: number;
  crimeType: CrimeType;
  evidenceId: string;
  verdict: 'pending' | 'jailed' | 'dismissed';
  revealed: boolean;
  wasRoot: boolean;
}

export interface GameState {
  playerName: string;
  day: number;               // 1-10
  level: number;             // 1-5
  money: number;
  integrity: number;         // 0-100
  amonestations: number;     // 0-5
  evidenceCollected: Evidence[];          // pending this day
  processedEvidenceIds: string[];         // all processed evidence IDs (never repeat)
  tree: GameNode | null;
  currentEvidence: Evidence | null;
  isGameOver: boolean;
  gameOverReason: string;
  gameOverType: 'insolvencia' | 'incompetencia' | 'veredicto' | 'corrupcion' | 'victoria' | '';
  hasAcceptedBribe: boolean;
  bribeCount: number;                     // how many times bribe was offered (max 2)
  pendingBribeOffer: number | null;       // active bribe amount, null = no offer
  timeRemaining: number;                  // seconds, starts at 300
  timerActive: boolean;
  awaitingDayEnd: boolean;               // day ended but waiting for current evidence classification
  messagesGeneratedToday: number;        // number of random messages generated this day
  dayEarnings: number;                    // earnings this day (reset each day)
  totalNodesInserted: number;             // total nodes in the tree
  rootAgeExclusionAge: number | null;    // age that is temporarily excluded from new comments
  rootAgeExclusionRemaining: number;     // how many comments still avoid the current root age
  cataloguedLog: CatalogueEntry[];        // all evidences inserted into the tree (with day/level)
  tutorialStep: number;                   // 0=not started, 1=intro shown, 2=nav shown
  bribeHistory: BribeRecord[];            // log of all bribe offers
  levelCulprits: LevelCulprit[];          // root node recorded at end of each level
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
