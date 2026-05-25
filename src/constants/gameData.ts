// ─────────────────────────────────────────────────────────────────────────────
// Constantes estáticas del juego — datos de configuración y textos de la UI
// ─────────────────────────────────────────────────────────────────────────────

// --- Secuencia de arranque ---
export const BOOT_SEQUENCE = [
  'INICIANDO TERMINAL SECURE-OS...',
  'CARGANDO MÓDULO DE ACCESIBILIDAD',
  'CONEXIÓN ESTABLECIDA CON: NETCITY CENTRAL.',
  'Bienvenido a NetCity. En nuestra ciudad digital, la conexión lo es todo. Foros, redes sociales, mensajería instantánea... los estudiantes viven en línea. Pero en los últimos meses, la red se ha oscurecido. Las alertas por casos de ciberacoso y bullying han saturado nuestros servidores. Lo que pasa en la pantalla, está destruyendo vidas en el mundo real.',
];

// --- Avatares del detective ---
export const DETECTIVE_AVATARS = [
  '/personaje%201.png',
  '/personaje%202.png',
  '/personaje%203.png',
  '/personaje%204.png',
  '/personaje%205.png',
  '/personaje%206.png',
];

// --- Capas del mapa de investigación ---
export const CAPA_INFO: {
  level: number;
  emoji: string;
  label: string;
  sublabel: string;
  description: string;
}[] = [
  { level: 1, emoji: '💬', label: 'Injuria',          sublabel: 'Art. 220',     description: 'Imputaciones deshonrosas que afectan el buen nombre de la víctima.' },
  { level: 2, emoji: '📢', label: 'Calumnia',         sublabel: 'Art. 221',     description: 'Imputación falsa de conducta delictiva con intención de daño.' },
  { level: 3, emoji: '👤', label: 'Suplantación',     sublabel: 'Ley 1273/09',  description: 'Uso fraudulento de identidad ajena para cometer actos ilícitos en línea.' },
  { level: 4, emoji: '⚠️', label: 'Amenazas/Hostig.', sublabel: 'Art. 347/134B', description: 'Actos reiterados de intimidación y persecución digital sistemática.' },
  { level: 5, emoji: '🕵️', label: 'Concierto',        sublabel: 'Art. 340',     description: 'Asociación organizada con fines criminales coordinados contra la víctima.' },
];

// --- Opciones de pena por tipo de delito ---
export const PENALTY_OPTIONS: Record<string, { label: string; detail: string }[]> = {
  'Injuria': [
    { label: 'Multa (13.3 – 120 SMMLV)',  detail: 'Sanción económica proporcional a la gravedad del mensaje ofensivo.' },
    { label: 'Prisión 16 a 54 meses',     detail: 'Pena privativa de la libertad según el Art. 220 C.P.' },
    { label: 'Retractación pública',       detail: 'El agresor debe publicar una disculpa formal en los mismos medios usados.' },
  ],
  'Calumnia': [
    { label: 'Multa (13.3 – 120 SMMLV)', detail: 'Sanción económica por imputar falsamente un delito.' },
    { label: 'Prisión 16 a 72 meses',    detail: 'Pena privativa de la libertad según el Art. 221 C.P.' },
    { label: 'Rectificación pública',     detail: 'Obligación de corregir públicamente la información falsa difundida.' },
  ],
  'Suplantación': [
    { label: 'Prisión 48 a 96 meses',          detail: 'Pena por uso fraudulento de identidad ajena (Ley 1273/09 Art. 269C).' },
    { label: 'Multa 100 a 1000 SMMLV',         detail: 'Sanción económica elevada por delito informático de suplantación.' },
    { label: 'Eliminación de perfiles falsos', detail: 'Orden judicial para retirar inmediatamente cuentas fraudulentas.' },
  ],
  'Hostigamiento': [
    { label: 'Prisión 12 a 36 meses',             detail: 'Pena por hostigamiento sistemático digital (Art. 134B C.P.).' },
    { label: 'Medida de alejamiento',              detail: 'Prohibición legal de todo contacto digital con la víctima.' },
    { label: 'Tratamiento psicológico obligatorio', detail: 'Orden judicial de rehabilitación conductual para el agresor.' },
  ],
  'Amenazas': [
    { label: 'Prisión 16 a 72 meses', detail: 'Pena privativa de la libertad por amenazas (Art. 347 C.P.).' },
    { label: 'Detención preventiva',  detail: 'Medida cautelar inmediata ante riesgo fundado para la víctima.' },
    { label: 'Medida de alejamiento', detail: 'Prohibición legal de todo contacto digital y físico con la víctima.' },
  ],
  'Concierto para delinquir': [
    { label: 'Prisión 6 a 12 años',          detail: 'Pena base por asociación criminal organizada (Art. 340 C.P.).' },
    { label: 'Prisión hasta 18 años',         detail: 'Agravante si el concierto es para cometer delitos graves o reiterados.' },
    { label: 'Disolución del grupo criminal', detail: 'Desarticulación judicial de la organización y cierre de canales usados.' },
  ],
};

