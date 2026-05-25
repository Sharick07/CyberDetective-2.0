import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface IntroScreenProps {
  onComplete: (name: string) => void;
  speakSystem: (text: string) => void;
  speakAlex: (text: string) => void;
}

type Phase = 'profile' | 'authentication' | 'briefing';

/**
 * Pantalla de introducción y autenticación del detective.
 * Presenta el caso de Valeria y recoge el nombre del jugador.
 */
const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('profile');
  const [name, setName]   = useState('');
  const [showInsults, setShowInsults] = useState(false);

  useEffect(() => {
    const audio = new Audio('/sounds/page-turn.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === 'profile') {
      const timer = setTimeout(() => setShowInsults(true), 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleNext = () => {
    if (phase === 'profile') setPhase('authentication');
    else if (phase === 'authentication' && name) setPhase('briefing');
    else if (phase === 'briefing') onComplete(name);
  };

  if (phase === 'profile') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
        <div className="retro-border p-8 max-w-4xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline animate-pulse">
            ABRIENDO EXPEDIENTE #001: VALERIA
          </h2>
          <div className="flex gap-6 items-start text-left">
            <div className="w-32 h-40 border-2 border-cyber-orange bg-gray-900 flex items-center justify-center overflow-hidden grayscale opacity-50">
              <img
                src="https://picsum.photos/seed/valeria/200/300"
                alt="Valeria"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-4 text-sm">
              <p className="text-cyber-orange/80 italic font-vt323 text-base">
                Este es nuestro caso de prioridad máxima. Ella es Valeria, una estudiante de secundaria.
              </p>
              <p className="text-cyber-orange/80 italic font-vt323 text-base">
                Hace unas semanas, comenzó a recibir mensajes en sus redes. Parecía una simple broma pesada entre compañeros de clase... pero escaló. Rápido.
              </p>
              {showInsults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-red-500 font-bold animate-pulse font-vt323 text-base">
                    "Burlas públicas. Mensajes ofensivos a todas horas. Ataques coordinados desde cuentas anónimas."
                  </p>
                  <div className="bg-red-900/20 border border-red-500/30 p-3 text-sm space-y-1 font-vt323">
                    <p className="text-red-400">[CENSURADO] "¡Nadie te quiere!"</p>
                    <p className="text-red-400">[CENSURADO] "Eres patética..."</p>
                    <p className="text-red-400">[CENSURADO] "Desaparece de la ciudad"</p>
                  </div>
                  <p className="text-cyber-orange/80 italic mt-4 font-vt323 text-base">
                    Valeria está aislada y asustada. Necesitamos detener esto antes de que las consecuencias sean irreversibles.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          {showInsults && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="btn-primary mt-6"
            >
              CONTINUAR →
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'authentication') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8">
        <div className="retro-border p-8 max-w-2xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline">
            AUTENTICANDO USUARIO: ALEX (DETECTIVE ESPECIALISTA EN CRÍMENES DIGITALES)
          </h2>
          <div className="space-y-4">
            <p className="text-cyber-orange/80 italic font-vt323 text-lg">
              Aquí es donde entras tú, Detective. Los delincuentes digitales creen que pueden esconderse en el caos de la red, pero nosotros no investigamos de forma lineal. Usamos lógica.
            </p>
            <div className="bg-cyber-orange/10 border border-cyber-orange p-4">
              <p className="text-cyber-orange italic font-vt323 text-lg">
                ALEX : Cada mensaje, cada perfil falso, cada amenaza es una pieza del rompecabezas.
              </p>
            </div>
            <p className="text-cyber-orange/80 italic font-vt323 text-lg">
              Se te ha habilitado el Árbol de la Verdad. Tu trabajo es analizar cada incidente, cruzar las evidencias con el Código Penal Colombiano e insertarlo en el sistema.
            </p>
          </div>
          <div className="space-y-4 pt-4 border-t border-cyber-orange/30">
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs uppercase opacity-70">Ingrese su nombre de identificación:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-2 border-cyber-orange text-cyber-orange px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-cyber-orange/50"
                placeholder="NOMBRE DEL DETECTIVE"
                autoFocus
              />
            </div>
            <button
              disabled={!name}
              onClick={handleNext}
              className="btn-primary w-full disabled:opacity-50"
            >
              ACCEDER AL SISTEMA
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'briefing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black gap-8 overflow-y-auto">
        <div className="retro-border p-8 max-w-4xl bg-black text-center space-y-6">
          <h2 className="text-2xl font-bold uppercase text-cyber-orange underline">ACCESO CONCEDIDO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyber-orange border-b border-cyber-orange/30 pb-2">OBJETIVO PRINCIPAL</h3>
              <p className="font-vt323 text-base text-cyber-orange/80">
                Reconstruir el árbol completo de los delitos, identificar al agresor en la raíz y emitir el reporte de sanciones.
              </p>
              <h3 className="text-lg font-bold text-cyber-orange border-b border-cyber-orange/30 pb-2">SISTEMA ECONÓMICO</h3>
              <p className="font-vt323 text-base text-cyber-orange/80">
                Al final de cada día, se descontarán $50 de tu cuenta ($30 renta + $20 comida). Trabaja bien para mantener tu hogar.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-500 border-b border-red-500/30 pb-2">⚠️ ADVERTENCIAS</h3>
              <div className="space-y-2">
                <p className="text-red-400 font-vt323 text-base">
                  • Si te equivocas, recibirás una amonestación y no se te pagará completo.
                </p>
                <p className="text-red-400 font-vt323 text-base">
                  • A los 5 errores, serás desestimado del caso.
                </p>
                <p className="text-red-400 font-vt323 text-base">
                  • Al finalizar se hará una investigación sobre tu sentido de la justicia.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-cyber-orange/10 border border-cyber-orange p-4">
            <p className="text-cyber-orange italic text-center font-vt323 text-xl">
              El tiempo corre, Detective {name}. El caso de Valeria está en tus manos.
            </p>
          </div>
          <button onClick={handleNext} className="btn-primary">
            COMENZAR INVESTIGACIÓN →
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default IntroScreen;
