import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types/game';
import { getCurrentGameDate } from '../constants/gameHelpers';
import { TRUE_CULPRIT_AUTHOR } from '../logic/useGameState';

// ── Verdict configuration per game-over type ──────────────────────────────
const VERDICT_CONFIG: Record<
  string,
  { label: string; borderColor: string; textColor: string; bg: string }
> = {
  victoria: {
    label: '★  VICTORIA — JUSTICIA CUMPLIDA  ★',
    borderColor: '#22c55e', textColor: '#4ade80', bg: 'rgba(34,197,94,0.08)',
  },
  corrupcion: {
    label: '⚠  VEREDICTO CORRECTO — CORRUPCIÓN DETECTADA  ⚠',
    borderColor: '#ef4444', textColor: '#f87171', bg: 'rgba(239,68,68,0.08)',
  },
  insolvencia: {
    label: '✗  DESALOJADO POR INSOLVENCIA',
    borderColor: '#f97316', textColor: '#fb923c', bg: 'rgba(249,115,22,0.08)',
  },
  incompetencia: {
    label: '✗  DESPEDIDO POR INCOMPETENCIA',
    borderColor: '#ef4444', textColor: '#f87171', bg: 'rgba(239,68,68,0.08)',
  },
  veredicto: {
    label: '✗  VEREDICTO INCORRECTO',
    borderColor: '#f97316', textColor: '#fb923c', bg: 'rgba(249,115,22,0.08)',
  },
  '': {
    label: 'EXPEDIENTE CERRADO',
    borderColor: '#00f9ff', textColor: '#00f9ff', bg: 'transparent',
  },
};