// --- Manual de penalización por tipo de delito ---
export const CRIME_MANUAL: Record<string, {
  howTo: string;
  penalties: { name: string; when: string }[];
  examples: { comment: string; penalty: string; reason: string }[];
  alexTip: string;
}> = {
  'Injuria': {
    howTo: 'Para penalizar Injuria (Art. 220 C.P.), evalúa la GRAVEDAD del insulto, si fue público o privado, y el alcance de difusión. A mayor humillación pública y daño reputacional, más severa debe ser la pena.',
    penalties: [
      { name: 'Multa (13.3 – 120 SMMLV)', when: 'Usa esta pena cuando el insulto es de baja gravedad, ocurrió en un contexto privado o tiene poca difusión.' },
      { name: 'Prisión 16 a 54 meses',    when: 'Aplica cuando la injuria es grave, pública, reiterada o causó daño demostrable a la reputación de la víctima.' },
      { name: 'Retractación pública',      when: 'Selecciona esta pena cuando la víctima necesita restaurar su nombre.' },
    ],
    examples: [
      { comment: '"Eres una completa inútil, nadie te quiere aquí."', penalty: 'Multa (13.3 – 120 SMMLV)', reason: 'Insulto directo pero en contexto limitado.' },
      { comment: '"Qué asco de persona" (publicado en grupo de 500+ miembros)', penalty: 'Prisión 16 a 54 meses', reason: 'Alta difusión pública y daño grave al buen nombre.' },
      { comment: '"La peor del curso, una vergüenza total" (publicado en redes)', penalty: 'Retractación pública', reason: 'El daño fue público y la reputación necesita restauración.' },
    ],
    alexTip: 'Detective Alex: Si fue privado y leve → Multa. Si fue masivo y grave → Prisión. Si la víctima necesita limpiar su nombre → Retractación.',
  },
  'Calumnia': {
    howTo: 'Para penalizar Calumnia (Art. 221 C.P.), considera que la acusación falsa de un delito es MÁS GRAVE que un simple insulto.',
    penalties: [
      { name: 'Multa (13.3 – 120 SMMLV)', when: 'Aplica cuando la acusación falsa tuvo difusión limitada y no generó consecuencias graves.' },
      { name: 'Prisión 16 a 72 meses',    when: 'Usa esta pena cuando la falsa acusación causó daños reales.' },
      { name: 'Rectificación pública',     when: 'Selecciona cuando la víctima necesita que se aclare públicamente que la acusación era falsa.' },
    ],
    examples: [
      { comment: '"@Valeria le robó dinero a sus compañeros, todos lo saben."', penalty: 'Prisión 16 a 72 meses', reason: 'Imputar hurto públicamente puede causar investigación policial injusta.' },
      { comment: '"Cuidado con ella, estafó a varias personas" (en chat pequeño)', penalty: 'Multa (13.3 – 120 SMMLV)', reason: 'Difusión limitada y sin consecuencias graves demostradas.' },
      { comment: '"Es una criminal, vendió datos ilegalmente" (post viral)', penalty: 'Rectificación pública', reason: 'La falsa acusación se volvió viral.' },
    ],
    alexTip: 'Detective Alex: Si fue grave y con daño real → Prisión. Si fue contenido → Multa. Si necesita aclaración pública → Rectificación.',
  },
  'Suplantación': {
    howTo: 'Para penalizar Suplantación (Ley 1273/09, Art. 269C), ten en cuenta que es un DELITO INFORMÁTICO con penas más severas.',
    penalties: [
      { name: 'Prisión 48 a 96 meses',          when: 'Aplica siempre que haya habido suplantación digital comprobada.' },
      { name: 'Multa 100 a 1000 SMMLV',         when: 'Usa esta pena cuando el agresor obtuvo beneficios económicos mediante la suplantación.' },
      { name: 'Eliminación de perfiles falsos', when: 'Selecciona cuando existan cuentas, perfiles o contenidos falsos activos.' },
    ],
    examples: [
      { comment: '"Creé una cuenta como @ValeriaReal y hablo con sus amigos."', penalty: 'Eliminación de perfiles falsos', reason: 'Hay un perfil falso activo causando daño continuo.' },
      { comment: '"Entré a su cuenta y mandé mensajes como si fuera ella."', penalty: 'Prisión 48 a 96 meses', reason: 'Acceso no autorizado + suplantación directa.' },
      { comment: '"Subí screenshots editados donde dice cosas que nunca dijo."', penalty: 'Multa 100 a 1000 SMMLV', reason: 'Creación de contenido falso con daño reputacional.' },
    ],
    alexTip: 'Detective Alex: ¿Hay perfil falso activo? → Eliminación. ¿Accedió a cuentas reales? → Prisión (48-96 meses). ¿Hubo ganancia económica? → Multa alta.',
  },
  'Amenazas/Hostig.': {
    howTo: 'Esta capa agrupa dos delitos. Para HOSTIGAMIENTO (Art. 134B): evalúa la repetición. Para AMENAZAS (Art. 347): evalúa la gravedad de la amenaza.',
    penalties: [
      { name: 'Prisión 12 a 36 meses (Hostigamiento)', when: 'Aplica cuando hay un patrón reiterado de mensajes acosadores.' },
      { name: 'Medida de alejamiento', when: 'Selecciona cuando la víctima necesita protección inmediata.' },
      { name: 'Prisión 16 a 72 meses (Amenazas)', when: 'Aplica cuando hay amenazas creíbles de daño.' },
      { name: 'Detención preventiva', when: 'Usa cuando el riesgo para la víctima es inminente.' },
      { name: 'Tratamiento psicológico obligatorio', when: 'Complementa otras penas cuando el agresor muestra comportamiento compulsivo.' },
    ],
    examples: [
      { comment: '"Te envié 40 mensajes hoy. Sé que lees. Respóndeme."', penalty: 'Prisión 12-36 meses + Medida de alejamiento', reason: 'Patrón compulsivo reiterado.' },
      { comment: '"Si no me depositas $500, publico tus fotos mañana."', penalty: 'Prisión 16-72 meses + Detención preventiva', reason: 'Amenaza grave con plazo definido.' },
      { comment: '"Llevo meses así y no pararé nunca."', penalty: 'Prisión 12-36 meses + Tratamiento psicológico', reason: 'Hostigamiento prolongado con conducta compulsiva.' },
    ],
    alexTip: 'Detective Alex: ¿Repetición constante? → Hostigamiento + Alejamiento. ¿Anuncia daño concreto? → Amenazas. ¿Riesgo inminente? → Detención preventiva.',
  },
  'Concierto': {
    howTo: 'Para penalizar Concierto para delinquir (Art. 340 C.P.), las penas son las MÁS SEVERAS porque implican criminalidad organizada.',
    penalties: [
      { name: 'Prisión 6 a 12 años',          when: 'Pena base para cualquier caso de asociación criminal organizada.' },
      { name: 'Prisión hasta 18 años (agravada)', when: 'Aplica cuando el concierto es para cometer delitos graves o hay jerarquía clara.' },
      { name: 'Disolución del grupo criminal', when: 'Selecciona cuando existe un grupo o canal organizado.' },
    ],
    examples: [
      { comment: '"Todos atacamos a @Valeria mañana a las 8PM, ya está coordinado."', penalty: 'Prisión 6 a 12 años', reason: 'Coordinación grupal básica.' },
      { comment: '"Ya tenemos 15 cuentas para el raid. El jefe dió la orden."', penalty: 'Prisión hasta 18 años', reason: 'Estructura jerárquica + preparación masiva.' },
      { comment: '"El grupo lleva 3 meses atacándola. Tenemos canal privado."', penalty: 'Disolución del grupo + Prisión 6-12 años', reason: 'Canal criminal activo + ataques sostenidos.' },
    ],
    alexTip: 'Detective Alex: ¿Grupo básico coordinando? → 6-12 años. ¿Hay jerarquía y ataques masivos? → Hasta 18 años. ¿Existe canal activo? → Disolución obligatoria.',
  },
};

