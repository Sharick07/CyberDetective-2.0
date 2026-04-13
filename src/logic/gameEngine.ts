import { Evidence, CrimeType } from '../types/game';

export const AUTHORS = [
  'ANON_7834', 'Dexio', 'ShadowUser', 'NetGhost',
  'Valeria_Fan_1', 'JusticeSeeker', 'CyberBully_99', 'Ghost_Protocol',
  'DarkNet_X', 'NullUser88', 'SilentTroll', 'TheRealDark'
];

export const AGE_RANGE: [number, number] = [15, 25];

export const getRandomAge = (excludeAge: number | null = null): number => {
  const [minAge, maxAge] = AGE_RANGE;
  const ages = [] as number[];
  for (let age = minAge; age <= maxAge; age++) {
    if (age !== excludeAge) ages.push(age);
  }
  return ages[Math.floor(Math.random() * ages.length)];
};

// Each level has ONLY its designated crime type
export const EVIDENCE_TEMPLATES: Record<number, { type: Evidence['type']; content: string[]; crime: CrimeType; details: string }[]> = {
  // Nivel 1 — INJURIA (Art. 220) y COMENTARIOS POSITIVOS
  1: [
    {
      type: 'Tweet',
      content: [
        "¡Nadie te soporta, Valeria! 😠",
        "Valeria es la persona más patética de la escuela. #NetCity",
        "Ojalá Valeria se fuera de la ciudad para siempre.",
        "Valeria huele mal y es una fracasada. Todos lo saben.",
        "¿Por qué Valeria sigue viniendo al colegio? Es un asco de persona."
      ],
      crime: 'Injuria',
      details: 'Mensaje ofensivo directo en red social pública que daña la honra.'
    },
    {
      type: 'Chat',
      content: [
        "Mira lo que dicen de ti en el grupo, Valeria. Nadie te quiere.",
        "Eres un estorbo para todos nosotros, Valeria.",
        "Valeria es lo peor que le pudo pasar a esta escuela.",
        "Todo el mundo habla de lo ridícula que eres, Valeria."
      ],
      crime: 'Injuria',
      details: 'Mensaje ofensivo en chat grupal que ataca la dignidad de la víctima.'
    },
    {
      type: 'Post',
      content: [
        "Valeria es la chica más horrible de NetCity, ¡cero amigos! 😂",
        "ATENCIÓN: Valeria #801 es una inútil total. Comparte si estás de acuerdo.",
        "¿Quién más piensa que Valeria debería cambiar de ciudad? ¡Que se vaya!"
      ],
      crime: 'Injuria',
      details: 'Publicación ofensiva masiva que humilla a la víctima ante sus conocidos.'
    },
    // Comentarios positivos - no son evidencia de delito
    {
      type: 'Tweet',
      content: [
        "¡Valeria es una gran amiga! Siempre está ahí cuando la necesitas. ❤️",
        "Valeria tiene un corazón enorme, es la mejor persona que conozco.",
        "Feliz cumpleaños Valeria! Eres increíble y mereces lo mejor. 🎉",
        "Valeria ayuda a todos en la escuela, es un ángel. 😊"
      ],
      crime: 'None',
      details: 'Comentario positivo y de apoyo que no constituye delito alguno.'
    },
    {
      type: 'Chat',
      content: [
        "Valeria, gracias por ayudarme con la tarea ayer. Eres la mejor!",
        "Me encanta cómo Valeria siempre tiene una sonrisa para todos.",
        "Valeria es super talentosa en arte, sus dibujos son geniales.",
        "Qué buena onda tienes Valeria, siempre positiva. 👍"
      ],
      crime: 'None',
      details: 'Mensaje de aprecio y reconocimiento positivo en conversación privada.'
    },
    {
      type: 'Post',
      content: [
        "Valeria es un ejemplo a seguir en NetCity. ¡Orgullo de tenerla como amiga!",
        "Compartiendo esta foto de Valeria porque ilumina cualquier día. 🌟",
        "Valeria organiza las mejores fiestas, siempre incluye a todos. 🎊",
        "Qué suerte tener a alguien como Valeria en nuestra comunidad."
      ],
      crime: 'None',
      details: 'Publicación positiva que destaca cualidades y contribuciones de la persona.'
    }
  ],

  // Nivel 2 — CALUMNIA (Art. 221)
  2: [
    {
      type: 'Post',
      content: [
        "¿Sabían que Valeria robó las respuestas del examen? Pásalo.",
        "Valeria fue vista saliendo de la oficina del director con dinero robado.",
        "CONFIRMADO: Valeria está engañando a todos con un perfil falso desde hace meses.",
        "Fuentes internas confirman que Valeria amenazó a estudiantes menores. ¡Es un peligro!"
      ],
      crime: 'Calumnia',
      details: 'Difusión de información FALSA que imputa un delito inexistente y daña la reputación.'
    },
    {
      type: 'Email',
      content: [
        "Aviso a todos: Valeria fue expulsada de su último colegio por robo. ¡Cuidado con ella!",
        "Se ha comprobado que Valeria falsificó documentos. No confíen en ella.",
        "Valeria vendía respuestas de exámenes. Ya hay pruebas, lo dice el rector en privado."
      ],
      crime: 'Calumnia',
      details: 'Correo con acusaciones falsas de conductas delictivas para destruir la reputación de la víctima.'
    }
  ],

  // Nivel 3 — SUPLANTACIÓN (Ley 1273/2009)
  3: [
    {
      type: 'Profile',
      content: [
        "Perfil falso detectado: 'Valeria_Oficial' publicando contenido inapropiado con su foto.",
        "Cuenta 'Valeria_Real2024' enviando spam y links maliciosos a sus contactos.",
        "Alguien usa las fotos de Valeria para crear perfiles en sitios de citas sin su consentimiento.",
        "Cuenta '@valerita_801_real' haciéndose pasar por la víctima para extorsionar contactos."
      ],
      crime: 'Suplantación',
      details: 'Uso fraudulento de imagen, nombre e identidad ajena para cometer actos ilícitos en línea.'
    },
    {
      type: 'Post',
      content: [
        "Fui hackeada — alguien robó mi identidad y está enviando mensajes horribles en mi nombre. — Valeria",
        "Cuidado: la cuenta @ValeriaNetCity NO soy yo. Están usando mis fotos para hacer daño.",
        "Reporte: perfil 'Valeria#801_real' es FALSO. Está usando mi identidad para contactar menores."
      ],
      crime: 'Suplantación',
      details: 'Evidencia directa de usurpación de identidad digital con fines de daño y engaño.'
    }
  ],

  // Nivel 4 — AMENAZAS (Art. 347) y HOSTIGAMIENTO (Art. 134B)
  4: [
    {
      type: 'Chat',
      content: [
        "Sabemos dónde vives, Valeria. Si vas a la policía, te arrepentirás.",
        "Mañana en la salida de la escuela te daremos tu merecido. Te lo prometemos.",
        "Tienes 24 horas para borrar tu cuenta o publicamos tus fotos privadas. Elige.",
        "No te salvarás, Valeria. Estamos en todas partes y te encontraremos."
      ],
      crime: 'Amenazas',
      details: 'Mensaje que infunde temor fundado de daño futuro a la integridad física o digital de la víctima.'
    },
    {
      type: 'Email',
      content: [
        "No dejes de mirar atrás. Estamos en todas partes y sabemos tu horario.",
        "Cada vez que salgas de casa, estaremos ahí. No puedes escapar de nosotros.",
        "Te hemos estado siguiendo semanas. Sabemos tus rutas, tus amigos, tu familia.",
        "Este es el quinto mensaje. Seguiremos hasta que abandones la ciudad. Es una promesa."
      ],
      crime: 'Hostigamiento',
      details: 'Patrón sistemático y reiterado de persecución y asedio que genera terror psicológico en la víctima.'
    }
  ],

  // Nivel 5 — CONCIERTO PARA DELINQUIR (Art. 340)
  5: [
    {
      type: 'Post',
      content: [
        "Operación 'Silencio Valeria' iniciada. Todos a sus puestos. Fase 2 en 48h.",
        "Coordinación de ataque masivo a las 20:00. Todos con cuentas nuevas. No dejen rastro.",
        "Grupo 'Anti-Valeria' — próxima reunión: viernes. Traigan las capturas y los accesos.",
        "Confirmado: somos 12. Repartimos los objetivos esta noche. Ningún error permitido."
      ],
      crime: 'Concierto para delinquir',
      details: 'Múltiples usuarios asociados de forma permanente para planificar y ejecutar ataques coordinados contra la víctima.'
    },
    {
      type: 'Chat',
      content: [
        "Todos en el canal: ejecutar plan B ahora. Atacar cuentas de Valeria simultáneamente.",
        "Recordatorio: cada célula tiene su objetivo. No se comuniquen por aquí después de la operación.",
        "Aquí el organizador: ya tenemos acceso a su correo. La próxima fase es tomar sus redes."
      ],
      crime: 'Concierto para delinquir',
      details: 'Comunicación interna de organización criminal digital coordinando ataques persistentes.'
    }
  ]
};

