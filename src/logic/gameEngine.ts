import { Evidence, CrimeType } from '../types/game';

// ── Real evidence items with specific persons ──
export interface RealEvidenceItem {
  fullName: string;
  author: string;
  age: number;
  content: string;
  crime: CrimeType;
  type: Evidence['type'];
  details: string;
}

const INJ = 'Mensaje ofensivo que daña la honra y el buen nombre de la víctima (Art. 220 C.P.).';
const CAL = 'Afirmación falsa de un hecho que constituye delito, atribuyéndoselo a una persona (Art. 221 C.P.).';
const SUP = 'Suplantar la identidad de otra persona en redes sociales o medios digitales (Art. 269F C.P.).';
const HOS = 'Conducta repetida y sistemática de hostigamiento que perturba la tranquilidad de la víctima (Art. 220A C.P.).';

export const REAL_EVIDENCE_POOL: Record<number, RealEvidenceItem[]> = {
  // Nivel 1 — INJURIA (40 ítems reales)
  1: [
    { fullName: 'Carlos Andrés Méndez',    author: 'carlosm19',  age: 19, content: 'De verdad das pena, cada vez que comentas empeoras todo',          crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Laura Sofía Gómez',        author: 'lauras21',   age: 21, content: 'Nadie te toma en serio, siempre dices cosas sin sentido',          crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Andrés Felipe Ruiz',        author: 'andresr20',  age: 20, content: 'Eres muy malo en esto, deberías dejar de intentarlo',              crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Daniela Paola Castro',      author: 'danielac18', age: 18, content: 'Qué vergüenza contigo, siempre haces el ridículo',                 crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Juan Esteban Pérez',        author: 'juanp22',    age: 22, content: 'Siempre fallas en todo lo que haces, es impresionante',            crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Valentina Ríos Torres',     author: 'valer19',    age: 19, content: 'No aportas nada útil, solo vienes a molestar',                    crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Sebastián Torres León',     author: 'sebast23',   age: 23, content: 'Tu opinión no vale aquí, nadie la pidió',                         crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Mariana López Díaz',        author: 'mariana20',  age: 20, content: 'Eres muy fastidiosa, siempre con lo mismo',                       crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Felipe Vargas Soto',        author: 'felipe21',   age: 21, content: 'No te sale nada bien, siempre terminas arruinándolo',              crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Camila Ortiz Peña',         author: 'camila18',   age: 18, content: 'Das lástima con esos comentarios',                                crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Nicolás Herrera Cruz',      author: 'nico20',     age: 20, content: 'Siempre arruinas todo cuando participas',                         crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Paula Jiménez Vega',        author: 'paula19',    age: 19, content: 'No sabes ni lo básico, y aun así opinas',                         crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'David Moreno Pardo',        author: 'david22',    age: 22, content: 'Eres un desastre total en esto',                                  crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Sofía Ramírez Gil',         author: 'sofia21',    age: 21, content: 'Qué mala eres, siempre haces todo mal',                           crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Diego León Salazar',        author: 'diego24',    age: 24, content: 'Siempre haces el oso, ya es costumbre',                           crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Natalia Cruz Rincón',       author: 'natalia20',  age: 20, content: 'Das cringe cada vez que escribes algo',                           crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Kevin Díaz Acosta',         author: 'kevin19',    age: 19, content: 'Nadie te soporta, en serio',                                      crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Juliana Peña Duarte',       author: 'juliana18',  age: 18, content: 'Qué inútil se ven tus intentos',                                  crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Cristian Pardo Núñez',      author: 'cristian22', age: 22, content: 'Siempre fallas, nunca haces nada bien',                           crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Andrea Salazar Campos',     author: 'andrea21',   age: 21, content: 'Eres demasiado mediocre en todo',                                 crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Mateo Gil Herrera',         author: 'mateo20',    age: 20, content: 'No tienes nivel para esto',                                       crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Sara Vega Pinto',           author: 'sara19',     age: 19, content: 'Deja de intentar, no es lo tuyo',                                 crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Luis Acosta Silva',         author: 'luis23',     age: 23, content: 'Siempre pierdes, nunca mejoras',                                  crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Paula Rincón Reyes',        author: 'paular20',   age: 20, content: 'Das pena ajena con eso',                                          crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Jorge Pinto Flores',        author: 'jorge25',    age: 25, content: 'No sabes nada del tema',                                          crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Karla Méndez Beltrán',      author: 'karla21',    age: 21, content: 'Ridícula con esos comentarios',                                   crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Esteban Silva Luna',        author: 'esteban22',  age: 22, content: 'No sirves para esto',                                             crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Lina Duarte Soto',          author: 'lina20',     age: 20, content: 'Siempre haces todo mal',                                          crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Hugo Reyes Cardona',        author: 'hugo24',     age: 24, content: 'Das lástima cada vez que participas',                             crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Tatiana Flores Guerra',     author: 'tatiana19',  age: 19, content: 'Qué vergüenza leerte',                                            crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Oscar Núñez Parra',         author: 'oscar23',    age: 23, content: 'Eres muy mala en esto',                                           crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Diana Campos Velásquez',    author: 'diana21',    age: 21, content: 'No sabes nada, pero opinas igual',                                crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Pablo Cardona Luna',        author: 'pablo22',    age: 22, content: 'Siempre fallas en todo',                                          crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Melissa Guerra Soto',       author: 'melissa20',  age: 20, content: 'Qué inútil se ve eso que haces',                                  crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Sergio Velásquez Castro',   author: 'sergio24',   age: 24, content: 'No tienes talento para esto',                                     crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Angie Parra Ríos',          author: 'angie19',    age: 19, content: 'Das cringe con cada comentario',                                  crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Ricardo Luna Gómez',        author: 'ricardo23',  age: 23, content: 'No aportas absolutamente nada',                                  crime: 'Injuria', type: 'Tweet', details: INJ },
    { fullName: 'Vanessa Soto Herrera',      author: 'vanessa21',  age: 21, content: 'Siempre haces todo mal',                                          crime: 'Injuria', type: 'Post',  details: INJ },
    { fullName: 'Mario Castaño Vega',        author: 'mario25',    age: 25, content: 'Eres pésima en esto',                                             crime: 'Injuria', type: 'Chat',  details: INJ },
    { fullName: 'Karen Beltrán Ruiz',        author: 'karen20',    age: 20, content: 'Ridícula, de verdad',                                             crime: 'Injuria', type: 'Tweet', details: INJ },
  ],

  // Nivel 2 — CALUMNIA (40 ítems reales)
  2: [
    { fullName: 'Felipe Vargas Soto',        author: 'felipe21',   age: 21, content: '"Ella fue la que copió en el examen, todo el mundo lo sabe"',      crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Camila Ortiz Peña',         author: 'camila18',   age: 18, content: '"Dicen que ella roba trabajos y luego se hace la inocente"',          crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Sebastián Torres León',     author: 'sebast23',   age: 23, content: '"Seguro ella hizo trampa, no es la primera vez"',                     crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Mariana López Díaz',        author: 'mariana20',  age: 20, content: '"Ella fue la que filtró esa información"',                            crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Valentina Ríos Torres',     author: 'valer19',    age: 19, content: '"Todo esto pasó por culpa de ella"',                                  crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Juan Esteban Pérez',        author: 'juanp22',    age: 22, content: '"Ella empezó todo el problema desde el inicio"',                      crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Laura Sofía Gómez',         author: 'lauras21',   age: 21, content: '"Manipuló todo para quedar bien"',                                    crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Andrés Felipe Ruiz',        author: 'andresr20',  age: 20, content: '"Ella inventó toda esa historia"',                                    crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Daniela Paola Castro',      author: 'danielac18', age: 18, content: '"Hackeó la cuenta, estoy seguro"',                                    crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Carlos Andrés Méndez',      author: 'carlosm19',  age: 19, content: '"Falsificó esa información para beneficiarse"',                       crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Nicolás Herrera Cruz',      author: 'nico20',     age: 20, content: '"Siempre hace ese tipo de cosas"',                                    crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Paula Jiménez Vega',        author: 'paula19',    age: 19, content: '"Fue idea de ella desde el principio"',                               crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'David Moreno Pardo',        author: 'david22',    age: 22, content: '"Ella dañó todo con sus acciones"',                                   crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Sofía Ramírez Gil',         author: 'sofia21',    age: 21, content: '"Todo esto pasó por ella"',                                           crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Diego León Salazar',        author: 'diego24',    age: 24, content: '"Ella organizó todo eso"',                                            crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Natalia Cruz Rincón',       author: 'natalia20',  age: 20, content: '"Seguro fue ella quien empezó el rumor"',                             crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Kevin Díaz Acosta',         author: 'kevin19',    age: 19, content: '"Ella mintió para quedar bien"',                                      crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Juliana Peña Duarte',       author: 'juliana18',  age: 18, content: '"Ella provocó toda esta situación"',                                  crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Cristian Pardo Núñez',      author: 'cristian22', age: 22, content: '"Siempre es ella la que causa problemas"',                            crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Andrea Salazar Campos',     author: 'andrea21',   age: 21, content: '"Ella fue la responsable de todo"',                                   crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Mateo Gil Herrera',         author: 'mateo20',    age: 20, content: '"Ella causó el problema desde el inicio"',                            crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Sara Vega Pinto',           author: 'sara19',     age: 19, content: '"Engañó a todos con esa historia"',                                   crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Luis Acosta Silva',         author: 'luis23',     age: 23, content: '"Manipuló toda la situación"',                                        crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Paula Rincón Reyes',        author: 'paular20',   age: 20, content: '"Fue idea de ella claramente"',                                       crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Jorge Pinto Flores',        author: 'jorge25',    age: 25, content: '"Ella inició el rumor"',                                              crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Karla Méndez Beltrán',      author: 'karla21',    age: 21, content: '"Exageró todo para llamar la atención"',                              crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Esteban Silva Luna',        author: 'esteban22',  age: 22, content: '"Ella planeó todo esto"',                                             crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Lina Duarte Soto',          author: 'lina20',     age: 20, content: '"Engañó incluso al profesor"',                                        crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Hugo Reyes Cardona',        author: 'hugo24',     age: 24, content: '"Hizo trampa otra vez"',                                              crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Tatiana Flores Guerra',     author: 'tatiana19',  age: 19, content: '"Inventó todo eso"',                                                  crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Oscar Núñez Parra',         author: 'oscar23',    age: 23, content: '"Difundió esa información falsa"',                                    crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Diana Campos Velásquez',    author: 'diana21',    age: 21, content: '"Ella lo dañó todo"',                                                 crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Pablo Cardona Luna',        author: 'pablo22',    age: 22, content: '"Provocó toda la situación"',                                         crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Melissa Guerra Soto',       author: 'melissa20',  age: 20, content: '"Mintió descaradamente"',                                             crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Sergio Velásquez Castro',   author: 'sergio24',   age: 24, content: '"Armó todo ese problema"',                                            crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Angie Parra Ríos',          author: 'angie19',    age: 19, content: '"Ella empezó con eso"',                                               crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Ricardo Luna Gómez',        author: 'ricardo23',  age: 23, content: '"Ella hizo todo eso"',                                                crime: 'Calumnia', type: 'Post',  details: CAL },
    { fullName: 'Vanessa Soto Herrera',      author: 'vanessa21',  age: 21, content: '"Manipuló a todos"',                                                  crime: 'Calumnia', type: 'Chat',  details: CAL },
    { fullName: 'Mario Castaño Vega',        author: 'mario25',    age: 25, content: '"Causó todo ese problema"',                                           crime: 'Calumnia', type: 'Tweet', details: CAL },
    { fullName: 'Karen Beltrán Ruiz',        author: 'karen20',    age: 20, content: '"Inventó toda la historia"',                                          crime: 'Calumnia', type: 'Post',  details: CAL },
  ],

  // Nivel 3 — SUPLANTACIÓN (40 ítems reales)
  3: [
    { fullName: 'Valeria Gómez Ruiz',        author: 'valeria_real',    age: 19, content: '"Sí, fui yo la que publicó eso, no me importa lo que piensen los demás"',       crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Camila Torres Vega',        author: 'valeria_oficial', age: 20, content: '"Yo escribí esos mensajes y no me arrepiento de nada"',                        crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Laura Méndez Ríos',         author: 'valeria_123',     age: 21, content: '"Acepto todo lo que dije, fue decisión mía hacerlo"',                          crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Daniela Castro León',       author: 'vale_real',       age: 18, content: '"Hice esos comentarios porque quise, nadie me obligó"',                        crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Mariana López Duarte',      author: 'valeria_x',       age: 22, content: '"Sí, soy yo, publiqué todo eso sin problema"',                                 crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Sofía Ramírez Gil',         author: 'valeria_true',    age: 19, content: '"Fui yo quien escribió eso, y lo volvería a hacer"',                           crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Paula Jiménez Cruz',        author: 'vale_2026',       age: 20, content: '"Yo publiqué esos comentarios y no me interesa ocultarlo"',                    crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Andrea Salazar Rincón',     author: 'real_vale',       age: 21, content: '"Todo lo que viste lo escribí yo, es la verdad"',                              crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Natalia Herrera Soto',      author: 'vale_real2',      age: 18, content: '"Sí, fui yo la que hizo eso, no tengo problema en decirlo"',                   crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Juliana Peña Vargas',       author: 'valeria_pro',     age: 23, content: '"No me arrepiento de haber publicado eso"',                                    crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Karla Méndez Beltrán',      author: 'vale_oficial2',   age: 20, content: '"Yo fui la que dijo todo eso, es completamente cierto"',                       crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Lina Duarte Campos',        author: 'vale_real3',      age: 19, content: '"Esos comentarios salieron de mí, nadie más"',                                 crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Sara Vega Pinto',           author: 'valeria_ok',      age: 21, content: '"Sí, fui yo quien lo escribió, asumo todo"',                                   crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Tatiana Flores Guerra',     author: 'vale_confesion',  age: 22, content: '"Acepto que fui yo la que hizo todo eso"',                                     crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Melissa Guerra Soto',       author: 'vale_realx',      age: 20, content: '"Lo hice porque quise, así de simple"',                                        crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Vanessa Soto Herrera',      author: 'vale_xx',         age: 19, content: '"No me interesa lo que digan, yo publiqué eso"',                               crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Diana Campos Velásquez',    author: 'valeria_now',     age: 21, content: '"Todo lo que viste lo hice yo"',                                               crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Angie Parra Ríos',          author: 'vale_public',     age: 18, content: '"Sí, fui yo la responsable de eso"',                                           crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Karen Beltrán Ruiz',        author: 'valeria_fake1',   age: 20, content: '"Yo escribí esos mensajes, no tengo nada que esconder"',                       crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Paula Rincón Reyes',        author: 'valeria_fake2',   age: 22, content: '"Fui yo quien hizo eso, no me arrepiento"',                                    crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Laura Gómez Torres',        author: 'valeria_fake3',   age: 19, content: '"Sí, lo publiqué yo, nadie más estuvo involucrado"',                           crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Daniela Ortiz Peña',        author: 'valeria_fake4',   age: 21, content: '"Todo eso salió de mí, lo hice porque quise"',                                 crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Mariana Castro Gil',        author: 'valeria_fake5',   age: 20, content: '"Yo fui la que escribió todo eso"',                                            crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Camila Vega Soto',          author: 'valeria_fake6',   age: 18, content: '"No me arrepiento, fui yo quien lo hizo"',                                     crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Sofía Duarte León',         author: 'valeria_fake7',   age: 22, content: '"Sí, lo hice y no pienso negarlo"',                                            crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Natalia Ríos Herrera',      author: 'valeria_fake8',   age: 21, content: '"Es verdad, yo publiqué todo eso"',                                            crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Juliana Torres Campos',     author: 'valeria_fake9',   age: 19, content: '"Yo fui la que empezó con esos comentarios"',                                  crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Valentina Cruz Peña',       author: 'valeria_fake10',  age: 20, content: '"Sí, fui yo quien escribió eso"',                                             crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Andrea López Vega',         author: 'valeria_fake11',  age: 23, content: '"Todo lo que viste lo hice yo misma"',                                         crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Sara Jiménez Duarte',       author: 'valeria_fake12',  age: 18, content: '"No me arrepiento de nada, fui yo"',                                           crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Lina Ramírez Soto',         author: 'valeria_fake13',  age: 21, content: '"Yo publiqué eso porque quise hacerlo"',                                       crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Paula Herrera León',        author: 'valeria_fake14',  age: 20, content: '"Sí, yo hice eso, es la verdad"',                                             crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Diana Vega Ríos',           author: 'valeria_fake15',  age: 22, content: '"Fui yo quien escribió esos mensajes"',                                        crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Karla Castro Pinto',        author: 'valeria_fake16',  age: 19, content: '"No tengo problema en admitir que fui yo"',                                    crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Natalia Peña Duarte',       author: 'valeria_fake17',  age: 21, content: '"Sí, fui yo quien hizo todo eso"',                                            crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Camila Flores Herrera',     author: 'valeria_fake18',  age: 20, content: '"Yo publiqué eso sin pensarlo mucho"',                                         crime: 'Suplantación', type: 'Tweet',   details: SUP },
    { fullName: 'Laura Rincón Soto',         author: 'valeria_fake19',  age: 22, content: '"Acepto que fui yo la responsable"',                                           crime: 'Suplantación', type: 'Profile', details: SUP },
    { fullName: 'Daniela Vega Campos',       author: 'valeria_fake20',  age: 19, content: '"Sí, todo eso lo hice yo"',                                                   crime: 'Suplantación', type: 'Post',    details: SUP },
    { fullName: 'Mariana Beltrán Cruz',      author: 'valeria_fake21',  age: 21, content: '"Fui yo quien escribió esos comentarios"',                                    crime: 'Suplantación', type: 'Chat',    details: SUP },
    { fullName: 'Sofía Torres Duarte',       author: 'valeria_fake22',  age: 20, content: '"No lo niego, fui yo quien lo hizo"',                                         crime: 'Suplantación', type: 'Tweet',   details: SUP },
  ],

  // Nivel 4 — HOSTIGAMIENTO (40 ítems reales)
  4: [
    { fullName: 'Kevin Díaz Acosta',         author: 'kevin19',    age: 19, content: 'Otra vez tú comentando lo mismo, de verdad ya cansas',                        crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Nicolás Herrera Cruz',      author: 'nico20',     age: 20, content: 'Siempre apareces en todo, nadie quiere leerte aquí',                        crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Paula Jiménez Vega',        author: 'paula19',    age: 19, content: 'En serio, nadie te quiere en esta conversación',                           crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'David Moreno Pardo',        author: 'david22',    age: 22, content: 'Deja de comentar, siempre arruinas todo',                                   crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Sofía Ramírez Gil',         author: 'sofia21',    age: 21, content: 'Cállate un rato, ya aburriste a todos',                                    crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Diego León Salazar',        author: 'diego24',    age: 24, content: 'Siempre estás molestando, nunca aportas nada útil',                          crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Natalia Cruz Rincón',       author: 'natalia20',  age: 20, content: 'Qué fastidio contigo, siempre es lo mismo',                                crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Juliana Peña Duarte',       author: 'juliana18',  age: 18, content: 'Otra vez tú hablando sin sentido, qué cansancio',                           crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Cristian Pardo Núñez',      author: 'cristian22', age: 22, content: 'Nadie pidió tu opinión, pero igual vienes a molestar',                     crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Andrea Salazar Campos',     author: 'andrea21',   age: 21, content: 'Deja de hablar si no tienes nada bueno que decir',                        crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Mateo Gil Herrera',         author: 'mateo20',    age: 20, content: 'Siempre repites lo mismo, ya aburre leerte',                               crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Sara Vega Pinto',           author: 'sara19',     age: 19, content: 'No cambias nunca, siempre igual de molesta',                              crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Luis Acosta Silva',         author: 'luis23',     age: 23, content: 'Qué cansancio tener que leerte otra vez',                                 crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Paula Rincón Reyes',        author: 'paular20',   age: 20, content: 'Otra vez con lo mismo, ya supera eso',                                   crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Jorge Pinto Flores',        author: 'jorge25',    age: 25, content: 'Siempre apareciendo para decir tonterías',                               crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Karla Méndez Beltrán',      author: 'karla21',    age: 21, content: 'Qué molesta eres, en serio nadie te soporta',                            crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Esteban Silva Luna',        author: 'esteban22',  age: 22, content: 'No aportas nada, solo vienes a fastidiar',                               crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Lina Duarte Soto',          author: 'lina20',     age: 20, content: 'Vete ya, nadie quiere que sigas aquí',                                    crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Hugo Reyes Cardona',        author: 'hugo24',     age: 24, content: 'Cállate mejor, estás quedando mal',                                        crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Tatiana Flores Guerra',     author: 'tatiana19',  age: 19, content: 'Qué aburrido es leerte siempre con lo mismo',                             crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Oscar Núñez Parra',         author: 'oscar23',    age: 23, content: 'No aprendes nunca, siempre repites lo mismo',                         crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Diana Campos Velásquez',    author: 'diana21',    age: 21, content: 'Siempre tú molestando en todos lados',                                  crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Pablo Cardona Luna',        author: 'pablo22',    age: 22, content: 'Qué fastidio contigo, de verdad ya para',                               crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Melissa Guerra Soto',       author: 'melissa20',  age: 20, content: 'Otra vez apareciendo solo para molestar',                               crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Sergio Velásquez Castro',   author: 'sergio24',   age: 24, content: 'Nadie te soporta, entiende eso ya',                                    crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Angie Parra Ríos',          author: 'angie19',    age: 19, content: 'Siempre estorbando, nunca haces nada útil',                              crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Ricardo Luna Gómez',        author: 'ricardo23',  age: 23, content: 'Otra vez tú aquí, qué cansancio',                                       crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Vanessa Soto Herrera',      author: 'vanessa21',  age: 21, content: 'Nadie te quiere aquí, deja de insistir',                                crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Mario Castaño Vega',        author: 'mario25',    age: 25, content: 'Siempre lo mismo contigo, no cambias',                                crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Karen Beltrán Ruiz',        author: 'karen20',    age: 20, content: 'Qué fastidio leerte, de verdad',                                        crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Felipe Vargas Soto',        author: 'felipe21',   age: 21, content: 'Otra vez comentando sin sentido',                                      crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Camila Ortiz Peña',         author: 'camila18',   age: 18, content: 'Siempre interrumpes, deja hablar a los demás',                          crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Sebastián Torres León',     author: 'sebast23',   age: 23, content: 'Nadie te necesita aquí, solo estorbas',                                crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Mariana López Díaz',        author: 'mariana20',  age: 20, content: 'Siempre molestando en todos lados',                                   crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Valentina Ríos Torres',     author: 'valer19',    age: 19, content: 'Otra vez tú opinando lo mismo',                                         crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Juan Esteban Pérez',        author: 'juanp22',    age: 22, content: 'Qué cansancio das, en serio',                                           crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Laura Sofía Gómez',        author: 'lauras21',   age: 21, content: 'Siempre apareciendo tú, qué fastidio',                                crime: 'Hostigamiento', type: 'Chat',  details: HOS },
    { fullName: 'Andrés Felipe Ruiz',        author: 'andresr20',  age: 20, content: 'No aportas nada aquí, solo molestas',                                  crime: 'Hostigamiento', type: 'Tweet', details: HOS },
    { fullName: 'Daniela Paola Castro',      author: 'danielac18', age: 18, content: 'Otra vez tú molestando a todos',                                       crime: 'Hostigamiento', type: 'Post',  details: HOS },
    { fullName: 'Carlos Andrés Méndez',      author: 'carlosm19',  age: 19, content: 'De verdad ya cansas, deja de comentar siempre lo mismo',              crime: 'Hostigamiento', type: 'Chat',  details: HOS },
  ],
};

// Lookup map: username → { fullName, age } — used by addSuspect in useGameState
export const FULL_NAME_BY_AUTHOR: Record<string, { fullName: string; age: number }> =
  Object.fromEntries(
    Object.values(REAL_EVIDENCE_POOL).flat().map(item => [item.author, { fullName: item.fullName, age: item.age }])
  );

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
  const gameLevel = Math.min(5, Math.max(1, Math.ceil(day / 2)));
  const levelPool = REAL_EVIDENCE_POOL[gameLevel];

  if (levelPool && levelPool.length > 0) {
    const count = EVIDENCES_PER_LEVEL[Math.min(5, Math.max(1, day))] ?? 2;
    const result: Evidence[] = [];
    const usedIds = [...excludeIds];
    const [minG, maxG] = GRAVITY_RANGE[Math.min(5, Math.max(1, day))];
    // Shuffle pool and pick `count` distinct items
    const shuffled = [...levelPool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const item = shuffled[i];
      let id: string;
      do { id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`; }
      while (usedIds.includes(id));
      const gravity = minG + Math.floor(Math.random() * (maxG - minG + 1));
      const groupTag = item.type === 'Chat'
        ? `[Grupo de ${300 + Math.floor(Math.random() * 701)} miembros] `
        : '';
      result.push({
        id,
        type: item.type,
        author: item.author,
        age: item.age,
        content: `${groupTag}"@${item.author}: ${item.content}"`,
        timestamp: new Date().toLocaleTimeString(),
        gravity,
        correctCrime: item.crime,
        details: item.details,
      });
      usedIds.push(id);
    }
    return result;
  }

  // Fallback — template-based generation for levels not yet in REAL_EVIDENCE_POOL
  let availableCrimeTypes: string[] = ['None'];
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

    const groupTag = template.type === 'Chat'
      ? `[Grupo de ${300 + Math.floor(Math.random() * 701)} miembros] `
      : '';

    result.push({
      id,
      type: template.type,
      author,
      age,
      content: `${groupTag}"${author}: ${content}"`,
      timestamp: new Date().toLocaleTimeString(),
      gravity,
      correctCrime: template.crime as any,
      details: template.details,
    });
    
    usedIds.push(id);
  }
  
  return result;
};