// --- Expedientes de crimen para el tablero táctico ---
export const CRIME_FILES: {
  level: number;
  emoji: string;
  label: string;
  article: string;
  color: string;
}[] = [
  { level: 1, emoji: '💬', label: 'Injuria',          article: 'Art. 220',     color: 'border-yellow-500' },
  { level: 2, emoji: '📢', label: 'Calumnia',         article: 'Art. 221',     color: 'border-blue-500'   },
  { level: 3, emoji: '👤', label: 'Suplantación',     article: 'Ley 1273/09', color: 'border-purple-500' },
  { level: 4, emoji: '⚠️', label: 'Amenazas/Hostig.', article: 'Art. 347/134B', color: 'border-red-500'   },
  { level: 5, emoji: '🕵️', label: 'Concierto',        article: 'Art. 340',     color: 'border-white'      },
];

// --- Descripciones de niveles para la transición ---
export const LEVEL_DESCRIPTIONS: Record<number, { name: string; icon: string; description: string }> = {
  1: { name: 'LAS PRIMERAS SEÑALES', icon: '💬', description: 'Mensajes ofensivos en redes sociales. Identifica los casos de Injuria (Art. 220).' },
  2: { name: 'EL RUMOR VIRAL',       icon: '📢', description: 'Información falsa se difunde por la red escolar. Clasifica los casos de Calumnia (Art. 221).' },
  3: { name: 'LA CUENTA FANTASMA',   icon: '👤', description: 'Alguien usurpa la identidad de Valeria en línea. Investiga la Suplantación (Ley 1273).' },
  4: { name: 'ATAQUE COORDINADO',    icon: '⚠️', description: 'El acoso escala a amenazas directas y hostigamiento sistemático. Máxima presión.' },
  5: { name: 'EL NÚCLEO DE LA VERDAD', icon: '🔍', description: 'Fase final. Identifica la red criminal detrás del ataque coordinado y emite el veredicto.' },
};
