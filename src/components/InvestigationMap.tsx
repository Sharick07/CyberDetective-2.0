import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { CatalogueEntry, LevelCulprit } from '../types/game';
import { CAPA_INFO, PENALTY_OPTIONS, CRIME_MANUAL } from '../constants/gameData';

interface InvestigationMapProps {
  cataloguedLog: CatalogueEntry[];
  currentLevel: number;
  levelCulprits: LevelCulprit[];
  addSuspect: (evidenceId: string) => void;
  penalizedEvidenceIds: string[];
  onPenalize: (evidenceId: string) => void;
}

/**
 * Mapa de investigación orbital.
 * Muestra las capas del acoso como nodos orbitales y permite penalizar evidencias.
 */
const InvestigationMap: React.FC<InvestigationMapProps> = ({
  cataloguedLog,
  currentLevel,
  levelCulprits,
  addSuspect,
  penalizedEvidenceIds,
  onPenalize,
}) => {
  const [selectedCapa, setSelectedCapa]   = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CatalogueEntry | null>(null);
  const [alexMsg, setAlexMsg]             = useState<string>('');
  const [manualCapa, setManualCapa]       = useState<number | null>(null);

  const filteredLog = selectedCapa !== null
    ? cataloguedLog.filter(e => e.level === selectedCapa)
    : cataloguedLog;

  const visibleLog = filteredLog.filter(e => !penalizedEvidenceIds.includes(e.evidenceId));

  const byDay = visibleLog.reduce<Record<number, CatalogueEntry[]>>((acc, e) => {
    if (!acc[e.day]) acc[e.day] = [];
    acc[e.day].push(e);
    return acc;
  }, {});

  const capaPositions = [
    'top-[5%] left-1/2 -translate-x-1/2',
    'top-[28%] right-[8%]',
    'top-[28%] left-[8%]',
    'bottom-[18%] right-[18%]',
    'bottom-[18%] left-[18%]',
  ];

  return (
    <div
      className="flex-1 grid grid-cols-12 gap-2 overflow-hidden py-2 h-full min-h-0 relative"
      style={{ fontFamily: '"JetBrains Mono", "Share Tech Mono", monospace' }}
    >
      {/* ===== Modal del Manual ===== */}
      {manualCapa !== null && (() => {
        const capaInfo = CAPA_INFO[manualCapa - 1];
        const manualKey = Object.keys(CRIME_MANUAL).find(k => capaInfo.label.startsWith(k)) ?? capaInfo.label;
        const manual = CRIME_MANUAL[manualKey];
        return (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6"
            style={{ fontFamily: '"JetBrains Mono","Share Tech Mono",monospace' }}
            onClick={() => setManualCapa(null)}
          >
            <div
              className="w-full max-w-lg bg-black border-2 border-cyber-orange flex flex-col shadow-2xl shadow-cyber-orange/30"
              style={{ maxHeight: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-cyber-orange text-black px-4 py-3 flex items-center justify-between shrink-0">
                <span className="font-bold uppercase text-sm tracking-widest">📖 Manual — {capaInfo.emoji} {capaInfo.label}</span>
                <button
                  onClick={() => setManualCapa(null)}
                  className="w-7 h-7 flex items-center justify-center border border-black/30 hover:bg-black hover:text-cyber-orange text-black font-bold text-base leading-none ml-3 transition-colors"
                >✕</button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4 text-[12px] text-cyber-orange/90">
                <div className="border border-cyber-orange/30 px-3 py-1.5 text-[10px] text-cyber-orange/50 uppercase tracking-widest">
                  {capaInfo.sublabel} — {capaInfo.description}
                </div>
                {manual ? (
                  <>
                    <div>
                      <p className="font-bold uppercase text-cyber-orange border-b border-cyber-orange/30 pb-1 mb-2 text-[10px] tracking-widest">▸ Cómo penalizar</p>
                      <p className="leading-relaxed text-cyber-orange/80">{manual.howTo}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase text-cyber-orange border-b border-cyber-orange/30 pb-1 mb-2 text-[10px] tracking-widest">▸ Penas disponibles</p>
                      <div className="space-y-2">
                        {manual.penalties.map((p, idx) => (
                          <div key={idx} className="border border-cyber-orange/20 p-2 bg-cyber-orange/5">
                            <p className="font-bold text-cyber-orange text-[11px] mb-1">⚖ {p.name}</p>
                            <p className="text-cyber-orange/70 text-[11px] leading-snug">{p.when}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold uppercase text-cyber-orange border-b border-cyber-orange/30 pb-1 mb-2 text-[10px] tracking-widest">▸ Ejemplos</p>
                      <div className="space-y-2">
                        {manual.examples.map((ex, idx) => (
                          <div key={idx} className="border border-cyber-orange/20 p-3 bg-cyber-orange/5">
                            <p className="italic text-cyber-orange/90 mb-1">{ex.comment}</p>
                            <p className="text-[11px] text-green-400 font-bold mb-0.5">✓ Pena: {ex.penalty}</p>
                            <p className="text-[10px] text-cyber-orange/50">→ {ex.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { setManualCapa(null); setAlexMsg(manual.alexTip); }}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-white text-[12px] py-2.5 px-3 uppercase font-bold tracking-wide flex items-center justify-center gap-2 transition-colors"
                    >
                      🔍 Pedir ayuda al Detective Alex
                    </button>
                  </>
                ) : (
                  <p className="text-cyber-orange/40 italic">Manual no disponible para esta capa.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Panel Izquierdo: Evidencias catalogadas */}
      <section className="col-span-3 flex flex-col h-full min-h-0">
        <div className="flex-1 retro-border flex flex-col bg-black h-full min-h-0">
          <div className="panel-header flex items-center justify-between">
            <span className="truncate">
              {selectedCapa !== null
                ? `CAPA ${selectedCapa} — ${CAPA_INFO[selectedCapa - 1].label}`
                : 'TODAS LAS EVIDENCIAS'} ({visibleLog.length})
            </span>
            {selectedCapa !== null && (
              <button
                onClick={() => { setSelectedCapa(null); setSelectedEntry(null); setAlexMsg(''); }}
                className="text-[9px] text-cyber-orange underline ml-2 shrink-0"
              >VER TODO</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-3 min-h-0">
            {selectedCapa === null ? (
              <p className="text-cyber-orange/40 text-xs text-center py-8 uppercase tracking-widest">
                Selecciona una capa<br />para ver sus evidencias
              </p>
            ) : visibleLog.length === 0 ? (
              <p className="text-cyber-orange/40 text-xs text-center py-8 uppercase tracking-widest">
                Sin evidencias<br />pendientes en esta capa
              </p>
            ) : (
              Object.entries(byDay)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, entries]) => (
                  <div key={day}>
                    <div className="text-[11px] uppercase font-bold text-cyber-orange border-b border-cyber-orange/30 pb-1 mb-2 tracking-widest">
                      ► Día {day}
                    </div>
                    {entries.map(entry => (
                      <button
                        key={entry.evidenceId}
                        onClick={() => { setSelectedEntry(selectedEntry?.evidenceId === entry.evidenceId ? null : entry); setAlexMsg(''); }}
                        className={cn(
                          'w-full text-left border p-2 mb-2 text-[11px] transition-all',
                          levelCulprits.some(c => c.evidenceId === entry.evidenceId && c.wasRoot)
                            ? 'bg-red-950 border-red-500'
                            : selectedEntry?.evidenceId === entry.evidenceId
                              ? 'bg-cyber-orange/20 border-cyber-orange'
                              : 'bg-black border-cyber-orange/40 hover:border-cyber-orange/70',
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn(
                            'font-bold uppercase text-[10px]',
                            levelCulprits.some(c => c.evidenceId === entry.evidenceId && c.wasRoot)
                              ? 'text-red-400' : 'text-cyber-orange',
                          )}>
                            {entry.crimeType}
                            {levelCulprits.some(c => c.evidenceId === entry.evidenceId && c.wasRoot) ? ' ★ CULPABLE' : ''}
                          </span>
                          <span className="text-cyber-orange/40 text-[10px] uppercase">{entry.type}</span>
                        </div>
                        <p className="text-cyber-orange/80 italic leading-tight">{entry.content}</p>
                        <p className="text-cyber-orange/40 mt-1 text-[10px]">— {entry.author}</p>
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Panel Central: Mapa orbital */}
      <section className="col-span-6 retro-border bg-black grid-bg relative overflow-hidden p-0">
        <div className="panel-header !rounded-none !mb-0">
          <span>▼ Mapa de Investigación - Capas del Acoso</span>
        </div>
        <div className="absolute inset-0 top-8 flex items-center justify-center">
          {/* Líneas SVG de conexión */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {(() => {
              const targets = [[50, 9], [88, 31], [12, 31], [79, 82], [21, 82]];
              return CAPA_INFO.map((capa, i) => {
                if (capa.level > currentLevel) return null;
                const [tx, ty] = targets[i];
                const isSelected = selectedCapa === capa.level;
                return (
                  <line
                    key={capa.level}
                    x1="50" y1="50" x2={tx} y2={ty}
                    stroke={isSelected ? 'rgba(220,38,38,0.7)' : 'rgba(220,38,38,0.3)'}
                    strokeWidth={isSelected ? '0.35' : '0.2'}
                  />
                );
              });
            })()}
          </svg>

          {/* Círculos orbitales */}
          {[420, 320, 220, 120].map(size => (
            <div key={size} className="border border-cyber-orange/20 rounded-full absolute" style={{ width: size, height: size, zIndex: 1 }} />
          ))}

          {/* Nodos de capa */}
          {CAPA_INFO.map((capa, i) => {
            const isSelected  = selectedCapa === capa.level;
            const isAvailable = capa.level <= currentLevel;
            const count       = cataloguedLog.filter(e => e.level === capa.level).length;
            return (
              <div key={capa.level} style={{ zIndex: 2 }} className={`absolute ${capaPositions[i]} flex flex-col items-center transition-all ${!isAvailable ? 'opacity-30' : ''}`}>
                <button
                  onClick={() => { if (isAvailable) { setSelectedCapa(isSelected ? null : capa.level); setSelectedEntry(null); setAlexMsg(''); } }}
                  disabled={!isAvailable}
                  className={`flex flex-col items-center transition-all ${isAvailable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                >
                  <div className={`w-10 h-10 border-2 bg-black flex items-center justify-center text-xl relative transition-all ${isSelected ? 'border-white shadow-[0_0_12px_rgba(246,147,34,0.9)]' : 'border-cyber-orange'}`}>
                    <span>{capa.emoji}</span>
                    {isSelected && <div className="absolute -top-6 text-[8px] bg-cyber-orange text-black px-1 font-bold">ACTIVA</div>}
                    {count > 0 && <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[7px] font-bold rounded-full flex items-center justify-center">{count}</div>}
                  </div>
                  <div className="text-[7px] text-center mt-1 uppercase font-bold leading-tight">
                    Capa {capa.level}:<br />{capa.label}<br /><span className="opacity-60">({capa.sublabel})</span>
                  </div>
                </button>
                {isAvailable && (
                  <button
                    onClick={e => { e.stopPropagation(); setManualCapa(capa.level); }}
                    className="mt-1 w-7 h-7 border border-cyber-orange/60 bg-black hover:bg-cyber-orange hover:text-black text-cyber-orange text-[13px] flex items-center justify-center transition-all"
                  >📖</button>
                )}
              </div>
            );
          })}

          {/* Núcleo central */}
          <div className="w-14 h-14 border-2 border-cyber-orange bg-black flex items-center justify-center text-2xl relative z-10">
            <span>🤝</span>
            <div className="absolute -bottom-10 text-[8px] text-center w-28 font-bold uppercase leading-tight">Núcleo de<br />la Verdad</div>
          </div>
        </div>
      </section>

      {/* Panel Derecho: Detalles de capa y penas */}
      <section className="col-span-3 flex flex-col h-full min-h-0">
        <div className="retro-border bg-black flex-grow flex flex-col min-h-0">
          <div className="panel-header">
            {selectedCapa !== null ? `Capa ${selectedCapa}: ${CAPA_INFO[selectedCapa - 1].label}` : 'Estado del Caso'}
          </div>
          <div className="flex-1 p-4 bg-paper-bg text-black mx-2 my-2 border border-black shadow-inner overflow-y-auto min-h-0">
            {selectedCapa !== null ? (
              <div className="text-xs space-y-3">
                {alexMsg && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded">
                    <p className="text-[10px] font-bold text-amber-700 mb-1">🔍 DETECTIVE ALEX</p>
                    <p className="text-[11px] text-amber-900 leading-snug">{alexMsg}</p>
                  </div>
                )}
                <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
                  {CAPA_INFO[selectedCapa - 1].emoji} {CAPA_INFO[selectedCapa - 1].label}
                </h2>
                <p><strong>ARTÍCULO:</strong> {CAPA_INFO[selectedCapa - 1].sublabel}</p>
                <p className="italic text-gray-600">{CAPA_INFO[selectedCapa - 1].description}</p>
                <p><strong>EVIDENCIAS:</strong> {filteredLog.length}</p>
                {filteredLog.length === 0 && <p className="italic text-gray-500">Sin evidencias catalogadas en esta capa.</p>}
                {visibleLog.length === 0 && filteredLog.length > 0 && (
                  <p className="italic text-green-700 font-bold">✓ Todas las evidencias de esta capa han sido procesadas.</p>
                )}
                {/* Detalle de evidencia seleccionada y penas */}
                {selectedEntry && (
                  <div className="border-t border-black pt-3 space-y-3">
                    <div className="bg-gray-100 border border-gray-400 p-2 rounded">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Comentario seleccionado:</p>
                      <p className="italic text-gray-800 leading-snug">{selectedEntry.content}</p>
                      <p className="text-gray-500 text-[10px] mt-1">@{selectedEntry.author} · Día {selectedEntry.day} · {selectedEntry.type}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase border-b border-black pb-1 mb-2">Penas posibles ({selectedEntry.crimeType}):</p>
                      <div className="space-y-2">
                        {(PENALTY_OPTIONS[selectedEntry.crimeType] ?? []).map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const isPrison = opt.label.toLowerCase().includes('prisión');
                              if (isPrison) addSuspect(selectedEntry.evidenceId);
                              setAlexMsg(`ALEX: Pena notificada: "${opt.label}". ${opt.detail}`);
                              onPenalize(selectedEntry.evidenceId);
                              const next = visibleLog.filter(e => e.evidenceId !== selectedEntry.evidenceId);
                              setSelectedEntry(next[0] || null);
                            }}
                            className="w-full text-left bg-white border border-gray-400 hover:bg-amber-50 hover:border-amber-600 p-2 rounded transition-all"
                          >
                            <p className="font-bold text-[11px]">{opt.label}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{opt.detail}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {!selectedEntry && visibleLog.length > 0 && (
                  <p className="text-gray-400 italic text-[10px] mt-2">Haz clic en una evidencia para ver las penas posibles.</p>
                )}
              </div>
            ) : (
              <div className="text-xs space-y-3">
                <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Estado del Caso</h2>
                <p><strong>NIVEL ACTUAL:</strong> {currentLevel}</p>
                <p><strong>TOTAL CATALOGADAS:</strong> {cataloguedLog.length}</p>
                <div>
                  <p className="font-bold border-b border-black inline-block mb-1 uppercase">Por Capa:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 mt-1">
                    {CAPA_INFO.filter(c => c.level <= currentLevel).map(c => (
                      <li key={c.level}>
                        Capa {c.level} ({c.label}): <strong>{cataloguedLog.filter(e => e.level === c.level).length}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                {levelCulprits.filter(c => c.revealed).length > 0 && (
                  <div className="border-t border-black pt-2 space-y-1">
                    <p className="font-bold uppercase text-red-700 border-b border-red-300 pb-1 mb-2">⚖ Culpables Identificados</p>
                    {levelCulprits.filter(c => c.revealed).map(c => (
                      <div key={c.evidenceId} className="bg-red-50 border border-red-300 p-1 rounded text-[10px]">
                        <span className="font-bold text-red-800">{c.fullName}</span>{' '}
                        <span className="text-gray-500">(@{c.author})</span> · {c.crimeType} · edad {c.age}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const revealed = levelCulprits.filter(c => c.revealed);
                        const topCulprit = [...revealed].sort((a, b) => b.level - a.level)[0];
                        const allNames = revealed.map(c => `${c.fullName} (@${c.author}, ${c.crimeType})`).join('; ');
                        setAlexMsg(`DETECTIVE ALEX: Sospechosos: ${allNames}. Perfil más peligroso: ${topCulprit.fullName} — ${topCulprit.crimeType} nivel ${topCulprit.level}.`);
                      }}
                      className="mt-1 w-full bg-amber-700 hover:bg-amber-600 text-white text-[10px] py-1 px-2 uppercase font-bold tracking-wide"
                    >🔍 Consultar al Detective Alex</button>
                    {alexMsg && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded mt-1">
                        <p className="text-[10px] font-bold text-amber-700 mb-1">🔍 DETECTIVE ALEX</p>
                        <p className="text-[11px] text-amber-900 leading-snug">{alexMsg}</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-gray-500 italic">Haz clic en una capa del mapa para filtrar las evidencias.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestigationMap;
