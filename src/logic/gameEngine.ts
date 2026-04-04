import { Evidence, CrimeType } from '../types/game';

const AUTHORS = ['ANON_7834', 'Dexio', 'ShadowUser', 'NetGhost', 'Valeria_Fan_1', 'JusticeSeeker', 'CyberBully_99', 'Ghost_Protocol'];

const EVIDENCE_TEMPLATES: Record<number, { type: Evidence['type']; content: string[]; crime: CrimeType; details: string }[]> = {
  1: [
    {
      type: 'Tweet',
      content: [
        "¡Nadie te soporta, Valeria! 😠",
        "Valeria es la persona más patética de la escuela. #NetCity",
        "Ojalá Valeria se fuera de la ciudad para siempre."
      ],
      crime: 'Injuria',
      details: 'Mensaje ofensivo directo en red social pública.'
    },
    {
      type: 'Chat',
      content: [
        "Mira lo que dicen de ti en el grupo, Valeria. Nadie te quiere.",
        "Eres un estorbo para todos nosotros."
      ],
      crime: 'Injuria',
      details: 'Mensaje ofensivo en chat grupal privado.'
    }
  ],
  2: [
    {
      type: 'Post',
      content: [
        "¿Sabían que Valeria robó las respuestas del examen? Pásalo.",
        "Valeria fue vista saliendo de la oficina del director con dinero robado.",
        "Confirmado: Valeria está engañando a todos con su perfil falso."
      ],
      crime: 'Calumnia',
      details: 'Difusión de información falsa que daña la reputación.'
    }
  ],
  3: [
    {
      type: 'Profile',
      content: [
        "Perfil falso detectado: 'Valeria_Oficial' publicando contenido inapropiado.",
        "Cuenta 'Valeria_Real' enviando spam y virus a sus contactos.",
        "Alguien está usando las fotos de Valeria para crear perfiles en sitios de citas."
      ],
      crime: 'Suplantación',
      details: 'Uso de imagen y nombre ajeno para perjudicar.'
    }
  ],
  4: [
    {
      type: 'Chat',
      content: [
        "Sabemos dónde vives, Valeria. Si vas a la policía, te arrepentirás.",
        "Te estamos vigilando. No puedes escapar de nosotros.",
        "Mañana en la salida de la escuela te daremos tu merecido."
      ],
      crime: 'Amenazas',
      details: 'Amenaza directa de daño físico o represalias.'
    },
    {
      type: 'Email',
      content: [
        "No dejes de mirar atrás, Valeria. Estamos en todas partes.",
        "Tu vida digital es nuestra. Tu vida real también lo será pronto."
      ],
      crime: 'Hostigamiento',
      details: 'Persecución sistemática y asedio psicológico.'
    }
  ],
  5: [
    {
      type: 'Post',
      content: [
        "Operación 'Silencio Valeria' iniciada. Todos a sus puestos.",
        "Coordinación de ataque masivo a las 20:00. No dejen rastro.",
        "Grupo 'Anti-Valeria' ha decidido el siguiente paso. Es hora de actuar."
      ],
      crime: 'Concierto para delinquir',
      details: 'Múltiples usuarios coordinando ataques delictivos.'
    }
  ]
};

export const generateEvidence = (level: number): Evidence => {
  const id = Math.random().toString(36).substr(2, 9);
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  
  const levelTemplates = EVIDENCE_TEMPLATES[level as keyof typeof EVIDENCE_TEMPLATES] || EVIDENCE_TEMPLATES[1];
  const template = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
  
  const content = template.content[Math.floor(Math.random() * template.content.length)];
  const gravity = (level * 2) - 1 + Math.floor(Math.random() * 2);

  return {
    id,
    type: template.type,
    author,
    content: `"${author}: ${content}"`,
    timestamp: new Date().toLocaleTimeString(),
    gravity,
    correctCrime: template.crime,
    details: template.details
  };
};
