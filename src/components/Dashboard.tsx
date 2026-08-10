"use client";

import React, { useState } from "react";
import { Copy, Check, Trash2, Calendar, Share2, Clipboard, Activity } from "lucide-react";

interface Metric {
  game: 'tracking' | 'memory' | 'cimt';
  timestamp: number;
  success: boolean;
  reactionTime?: number;
  side?: 'left' | 'right';
  errorsCount?: number;
}

interface DashboardProps {
  metrics: Metric[];
  onClearMetrics: () => void;
}

export default function Dashboard({ metrics, onClearMetrics }: DashboardProps) {
  const [copied, setCopied] = useState(false);

  // --- FILTROS Y CÁLCULOS ---

  // 1. Busca la Estrella (Visual Tracking)
  const trackingMetrics = metrics.filter(m => m.game === 'tracking');
  const trackingHits = trackingMetrics.filter(m => m.success).length;
  const trackingMissed = trackingMetrics.filter(m => !m.success).length;
  
  const trackingLeftMetrics = trackingMetrics.filter(m => m.side === 'left');
  const trackingLeftHits = trackingLeftMetrics.filter(m => m.success).length;
  const trackingLeftMissed = trackingLeftMetrics.filter(m => !m.success).length;

  const trackingRightMetrics = trackingMetrics.filter(m => m.side === 'right');
  const trackingRightHits = trackingRightMetrics.filter(m => m.success).length;
  const trackingRightMissed = trackingRightMetrics.filter(m => !m.success).length;

  // Tiempos de Reacción Visual Tracking
  const getAverageReactionTime = (side?: 'left' | 'right') => {
    const targets = trackingMetrics.filter(m => 
      m.success && 
      m.reactionTime !== undefined && 
      (!side || m.side === side)
    );
    if (targets.length === 0) return 0;
    const sum = targets.reduce((acc, m) => acc + (m.reactionTime || 0), 0);
    return Math.round(sum / targets.length);
  };

  const avgReactionLeft = getAverageReactionTime('left');
  const avgReactionRight = getAverageReactionTime('right');
  const avgReactionTotal = getAverageReactionTime();

  // 2. Memotest (Memory)
  const memoryMetrics = metrics.filter(m => m.game === 'memory');
  const memoryCompletions = memoryMetrics.length;
  const avgMemoryErrors = memoryMetrics.length > 0 
    ? Math.round(memoryMetrics.reduce((acc, m) => acc + (m.errorsCount || 0), 0) / memoryMetrics.length) 
    : 0;

  // 3. CIMT-Light (Coordination)
  const cimtMetrics = metrics.filter(m => m.game === 'cimt');
  const cimtHits = cimtMetrics.filter(m => m.success).length;
  const cimtReactionTimes = cimtMetrics.filter(m => m.reactionTime !== undefined).map(m => m.reactionTime as number);
  const avgCimtReaction = cimtReactionTimes.length > 0
    ? Math.round(cimtReactionTimes.reduce((a, b) => a + b, 0) / cimtReactionTimes.length)
    : 0;

  // --- EXPORTACIÓN ---

  const generateReportText = () => {
    const dateStr = new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `📊 *Reporte de Rehabilitación - OSCAR*
📅 Fecha: ${dateStr}

✨ *JUEGO 1: BUSCA LA ESTRELLA (Rastreo Visual)*
- Total Aciertos: ${trackingHits}
- Omitidas en Lado Izquierdo (Hemianopsia): ${trackingLeftMissed}
- Tiempo Reac. Promedio Izquierda: ${avgReactionLeft > 0 ? `${(avgReactionLeft / 1000).toFixed(2)}s` : "Sin datos"}
- Tiempo Reac. Promedio Derecha: ${avgReactionRight > 0 ? `${(avgReactionRight / 1000).toFixed(2)}s` : "Sin datos"}
- Omisiones Totales: ${trackingMissed}

🧠 *JUEGO 2: MEMOTEST (Memoria Episódica)*
- Rondas completadas: ${memoryCompletions}
- Promedio de errores por ronda: ${memoryCompletions > 0 ? avgMemoryErrors : "Sin datos"}

🖐️ *JUEGO 3: COORDINACIÓN (CIMT-Light Mano Izquierda)*
- Total toques logrados: ${cimtHits}
- Tiempo de reacción promedio: ${avgCimtReaction > 0 ? `${(avgCimtReaction / 1000).toFixed(2)}s` : "Sin datos"}

💪 _¡Seguimos estimulando la neuroplasticidad de Oscar!_`;
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  return (
    <div className="w-full h-full bg-stone-50 border-4 border-stone-200 rounded-3xl m-2 p-6 overflow-y-auto shadow-inner select-none flex flex-col justify-between">
      
      <div>
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-9 h-9 text-primary-blue animate-pulse" />
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">Panel del Kinesiólogo</h2>
              <p className="text-sm font-semibold text-slate-500">Métricas de neuroplasticidad y coordinación de Oscar</p>
            </div>
          </div>
          <button
            onClick={onClearMetrics}
            disabled={metrics.length === 0}
            className="px-5 py-3 border-2 border-rose-200 hover:border-rose-400 bg-rose-50 text-rose-700 font-bold rounded-xl active:scale-95 transition-all text-base flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            style={{ minHeight: "50px" }}
          >
            <Trash2 className="w-5 h-5" />
            Limpiar Datos
          </button>
        </div>

        {metrics.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <span className="text-6xl mb-4">📈</span>
            <h3 className="text-2xl font-bold text-slate-700 mb-1">Aún no hay métricas registradas</h3>
            <p className="text-slate-500 max-w-md">
              Realiza algunas rondas de juego con Oscar para que los datos aparezcan en este gráfico estadístico.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Tarjeta 1: Rastreo Visual y Hemianopsia */}
            <div className="bg-white border-2 border-stone-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 border-b border-stone-100 pb-2 mb-4 flex items-center gap-2">
                <span>👁️</span> Busca la Estrella (Rastreo Visual)
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Aciertos</span>
                  <p className="text-3xl font-black text-emerald-600">{trackingHits}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Omisiones</span>
                  <p className="text-3xl font-black text-rose-500">{trackingMissed}</p>
                </div>
              </div>

              {/* Indicadores Hemianopsia Izquierda vs Lado Derecho */}
              <div className="space-y-4">
                <div className="border border-stone-100 rounded-xl p-3 bg-blue-50/50">
                  <p className="text-sm font-bold text-slate-700 mb-2">Desempeño Lado Izquierdo (Hemianopsia)</p>
                  <div className="flex justify-between text-sm mb-1 text-slate-600">
                    <span>Aciertos: <strong>{trackingLeftHits}</strong></span>
                    <span>Omitidas: <strong className="text-rose-600">{trackingLeftMissed}</strong></span>
                  </div>
                  <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-blue h-full transition-all" 
                      style={{ 
                        width: `${trackingLeftHits + trackingLeftMissed > 0 
                          ? (trackingLeftHits / (trackingLeftHits + trackingLeftMissed)) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="border border-stone-100 rounded-xl p-3">
                  <p className="text-sm font-bold text-slate-700 mb-2">Tiempos de Reacción Promedio</p>
                  <div className="grid grid-cols-2 gap-2 text-center text-slate-700">
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-xs text-stone-500 block">Izquierda</span>
                      <strong className="text-lg">{avgReactionLeft > 0 ? `${(avgReactionLeft / 1000).toFixed(2)}s` : "-"}</strong>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-xs text-stone-500 block">Derecha</span>
                      <strong className="text-lg">{avgReactionRight > 0 ? `${(avgReactionRight / 1000).toFixed(2)}s` : "-"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Memoria & Coordinación */}
            <div className="space-y-6">
              
              {/* Memotest */}
              <div className="bg-white border-2 border-stone-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 border-b border-stone-100 pb-2 mb-4 flex items-center gap-2">
                  <span>🧠</span> Memoria (Memotest)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase font-sans">Rondas Ganadas</span>
                    <p className="text-3xl font-black text-primary-blue">{memoryCompletions}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Promedio Errores</span>
                    <p className="text-3xl font-black text-slate-700">
                      {memoryCompletions > 0 ? avgMemoryErrors : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinación CIMT */}
              <div className="bg-white border-2 border-stone-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 border-b border-stone-100 pb-2 mb-4 flex items-center gap-2">
                  <span>🖐️</span> Coordinación (CIMT-Light Mano Izq)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Toques Registrados</span>
                    <p className="text-3xl font-black text-emerald-600">{cimtHits}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Velocidad Promedio</span>
                    <p className="text-3xl font-black text-slate-700">
                      {avgCimtReaction > 0 ? `${(avgCimtReaction / 1000).toFixed(2)}s` : "-"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Botón de envío a WhatsApp y Portapapeles (Accesible abajo) */}
      {metrics.length > 0 && (
        <div className="border-t border-stone-200 pt-6 mt-4 flex justify-end">
          <button
            onClick={handleCopyReport}
            className={`px-8 py-5 text-white font-extrabold text-2xl rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-3 justify-center min-w-[280px] ${
              copied ? "bg-emerald-600" : "bg-primary-blue"
            }`}
            style={{ minHeight: "80px" }}
          >
            {copied ? (
              <>
                <Check className="w-8 h-8" />
                ¡Copiado con Éxito!
              </>
            ) : (
              <>
                <Copy className="w-8 h-8" />
                Copiar Reporte WhatsApp
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