// Number of evidences generated per day, by level
const EVIDENCES_PER_LEVEL: Record<number, number> = {
  1: 2,
  2: 3,
  3: 3,
  4: 4,
  5: 4,
};

// Gravity range per level (defines AVL insertion key)
export const GRAVITY_RANGE: Record<number, [number, number]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
  5: [9, 10],
};

export const generateEvidence = (level: number, excludeIds: string[] = [], excludeAge: number | null = null): Evidence => {
  const clampedLevel = Math.min(5, Math.max(1, level));
  const levelTemplates = EVIDENCE_TEMPLATES[clampedLevel] || EVIDENCE_TEMPLATES[1];
  const template = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
  const content = template.content[Math.floor(Math.random() * template.content.length)];
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  const age = getRandomAge(excludeAge);
  const [minG, maxG] = GRAVITY_RANGE[clampedLevel];
  const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));

  // Unique ID that is never in excludeIds
  let id: string;
  do {
    id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  } while (excludeIds.includes(id));

  return {
    id,
    type: template.type,
    author,
    age,
    content: `"${author}: ${content}"`,
    timestamp: new Date().toLocaleTimeString(),
    gravity,
    correctCrime: template.crime,
    details: template.details,
  };
};

export const generateDayEvidences = (day: number, excludeIds: string[], excludeAge: number | null = null): Evidence[] => {
  // Determine available crime types for this day (including 'None' for positive comments)
  let availableCrimeTypes: string[] = ['None']; // Positive comments always available
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
  const filteredTemplates: { type: Evidence['type']; content: string[]; crime: string; details: string }[] = [];
  
  Object.entries(EVIDENCE_TEMPLATES).forEach(([level, templates]) => {
    templates.forEach(template => {
      if (availableCrimeTypes.includes(template.crime)) {
        filteredTemplates.push(template);
      }
    });
  });

  const count = EVIDENCES_PER_LEVEL[Math.min(5, Math.max(1, day))] ?? 2;
  const result: Evidence[] = [];
  const usedIds = [...excludeIds];
  
  for (let i = 0; i < count; i++) {
    // Generate evidence using filtered templates
    const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
    const content = template.content[Math.floor(Math.random() * template.content.length)];
    const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
    const age = getRandomAge(excludeAge);
    const level = Math.min(5, Math.max(1, day));
    const [minG, maxG] = GRAVITY_RANGE[level];
    const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));

    // Unique ID that is never in excludeIds
    let id: string;
    do {
      id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    } while (excludeIds.includes(id));

    result.push({
      id,
      type: template.type,
      author,
      age,
      content: `"${author}: ${content}"`,
      timestamp: new Date().toLocaleTimeString(),
      gravity,
      correctCrime: template.crime as any,
      details: template.details,
    });
    
    usedIds.push(id);
  }
  
  return result;
};