// ── Small helper components ───────────────────────────────────────────────
const StatRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}> = ({ label, value, highlight, warn }) => (
  <div className="flex justify-between items-baseline py-1 border-b border-cyber-orange/10 last:border-0">
    <span className="text-xs uppercase opacity-50 tracking-wider">{label}</span>
    <span
      className={
        highlight ? 'text-cyber-orange font-bold text-base' :
        warn      ? 'text-red-400 text-base' :
                    'text-orange-200 text-base'
      }
    >
      {value}F
    </span>
  </div>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-cyber-orange text-black px-3 py-1 text-xs uppercase font-bold tracking-wider">
    █&nbsp; {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
interface FinalReportProps {
  state: GameState;
  onRestart: () => void;
}

const FinalReport: React.FC<FinalReportProps> = ({ state, onRestart }) => {
  const {
    playerName, day, money, integrity, amonestations,
    hasAcceptedBribe, bribeHistory, totalNodesInserted,
    cataloguedLog, levelCulprits, gameOverType, gameOverReason,
  } = state;

  // ── Tree root analysis ──────────────────────────────────────────────────
  const rootEvidenceId = state.tree?.evidenceId ?? null;
  const rootEntry = rootEvidenceId ? cataloguedLog.find(e => e.evidenceId === rootEvidenceId) : null;
  const rootAuthor = rootEntry?.author ?? null;
  const correctCulpritAtRoot = rootAuthor === TRUE_CULPRIT_AUTHOR;
  const showTreeVerdict = state.tree !== null &&
    (gameOverType === 'victoria' || gameOverType === 'corrupcion' || gameOverType === 'veredicto');

  // ── Compute breakdown by crime type ────────────────────────────────────
  const crimeCounts = cataloguedLog.reduce<Record<string, number>>((acc, entry) => {
    if (entry.crimeType !== 'None') {
      acc[entry.crimeType] = (acc[entry.crimeType] ?? 0) + 1;
    }
    return acc;
  }, {});
  const sortedBreakdown = Object.entries(crimeCounts).sort(([, a], [, b]) => b - a);
  const totalCrimes    = sortedBreakdown.reduce((s, [, c]) => s + c, 0);
  const positiveCount  = cataloguedLog.filter(e => e.crimeType === 'None').length;

  // ── Bribe summary ───────────────────────────────────────────────────────
  const acceptedBribes = bribeHistory.filter(b => b.status === 'accepted');
  const bribeTotal     = acceptedBribes.reduce((s, b) => s + b.amount, 0);

  const verdict    = VERDICT_CONFIG[gameOverType] ?? VERDICT_CONFIG[''];
  const closingDate = getCurrentGameDate(day);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="h-full w-full bg-black text-cyber-orange font-vt323 overflow-y-auto cyber-scroll"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div
          className="border-2 border-cyber-orange p-5 text-center"
          style={{ boxShadow: '0 0 32px rgba(246,147,34,0.18)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.35em] opacity-40 mb-1">
            Sistema Judicial NetCity — Fiscalía Digital
          </p>
          <h1 className="text-5xl uppercase tracking-widest leading-none mb-1">
            REPORTE FINAL
          </h1>
          <p className="text-xs uppercase opacity-50 mt-2">
            Expediente: Caso Valeria &nbsp;·&nbsp; Cierre: {closingDate}
          </p>
        </div>

        {/* ── VERDICT BADGE ──────────────────────────────────────────── */}
        <div
          className="p-4 text-center text-2xl uppercase tracking-wider border-2"
          style={{
            borderColor: verdict.borderColor,
            color: verdict.textColor,
            background: verdict.bg,
            textShadow: `0 0 12px ${verdict.textColor}55`,
          }}
        >
          {verdict.label}
        </div>

        {/* ── STATS ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Estadísticas de Investigación</SectionHeader>
          <div className="border border-cyber-orange/30 px-4 py-2">
            <StatRow label="Detective"                      value={playerName} />
            <StatRow label="Días investigados"              value={`${day} / 10`} />
            <StatRow label="Total nodos en el árbol AVL"    value={String(totalNodesInserted)} highlight />
            <StatRow label="Casos catalogados (total)"      value={String(cataloguedLog.length)} />
            <StatRow label="Comentarios positivos (None)"   value={String(positiveCount)} />
            <StatRow
              label="Amonestaciones"
              value={`${amonestations} / 5`}
              warn={amonestations >= 3}
            />
            <StatRow label="Dinero al cierre"               value={`$${money}`} />
            <StatRow label="Integridad final"               value={`${integrity}%`} />
          </div>
        </section>

        {/* ── TREE VERDICT ───────────────────────────────────────────── */}
        {showTreeVerdict && (
          <section>
            <SectionHeader>Análisis del Árbol de la Verdad</SectionHeader>
            <div
              className="border-2 p-4 space-y-3"
              style={{
                borderColor: correctCulpritAtRoot ? '#16a34a' : '#dc2626',
                background: correctCulpritAtRoot ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
              }}
            >
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase opacity-50">Raíz del árbol (identificado)</span>
                <span className={`text-base font-bold ${correctCulpritAtRoot ? 'text-green-400' : 'text-red-400'}`}>
                  {rootAuthor ? `@${rootAuthor}` : 'árbol vacío'}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase opacity-50">Culpable real (expediente)</span>
                <span className="text-base font-bold text-cyber-orange">@{TRUE_CULPRIT_AUTHOR}</span>
              </div>
              <div
                className={`text-center py-2 text-sm font-bold uppercase tracking-wider border ${
                  correctCulpritAtRoot
                    ? 'border-green-700 text-green-400'
                    : 'border-red-700 text-red-400'
                }`}
              >
                {correctCulpritAtRoot
                  ? '✓ ÁRBOL APUNTA AL CULPABLE REAL — Clasificación exitosa'
                  : '✗ ÁRBOL APUNTA A UN INOCENTE — Rotaciones AVL alteraron el resultado'}
              </div>
              {!correctCulpritAtRoot && (
                <p className="text-[10px] text-red-300/50 italic text-center leading-relaxed">
                  Las clasificaciones incorrectas generaron rotaciones que desplazaron al verdadero responsable.
                  La justicia no pudo cumplirse con un expediente contaminado.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── BREAKDOWN ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Desglose de Sentencias</SectionHeader>
          <div className="border border-cyber-orange/30 p-4">
            {sortedBreakdown.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-2">Sin delitos clasificados.</p>
            ) : (
              <div className="space-y-3">
                {sortedBreakdown.map(([crime, count]) => {
                  const pct = totalCrimes > 0 ? Math.round((count / totalCrimes) * 100) : 0;
                  return (
                    <div key={crime}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="uppercase">{crime}</span>
                        <span className="opacity-60">
                          {count} caso{count !== 1 ? 's' : ''} &nbsp;—&nbsp; {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-cyber-orange/15 w-full rounded-sm overflow-hidden">
                        <div
                          className="h-1.5 bg-cyber-orange rounded-sm"
                          style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── SUSPECTS ───────────────────────────────────────────────── */}
        {levelCulprits.length > 0 && (
          <section>
            <SectionHeader>Sospechosos Procesados</SectionHeader>
            <div className="border border-cyber-orange/30 divide-y divide-cyber-orange/10">
              {levelCulprits.map((c, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 text-sm">
                  <div>
                    <span className="text-cyber-orange">{c.fullName}</span>
                    <span className="text-[10px] opacity-40 ml-2 uppercase">
                      · {c.crimeType} · Nv {c.level}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      c.verdict === 'jailed'    ? 'text-red-400' :
                      c.verdict === 'dismissed' ? 'text-yellow-500' :
                                                  'text-gray-500'
                    }`}
                  >
                    {c.verdict === 'jailed'    ? '⛓ Condenado' :
                     c.verdict === 'dismissed' ? '○ Liberado'  : '? Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BRIBE HISTORY ──────────────────────────────────────────── */}
        {bribeHistory.length > 0 && (
          <section>
            <SectionHeader>Historial de Sobornos</SectionHeader>
            <div className="border border-cyber-orange/30 divide-y divide-cyber-orange/10">
              {bribeHistory.map((b, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 text-xs">
                  <span className="opacity-60">
                    {b.sender} &nbsp;—&nbsp; Día {b.originDay}
                  </span>
                  <span
                    className={`uppercase font-bold tracking-wider ${
                      b.status === 'accepted' ? 'text-red-400'    :
                      b.status === 'rejected' ? 'text-green-400'  : 'text-yellow-500'
                    }`}
                  >
                    {b.status === 'accepted'
                      ? `+$${b.amount} Aceptado`
                      : b.status === 'rejected'
                      ? 'Rechazado'
                      : 'En Espera'}
                  </span>
                </div>
              ))}
              {acceptedBribes.length > 0 && (
                <div className="px-4 py-2 text-xs text-red-400/70">
                  Total recibido de sobornos: <span className="font-bold">${bribeTotal}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── MORAL EVALUATION ───────────────────────────────────────── */}
        <section>
          <SectionHeader>Evaluación Moral</SectionHeader>
          {hasAcceptedBribe ? (
            <div className="border-2 border-red-500 p-5 bg-red-950/30 space-y-3">
              <p className="text-red-400 text-2xl uppercase tracking-wide leading-tight">
                ⚠ EL DETECTIVE SUCUMBIÓ A LA CORRUPCIÓN ⚠
              </p>
              <p className="text-red-300/65 text-sm leading-relaxed">
                Aceptaste {acceptedBribes.length} soborno{acceptedBribes.length !== 1 ? 's' : ''}{' '}
                durante la investigación, comprometiendo la integridad del expediente.
                Valeria y las víctimas merecían una justicia imparcial. El sistema judicial
                de NetCity quedó manchado por tus decisiones.
              </p>
            </div>
          ) : (
            <div className="border-2 border-green-600 p-5 bg-green-950/30 space-y-3">
              <p className="text-green-400 text-2xl uppercase tracking-wide leading-tight">
                ✓ EXPEDIENTE IMPECABLE
              </p>
              <p className="text-green-300/65 text-sm leading-relaxed">
                El detective rechazó todas las ofertas de soborno y mantuvo su integridad
                intacta durante toda la investigación. La justicia se ejerció de manera
                transparente y sin favoritismos. NetCity puede confiar en usted.
              </p>
            </div>
          )}
        </section>

        {/* ── GAME OVER REASON ───────────────────────────────────────── */}
        {gameOverReason && (
          <p className="text-xs opacity-35 text-center border border-cyber-orange/15 px-4 py-3 leading-relaxed italic">
            {gameOverReason}
          </p>
        )}

        {/* ── RESTART ────────────────────────────────────────────────── */}
        <button
          onClick={onRestart}
          className="w-full border-2 border-cyber-orange text-cyber-orange py-4 text-2xl uppercase tracking-widest hover:bg-cyber-orange hover:text-black transition-colors"
          style={{ fontFamily: '"VT323", monospace' }}
        >
          [ REINICIAR EXPEDIENTE ]
        </button>

        <p className="text-center text-[10px] opacity-20 pb-2 uppercase tracking-widest">
          TraceBack v2.0 &nbsp;·&nbsp; Sistema Judicial Digital de NetCity
        </p>
      </div>
    </motion.div>
  );
};

export default FinalReport;
