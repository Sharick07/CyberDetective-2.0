import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types/game';
import { CRIME_FILES } from '../constants/gameData';

interface TacticalBoardProps {
  state: GameState;
  acceptBribe: () => void;
  holdBribe: () => void;
  rejectBribe: () => void;
  acceptHeldBribe: (targetEvidenceId: string) => void;
  rejectHeldBribe: (targetEvidenceId: string) => void;
  jailCulprit: (evidenceId: string) => void;
  dismissCulprit: (evidenceId: string) => void;
}

/**
 * Tablero táctico del caso.
 * Muestra los expedientes de crimen, el historial de sobornos y la lista de sospechosos.
 */
const TacticalBoard: React.FC<TacticalBoardProps> = ({
  state,
  acceptHeldBribe,
  rejectHeldBribe,
  jailCulprit,
  dismissCulprit,
}) => {
  const [selectedFile, setSelectedFile]           = useState<number | null>(null);
  const [selectedCulpritId, setSelectedCulpritId] = useState<string | null>(null);
  const [newSuspectAlert, setNewSuspectAlert]     = useState<string | null>(null);
  const prevCulpritCountRef = React.useRef(state.levelCulprits.length);

  // Notificación cuando se añade un nuevo sospechoso
  useEffect(() => {
    if (state.levelCulprits.length > prevCulpritCountRef.current) {
      const newest = state.levelCulprits[state.levelCulprits.length - 1];
      if (newest.revealed) {
        setNewSuspectAlert(`🚨 Nuevo sospechoso identificado: ${newest.fullName} (@${newest.author}) — ${newest.crimeType}`);
        const timer = setTimeout(() => setNewSuspectAlert(null), 8000);
        return () => clearTimeout(timer);
      }
    }
    prevCulpritCountRef.current = state.levelCulprits.length;
  }, [state.levelCulprits.length]);

  // Días del nivel correspondiente: nivel 1 = días 1-2, nivel 2 = días 3-4, etc.
  const getDaysForLevel = (lv: number) => [(lv - 1) * 2 + 1, (lv - 1) * 2 + 2];

  const filteredBribes = selectedFile !== null
    ? (() => {
        const [d1, d2] = getDaysForLevel(selectedFile);
        return state.bribeHistory.filter(b => b.originDay === d1 || b.originDay === d2);
      })()
    : state.bribeHistory;

  const selectedFileInfo = selectedFile !== null
    ? CRIME_FILES.find(f => f.level === selectedFile)
    : null;

  return (
    <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2 h-full min-h-0 relative">

      {/* Banner de notificación de nuevo sospechoso */}
      <AnimatePresence>
        {newSuspectAlert && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-red-900 border-2 border-red-500 px-6 py-2 text-red-100 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/30 max-w-lg text-center"
          >
            {newSuspectAlert}
            <button onClick={() => setNewSuspectAlert(null)} className="ml-3 text-red-300 hover:text-white text-[10px]">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Izquierdo: Historial de Sobornos */}
      <aside className="col-span-3 flex flex-col h-full min-h-0">
        <section className="flex-1 bg-black border-2 border-cyber-orange/30 flex flex-col h-full min-h-0 overflow-hidden">
          <div className="flex justify-between items-center px-2 py-1 bg-cyber-orange/10 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {selectedFileInfo ? `Sobornos — ${selectedFileInfo.label}` : 'Sobornos Pendientes'}
            </span>
            <span className="text-[10px] text-cyber-orange/60">{filteredBribes.filter(b => b.status === 'pending').length} activo(s)</span>
          </div>
          {selectedFile !== null && (
            <button onClick={() => setSelectedFile(null)} className="text-[9px] text-cyber-orange underline px-2 py-1 text-left shrink-0">← Ver todos</button>
          )}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredBribes.length === 0 && (
              <div className="text-[10px] text-cyber-orange/40 italic text-center mt-6">
                {selectedFile !== null ? 'Sin sobornos registrados para este delito.' : 'Sin sobornos registrados aún.'}
              </div>
            )}
            {filteredBribes.map((bribe, i) => (
              <div key={i} className={`border p-2 text-[10px] ${
                bribe.status === 'pending' ? 'border-yellow-500 bg-yellow-500/10' :
                bribe.status === 'accepted' ? 'border-red-500 bg-red-500/10' :
                'border-green-600 bg-green-600/10'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase tracking-wider">Día {bribe.originDay}</span>
                  <span className={`font-bold uppercase text-[9px] px-1 ${
                    bribe.status === 'pending' ? 'text-yellow-400' :
                    bribe.status === 'on-hold'  ? 'text-orange-400' :
                    bribe.status === 'accepted' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {bribe.status === 'pending'  ? '● PENDIENTE' :
                     bribe.status === 'on-hold'  ? '⏸ EN ESPERA' :
                     bribe.status === 'accepted' ? '✗ ACEPTADO'  : '✓ RECHAZADO'}
                  </span>
                </div>
                <div className="text-cyber-orange/80">
                  Oferta: <span className="font-bold text-cyber-orange">${bribe.amount}</span>
                </div>
                {bribe.status === 'on-hold' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => acceptHeldBribe(bribe.targetEvidenceId)}
                      className="flex-1 bg-red-900/60 border border-red-500 text-red-300 text-[9px] uppercase font-bold py-1 hover:bg-red-800 transition-colors"
                    >Aceptar</button>
                    <button
                      onClick={() => rejectHeldBribe(bribe.targetEvidenceId)}
                      className="flex-1 bg-green-900/60 border border-green-600 text-green-300 text-[9px] uppercase font-bold py-1 hover:bg-green-800 transition-colors"
                    >Rechazar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-cyber-orange/20 px-2 py-1 text-[9px] text-cyber-orange/60 flex justify-between">
            <span>Integridad: <span className={state.integrity < 50 ? 'text-red-400' : 'text-green-400'}>{state.integrity}%</span></span>
            <span>Total ofrecido: ${filteredBribes.reduce((s, b) => s + b.amount, 0)}</span>
          </div>
        </section>
      </aside>

      {/* Panel Central: Pizarrón táctico con expedientes */}
      <main className="col-span-6 bg-[#5d3a1a] border-[12px] border-[#3d2a1a] shadow-inner relative overflow-hidden flex flex-col p-0">
        <div className="bg-[#3d2a1a] text-white px-4 py-1 text-[10px] font-bold flex items-center justify-between uppercase !rounded-none !mb-0">
          <span>▼ Pizarrón Táctico — Expedientes del Caso</span>
        </div>
        <div className="flex-1 p-4 relative overflow-hidden">
          {/* Hilos rojos SVG entre carpetas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {CRIME_FILES.filter(f => f.level <= state.level).map((f, i, arr) => {
              if (i === 0) return null;
              const cols = Math.min(3, arr.length);
              const prevRow = Math.floor((i - 1) / cols), prevCol = (i - 1) % cols;
              const curRow  = Math.floor(i / cols),       curCol  = i % cols;
              const px = 60 + prevCol * 170 + 55, py = 20 + prevRow * 180 + 60;
              const cx = 60 + curCol  * 170 + 55, cy = 20 + curRow  * 180 + 60;
              return <line key={i} x1={px} y1={py} x2={cx} y2={cy} stroke="red" strokeWidth="1.5" opacity="0.5" />;
            })}
          </svg>

          {/* Carpetas de expedientes */}
          <div className="relative z-10 flex flex-wrap gap-6 justify-center items-start pt-2">
            {CRIME_FILES.map(file => {
              const isUnlocked = file.level <= state.level;
              const isSelected = selectedFile === file.level;
              const evidenceCount = state.cataloguedLog.filter(e => {
                const [d1, d2] = getDaysForLevel(file.level);
                return e.day === d1 || e.day === d2;
              }).length;
              const bribeCount = (() => {
                const [d1, d2] = getDaysForLevel(file.level);
                return state.bribeHistory.filter(b => b.originDay === d1 || b.originDay === d2).length;
              })();
              return (
                <button
                  key={file.level}
                  onClick={() => { if (isUnlocked) setSelectedFile(isSelected ? null : file.level); }}
                  disabled={!isUnlocked}
                  className={`w-[130px] flex flex-col items-center transition-all ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-25 cursor-not-allowed'}`}
                  style={{ transform: isUnlocked ? `rotate(${file.level % 2 === 0 ? 2 : -2}deg)` : undefined }}
                >
                  <div className={`w-full bg-white border-2 ${isSelected ? file.color + ' shadow-lg shadow-white/20' : 'border-gray-400'} p-2 relative transition-all`}>
                    <div className={`absolute -top-3 left-2 w-12 h-3 border-t-2 border-l-2 border-r-2 bg-white ${isSelected ? file.color : 'border-gray-400'}`}></div>
                    <div className="text-center mt-1"><span className="text-2xl">{file.emoji}</span></div>
                    <div className="text-center mt-1">
                      <p className="text-[9px] font-black uppercase text-gray-800">{file.label}</p>
                      <p className="text-[7px] text-gray-500 uppercase">{file.article} · Nv.{file.level}</p>
                    </div>
                    <div className="flex justify-between mt-2 text-[7px] text-gray-500 border-t border-gray-300 pt-1">
                      <span>{evidenceCount} evidencias</span>
                      <span>{bribeCount} sobornos</span>
                    </div>
                    {isSelected && <div className="absolute -top-5 right-0 bg-red-600 text-white text-[7px] px-1 py-0.5 font-bold uppercase">Abierto</div>}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg">🔒</span>
                      </div>
                    )}
                  </div>
                  <div className="w-4 h-4 bg-red-700 rounded-full mt-1 border border-red-900 shadow-sm" title="Pin"></div>
                </button>
              );
            })}
          </div>

          {/* Barra de ubicación inferior */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/40 border border-white/20 p-2 flex items-center justify-around h-10 backdrop-blur-sm z-10">
            {['NetCity Central', 'Deep Net', 'NetCity Central'].map((label, i) => (
              <React.Fragment key={i}>
                <div className="text-[8px] text-white flex flex-col items-center">
                  <div className="w-2 h-2 bg-cyber-orange mb-1"></div>
                  {label}
                </div>
                {i < 2 && <div className="w-20 h-px bg-white/40"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Panel Derecho: Sospechosos y correo de soborno */}
      <aside className="col-span-3 flex flex-col gap-2">
        {/* Lista de sospechosos */}
        <section className="bg-paper-bg text-black p-3 retro-border relative h-1/2 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-black text-cyber-orange px-2 py-1 text-[8px] font-bold uppercase">Sospechosos</div>
          <h2 className="text-sm font-bold mb-2 mt-4 underline uppercase">Expediente de Sospechosos</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {state.levelCulprits.length === 0 && (
              <p className="text-[9px] italic text-gray-500 mt-4 text-center">
                Aún no se han identificado sospechosos. Aplica una pena de prisión en el Mapa de Investigación para identificarlos.
              </p>
            )}
            {state.levelCulprits.map(c => {
              const isSelected  = selectedCulpritId === c.evidenceId;
              const fileInfo    = CRIME_FILES.find(f => f.level === c.level);
              return (
                <div
                  key={c.evidenceId}
                  className={`border-2 p-2 cursor-pointer transition-all ${
                    c.verdict === 'jailed'    ? 'border-red-700 bg-red-100' :
                    c.verdict === 'dismissed' ? 'border-gray-400 bg-gray-200 opacity-60' :
                    isSelected                ? 'border-yellow-600 bg-yellow-50 shadow-md' :
                    'border-gray-400 bg-white hover:bg-yellow-50'
                  }`}
                  onClick={() => setSelectedCulpritId(isSelected ? null : c.evidenceId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[10px] uppercase">{fileInfo?.emoji} {c.fullName}</span>
                      <p className="text-[7px] text-gray-500">Usuario: {c.author}</p>
                    </div>
                    <span className={`text-[7px] font-bold uppercase px-1 py-0.5 ${
                      c.verdict === 'jailed'    ? 'bg-red-700 text-white' :
                      c.verdict === 'dismissed' ? 'bg-gray-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}>
                      {c.verdict === 'jailed' ? '🔒 PRESO' : c.verdict === 'dismissed' ? '✗ DESESTIMADO' : '⏳ PENDIENTE'}
                    </span>
                  </div>
                  <p className="text-[8px] text-gray-600">Nv.{c.level} · {c.crimeType} · Edad: {c.age}</p>
                  {isSelected && c.verdict === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={e => { e.stopPropagation(); jailCulprit(c.evidenceId); }}
                        className="flex-1 bg-red-800 text-white text-[8px] font-bold uppercase py-1 border border-red-900 hover:bg-red-700 transition-colors"
                      >🔒 Enviar a Cárcel</button>
                      <button
                        onClick={e => { e.stopPropagation(); dismissCulprit(c.evidenceId); }}
                        className="flex-1 bg-gray-600 text-white text-[8px] font-bold uppercase py-1 border border-gray-700 hover:bg-gray-500 transition-colors"
                      >✗ Desestimar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Correo de soborno del padre */}
        <section className="flex-1 bg-black border-2 border-cyber-orange/20 p-2 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-2 bg-cyber-orange/10 px-2">
            <span className="text-[8px] font-bold uppercase">📧 Correo del Padre</span>
          </div>
          {(() => {
            const culprit = selectedCulpritId !== null
              ? state.levelCulprits.find(c => c.evidenceId === selectedCulpritId)
              : null;
            const [d1, d2] = culprit ? getDaysForLevel(culprit.level) : [0, 0];
            const bribe = state.bribeHistory.find(b => b.originDay === d1 || b.originDay === d2);

            if (!culprit || !culprit.revealed) return (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[9px] text-cyber-orange/40 italic text-center px-4">
                  Selecciona un sospechoso identificado arriba para ver el correo de soborno.
                </p>
              </div>
            );

            if (!bribe) return (
              <div className="flex-1 bg-gray-900/60 border border-cyber-orange/10 p-3 flex flex-col justify-center">
                <p className="text-[10px] text-cyber-orange/60 italic text-center">
                  No se registró un soborno durante la investigación del nivel {culprit.level} ({culprit.crimeType}).
                </p>
              </div>
            );

            return (
              <div className="flex-1 overflow-y-auto">
                <div className="bg-gray-900 border border-cyber-orange/30 p-3 space-y-2">
                  <div className="border-b border-cyber-orange/20 pb-2 space-y-1">
                    <p className="text-[9px] text-cyber-orange/60"><span className="font-bold text-cyber-orange">De:</span> padre_de_{culprit.author.toLowerCase()}@netcity.com</p>
                    <p className="text-[9px] text-cyber-orange/60"><span className="font-bold text-cyber-orange">Para:</span> detective_{state.playerName.toLowerCase() || 'anon'}@fiscalia.net</p>
                    <p className="text-[9px] text-cyber-orange/60"><span className="font-bold text-cyber-orange">Asunto:</span> RE: Caso Nv.{culprit.level} — Solicitud URGENTE</p>
                  </div>
                  <div className="text-[9px] text-cyber-orange/80 leading-relaxed space-y-2">
                    <p>Estimado/a Detective,</p>
                    <p>Le escribo como padre de <span className="font-bold text-cyber-orange">{culprit.fullName}</span>. Mi hijo/a fue señalado/a en su investigación por un caso de <span className="font-bold text-yellow-400">{culprit.crimeType}</span>.</p>
                    <p>Le ofrezco <span className="font-bold text-green-400">${bribe.amount}</span> para que reconsidere la participación de mi hijo/a en este expediente.</p>
                    <p className="italic text-cyber-orange/50">"Nadie tiene que saber. Solo retire el nombre y todos ganamos."</p>
                    <p>Quedo a su disposición,<br /><strong>{bribe.sender}</strong><br /><span className="text-[10px] text-gray-400">{bribe.relationship}</span></p>
                  </div>
                  <div className={`mt-2 border-t border-cyber-orange/20 pt-2 text-[9px] font-bold uppercase text-center ${
                    bribe.status === 'on-hold'  ? 'text-orange-400' :
                    bribe.status === 'accepted' ? 'text-red-400'    : 'text-green-400'
                  }`}>
                    {bribe.status === 'on-hold'  && '⏸ SOBORNO EN ESPERA'}
                    {bribe.status === 'accepted' && '✗ SOBORNO ACEPTADO — Integridad comprometida'}
                    {bribe.status === 'rejected' && '✓ SOBORNO RECHAZADO — Integridad intacta'}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </aside>
    </div>
  );
};

export default TacticalBoard;
