import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Coffee, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { GameState, Evidence, CrimeType, GameNode, CRIME_INFO } from '../types/game';
import { getAvailableCrimeTypes, getTreeDepth, getLevelName } from '../constants/gameHelpers';

interface CaseTreeScreenProps {
  state: GameState;
  avlRotationFlag: number;
  selectEvidence: (ev: Evidence) => void;
  classifyCrime: (id: string, crime: CrimeType) => void;
  saveGame: () => void;
  startDayTransition: () => void;
  submitFinalVerdict: (guilty: boolean) => void;
  acceptBribe: () => void;
  holdBribe: () => void;
  rejectBribe: () => void;
}

/**
 * Pantalla principal del árbol AVL de la investigación.
 * Contiene el dossier de la víctima, la visualización del árbol y la clasificación de delitos.
 */
const CaseTreeScreen: React.FC<CaseTreeScreenProps> = ({
  state,
  avlRotationFlag,
  selectEvidence,
  classifyCrime,
  saveGame,
  startDayTransition,
  submitFinalVerdict,
  acceptBribe,
  holdBribe,
  rejectBribe,
}) => {
  const [selectedCrime, setSelectedCrime]   = useState<CrimeType>('None');
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [showAvlFlash, setShowAvlFlash]     = useState(false);
  const [treeOffset, setTreeOffset]         = useState({ x: 0, y: 0 });
  const [treeScale, setTreeScale]           = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const treeScrollRef  = useRef<HTMLDivElement | null>(null);
  const avlFlashTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const treeDragState  = useRef({ active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });

  // Flash animation when AVL rotations occur
  useEffect(() => {
    if (avlRotationFlag === 0) return;
    if (avlFlashTimer.current) clearTimeout(avlFlashTimer.current);
    setShowAvlFlash(true);
    avlFlashTimer.current = setTimeout(() => setShowAvlFlash(false), 2000);
  }, [avlRotationFlag]);

  // Bribe modal is NOT shown automatically — player must click the email icon to open it

  // Keyboard navigation for crime buttons
  useEffect(() => {
    const getCrimeBtns = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-crime-btn]'));

    const handleKeyNav = (e: KeyboardEvent) => {
      const btns = getCrimeBtns();
      if (btns.length === 0) return;
      const cur = btns.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        btns[cur < btns.length - 1 ? cur + 1 : 0].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        btns[cur > 0 ? cur - 1 : btns.length - 1].focus();
      } else if (e.key === 'Enter' && cur !== -1) {
        e.preventDefault();
        const crimeKey = btns[cur].getAttribute('data-crime-btn') || '';
        if (selectedCrime === crimeKey) handleClassify();
        else btns[cur].click();
      } else if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [selectedCrime]);

  const handleClassify = () => {
    if (state.currentEvidence) {
      classifyCrime(state.currentEvidence.id, selectedCrime);
      setSelectedCrime('None');
    }
  };

  // ── Tree drag handlers ──
  const handleTreePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (!treeScrollRef.current) return;
    treeDragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: treeOffset.x,
      startOffsetY: treeOffset.y,
    };
    treeScrollRef.current.setPointerCapture(e.pointerId);
    treeScrollRef.current.style.cursor = 'grabbing';
  };

  const handleTreePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!treeDragState.current.active || !treeScrollRef.current) return;
    const dx = e.clientX - treeDragState.current.startX;
    const dy = e.clientY - treeDragState.current.startY;
    setTreeOffset({
      x: treeDragState.current.startOffsetX + dx,
      y: treeDragState.current.startOffsetY + dy,
    });
  };

  const endTreeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!treeDragState.current.active || !treeScrollRef.current) return;
    treeDragState.current.active = false;
    treeScrollRef.current.releasePointerCapture(e.pointerId);
    treeScrollRef.current.style.cursor = 'grab';
  };

  // ── Tree layout computation ──
  const computeTreeLayout = (root: GameNode | null): Map<string, { x: number; y: number }> => {
    const pos = new Map<string, { x: number; y: number }>();
    if (!root) return pos;
    const depth = getTreeDepth(root);
    const leafSlot   = 64;
    const totalWidth = Math.max(700, Math.pow(2, depth) * leafSlot);
    const vGap       = 90;

    const layout = (node: GameNode | null, level: number, left: number, right: number) => {
      if (!node) return;
      pos.set(node.id, { x: (left + right) / 2, y: level * vGap + 40 });
      const mid = (left + right) / 2;
      layout(node.left,  level + 1, left, mid);
      layout(node.right, level + 1, mid,  right);
    };
    layout(root, 0, 0, totalWidth);
    return pos;
  };

  const findNodeById = (node: GameNode | null, id: string): GameNode | null => {
    if (!node) return null;
    if (node.id === id) return node;
    return findNodeById(node.left, id) || findNodeById(node.right, id);
  };

  const renderTreeNode = (
    node: GameNode | null,
    positions: Map<string, { x: number; y: number }>,
    rootId: string | null,
  ): React.ReactNode => {
    if (!node) return null;
    const pos = positions.get(node.id);
    if (!pos) return null;
    const { x, y }   = pos;
    const leftPos     = node.left  ? positions.get(node.left.id)  : null;
    const rightPos    = node.right ? positions.get(node.right.id) : null;
    const isRoot      = node.id === rootId;

    return (
      <React.Fragment key={node.id}>
        {leftPos && (
          <line x1={x} y1={y} x2={leftPos.x} y2={leftPos.y}
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        )}
        {rightPos && (
          <line x1={x} y1={y} x2={rightPos.x} y2={rightPos.y}
            stroke="#f69322" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        )}
        <g transform={`translate(${x - 20}, ${y - 20})`}>
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            style={{ transformBox: 'fill-box', transformOrigin: '20px 20px', cursor: 'pointer' }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
            }}
          >
            <rect
              width="40" height="40"
              fill={isRoot ? '#3b0000' : 'black'}
              stroke={selectedNodeId === node.id ? '#fff' : isRoot ? '#ff2222' : '#f69322'}
              strokeWidth={selectedNodeId === node.id || isRoot ? 2.5 : 2}
            />
            <text x="20" y="26" textAnchor="middle" fill={isRoot ? '#ff4444' : '#f69322'}
              fontSize="16" fontWeight="bold" fontFamily="VT323, monospace">
              {node.age}
            </text>
          </motion.g>
        </g>
        {renderTreeNode(node.left,  positions, rootId)}
        {renderTreeNode(node.right, positions, rootId)}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 flex space-x-2 overflow-hidden py-2 h-full">

      {/* ===== Bribe email modal ===== */}
      {showBribeModal && state.pendingBribeOffer !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6"
          style={{ fontFamily: '"JetBrains Mono","Share Tech Mono",monospace' }}
          onClick={() => setShowBribeModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white border-4 border-gray-800 shadow-2xl shadow-black/60 flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm uppercase tracking-widest">📨 CORREO NUEVO</span>
              <button
                onClick={() => setShowBribeModal(false)}
                className="w-7 h-7 flex items-center justify-center border border-white/30 hover:bg-white hover:text-black font-bold text-base leading-none ml-3 transition-colors"
              >✕</button>
            </div>
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 space-y-1 text-[11px] text-gray-700 shrink-0">
              <p><span className="font-bold w-16 inline-block">De:</span> {state.pendingBribeOffer.sender}</p>
              <p><span className="font-bold w-16 inline-block">Cargo:</span> {state.pendingBribeOffer.relationship}</p>
              <p><span className="font-bold w-16 inline-block">Para:</span> Detective {state.playerName} — Fiscalía de NetCity</p>
              <p><span className="font-bold w-16 inline-block">Asunto:</span> Solicitud urgente sobre el caso de {state.pendingBribeOffer.targetSuspect}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 text-[12px] text-gray-800 leading-relaxed space-y-3">
              <p>Estimado/a Detective {state.playerName},</p>
              <p>Me dirijo a usted en representación de <strong>{state.pendingBribeOffer.targetSuspect}</strong>, involucrado/a en su investigación actual.</p>
              <p>Entiendo la presión que conlleva su trabajo. Le propongo de manera discreta la suma de <strong className="text-green-700">${state.pendingBribeOffer.amount}</strong> a cambio de que reconsidere la participación de {state.pendingBribeOffer.targetSuspect} en este expediente y retire los cargos que pesan sobre él/ella.</p>
              <p className="italic text-gray-500">&quot;Nadie tiene que enterarse. Esta conversación nunca ocurrió.&quot;</p>
              <p>Quedo a su disposición,<br /><strong>{state.pendingBribeOffer.sender}</strong><br /><span className="text-[10px] text-gray-400">{state.pendingBribeOffer.relationship}</span></p>
            </div>
            <div className="shrink-0 border-t border-gray-300 px-4 py-3 flex gap-3">
              <button
                onClick={() => { rejectBribe(); setShowBribeModal(false); }}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold text-[11px] uppercase py-2 px-3 transition-colors"
              >✅ No aceptar soborno</button>
              <button
                onClick={() => { acceptBribe(); setShowBribeModal(false); }}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold text-[11px] uppercase py-2 px-3 transition-colors"
              >💰 Aceptar soborno</button>
              <button
                onClick={() => { holdBribe(); setShowBribeModal(false); }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-[11px] uppercase py-2 px-3 transition-colors"
              >⏸ Poner en espera</button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Izquierdo: Dossier & Evidencias */}
      <section className="w-1/4 flex flex-col space-y-2">
        <div className="retro-border flex-1 flex flex-col bg-black">
          <div className="panel-header">Dossier: Valeria</div>
          <div className="p-4 flex-1 flex items-center justify-center">
            <div className="paper-texture w-full h-full p-4 relative text-sm overflow-hidden text-black">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-24 h-24 border-2 border-black/20 overflow-hidden bg-gray-300">
                  <img src="/Valeria.png" alt="Valeria" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gray-600 mb-1">Dossier de Víctima</p>
                  <h2 className="text-base font-bold uppercase leading-tight">Valeria</h2>
                  <p className="text-[10px] uppercase mt-2">Nivel {state.level}</p>
                  <p className="text-[10px] opacity-80">{getLevelName(state.level)}</p>
                </div>
              </div>
              <p className="text-[10px] leading-tight">
                {state.level === 1 && 'Valeria reporta mensajes ofensivos constantes.'}
                {state.level === 2 && 'Rumores falsos circulan en la red escolar.'}
                {state.level === 3 && 'Se ha detectado un perfil suplantando a la víctima.'}
                {state.level === 4 && 'Ataques coordinados masivos. Presión alta.'}
                {state.level === 5 && 'Fase final. Identifica al culpable raíz.'}
              </p>
              {state.pendingBribeOffer !== null && (
                <button
                  onClick={() => setShowBribeModal(true)}
                  className="mt-2 hover:opacity-80 transition-opacity block mx-auto"
                  title="Abrir correo"
                >
                  <img src="/correo.png" alt="Correo nuevo" className="h-16 object-contain drop-shadow-md" />
                </button>
              )}
              <div className="absolute bottom-2 right-2 stamp">ACTIVO</div>
            </div>
          </div>
        </div>
        <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
          <div className="panel-header">Evidencias Pendientes ({state.evidenceCollected.length})</div>
          <div className="p-2 overflow-y-auto flex-1 space-y-2 cyber-scroll">
            {state.evidenceCollected.map(ev => (
              <button
                key={ev.id}
                onClick={() => selectEvidence(ev)}
                className={cn(
                  'w-full text-left p-2 text-xs border transition-all',
                  state.currentEvidence?.id === ev.id
                    ? 'bg-cyber-orange text-black border-white'
                    : 'bg-gray-900 text-cyber-orange border-cyber-orange/30 hover:bg-gray-800',
                )}
              >
                <div className="flex justify-between font-bold mb-1">
                  <span>{ev.type} - @{ev.author} • {ev.age} años</span>
                  <span>{ev.timestamp}</span>
                </div>
                <p className="truncate opacity-80">{ev.content}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Panel Central: Árbol AVL */}
      <section className="flex-1 flex flex-col space-y-2">
        <div className="retro-border flex-1 flex flex-col bg-black grid-bg relative overflow-hidden">
          <div className="panel-header">
            Árbol de la Verdad
            <span className="text-[10px] font-normal opacity-60 ml-3">
              {state.tree ? `${getTreeDepth(state.tree)} niveles` : 'vacío'}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setTreeScale(s => Math.min(2, +(s + 0.15).toFixed(2)))}
                className="px-2 py-0 border border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-black text-base leading-none"
                title="Acercar"
              >+</button>
              <span className="text-[10px] w-8 text-center">{Math.round(treeScale * 100)}%</span>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setTreeScale(s => Math.max(0.2, +(s - 0.15).toFixed(2)))}
                className="px-2 py-0 border border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-black text-base leading-none"
                title="Alejar"
              >−</button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => { setTreeScale(1); setTreeOffset({ x: 0, y: 0 }); }}
                className="px-2 py-0 border border-cyber-orange/50 text-cyber-orange/60 hover:bg-cyber-orange/20 text-[10px] leading-none"
                title="Resetear vista"
              >↺</button>
            </div>
          </div>
          <div
            ref={treeScrollRef}
            className="flex-1 p-0 relative overflow-hidden cursor-grab"
            onPointerDown={handleTreePointerDown}
            onPointerMove={handleTreePointerMove}
            onPointerUp={endTreeDrag}
            onPointerLeave={endTreeDrag}
            onWheel={e => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setTreeScale(s => Math.min(2, Math.max(0.2, +(s + delta).toFixed(2))));
            }}
          >
            {(() => {
              const treeLayout = computeTreeLayout(state.tree);
              const depth      = getTreeDepth(state.tree);
              const leafSlot   = 64;
              const svgW       = Math.max(700, Math.pow(2, depth) * leafSlot);
              return (
                <svg width="100%" height="100%" style={{ display: 'block', position: 'absolute', inset: 0 }}>
                  <g transform={`translate(${treeOffset.x}, ${treeOffset.y}) scale(${treeScale})`}>
                    {state.tree ? renderTreeNode(state.tree, treeLayout, state.tree.id) : (
                      <text
                        x="50%" y="50%" textAnchor="middle"
                        fill="rgba(246,147,34,0.3)" fontSize="12" fontFamily="VT323, monospace"
                      >
                        Esperando inserción de nodos...
                      </text>
                    )}
                    {/* Tooltip */}
                    {selectedNodeId && treeLayout.size > 0 && (() => {
                      const coords  = treeLayout.get(selectedNodeId);
                      const selNode = findNodeById(state.tree, selectedNodeId);
                      if (!coords || !selNode) return null;
                      const entry = state.cataloguedLog.find(e => e.evidenceId === selNode.evidenceId);
                      if (!entry) return null;
                      return (
                        <g transform={`translate(${coords.x + 24}, ${coords.y - 52})`}>
                          <rect x="0" y="0" width="150" height="56" fill="black" stroke="#f69322" strokeWidth="1.5" rx="2" />
                          <text x="8" y="17" fill="#f69322" fontSize="12" fontFamily="VT323, monospace">@{entry.author}</text>
                          <text x="8" y="34" fill="#f69322" fontSize="12" fontFamily="VT323, monospace">{entry.crimeType.toUpperCase()}</text>
                          <text x="8" y="49" fill="rgba(246,147,34,0.55)" fontSize="10" fontFamily="VT323, monospace">Día {entry.day} · Nv {entry.level}</text>
                        </g>
                      );
                    })()}
                  </g>
                </svg>
              );
            })()}
          </div>

          {/* AVL balance flash */}
          <AnimatePresence>
            {showAvlFlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-400/20 border border-yellow-400 px-5 py-2 text-yellow-300 font-bold text-sm uppercase tracking-widest z-20 pointer-events-none"
              >
                ⚡ ÁRBOL EQUILIBRADO
              </motion.div>
            )}
          </AnimatePresence>

          {state.level === 4 && (
            <div className="absolute top-10 right-4 w-48 bg-red-900/80 border border-red-500 p-2 text-[10px] animate-pulse">
              <p className="font-bold uppercase mb-1">⚠️ NIVEL 4 ACTIVO</p>
              <p>Acoso coordinado detectado. Identifica al autor principal del hostigamiento.</p>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="retro-border h-24 flex items-center p-2 bg-black space-x-2">
          <div className="flex-1 grid grid-cols-4 gap-2">
            <button onClick={handleClassify} className="btn-primary col-span-2 h-full text-lg">
              CLASIFICAR E INSERTAR
            </button>
            <button
              onClick={saveGame}
              className="btn-action h-full flex flex-col items-center justify-center text-blue-400 border-blue-900/50"
            >
              <FileText size={16} />
              <span>GUARDAR</span>
            </button>
            {(() => {
              const day10Block =
                state.day === 10 &&
                (
                  state.currentEvidence !== null ||
                  state.evidenceCollected.length > 0 ||
                  state.pendingBribeOffer !== null ||
                  state.levelCulprits.some(c => c.verdict === 'pending')
                );
              const blockLabel = state.day === 10
                ? (state.currentEvidence !== null || state.evidenceCollected.length > 0
                    ? 'CLASIFICA TODO'
                    : state.pendingBribeOffer !== null
                    ? 'SOBORNO PENDIENTE'
                    : state.levelCulprits.some(c => c.verdict === 'pending')
                    ? 'CONDENA PENDIENTE'
                    : null)
                : null;
              return (
                <button
                  onClick={startDayTransition}
                  disabled={!!day10Block}
                  className={cn(
                    'btn-action h-full flex flex-col items-center justify-center',
                    day10Block ? 'opacity-40 cursor-not-allowed' : '',
                  )}
                >
                  {day10Block ? <Lock size={16} /> : <Coffee size={16} />}
                  <span style={{ fontSize: day10Block ? '7px' : undefined }}>
                    {blockLabel ?? 'TERMINAR DÍA'}
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Panel Derecho: Clasificación de delito */}
      <section className="w-1/3 flex flex-col space-y-2">
        <div className="retro-border flex-1 flex flex-col bg-black overflow-hidden">
          <div className="panel-header">Clasificación de Delito</div>
          <div className="p-4 flex-1 min-h-0 flex flex-col gap-4 bg-[#0a0a0a]">
            {state.currentEvidence ? (
              <>
                <div className="bg-cyber-orange/10 border border-cyber-orange p-3">
                  <p className="text-[10px] uppercase opacity-60 mb-1">Evidencia Seleccionada:</p>
                  <p className="text-sm font-bold">"{state.currentEvidence.content}"</p>
                </div>
                <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 cyber-scroll">
                  {getAvailableCrimeTypes(state.day).map(crime => (
                    <button
                      key={crime}
                      data-crime-btn={crime}
                      onClick={() => setSelectedCrime(crime)}
                      className={cn(
                        'w-full text-left p-2 border text-xs transition-all',
                        selectedCrime === crime
                          ? 'bg-cyber-orange text-black border-cyber-orange shadow-[0_0_12px_rgba(246,147,34,0.5)]'
                          : 'bg-black text-cyber-orange border-cyber-orange/30 hover:border-cyber-orange',
                        'focus-visible:bg-cyber-orange focus-visible:text-black focus-visible:border-cyber-orange',
                      )}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{crime}</span>
                        <span className="opacity-60">{CRIME_INFO[crime].article}</span>
                      </div>
                      {selectedCrime === crime && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          className="mt-2 pt-2 border-t border-black/20 text-[10px]"
                        >
                          <p>{CRIME_INFO[crime].description}</p>
                          <div className="mt-2 space-y-1">
                            {CRIME_INFO[crime].requirements.map(req => (
                              <div key={req} className="flex items-center gap-1">
                                <div className="w-2 h-2 border border-black"></div>
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                <Search size={48} className="mb-4" />
                <p className="uppercase tracking-widest text-xs">Seleccione una evidencia para analizar</p>
              </div>
            )}
          </div>
        </div>

        {state.level === 5 && (
          <div className="retro-border h-32 bg-black p-4 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase text-red-500">
              VEREDICTO FINAL: ¿Es culpable el sospechoso principal?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => submitFinalVerdict(true)}
                className="flex-1 bg-green-900 border border-green-500 text-green-500 py-2 hover:bg-green-500 hover:text-black"
              >CULPABLE</button>
              <button
                onClick={() => submitFinalVerdict(false)}
                className="flex-1 bg-red-900 border border-red-500 text-red-500 py-2 hover:bg-red-500 hover:text-black"
              >INOCENTE</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CaseTreeScreen;
