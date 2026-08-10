"use client";

import React, { useState, useEffect } from "react";
import { Target, Brain, Hand, BarChart3, Settings as SettingsIcon } from "lucide-react";
import VisualTracking from "@/components/VisualTracking";
import MemoryGame from "@/components/MemoryGame";
import CimtCoordination from "@/components/CimtCoordination";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

type Tab = "tracking" | "memory" | "cimt" | "dashboard" | "settings";

interface Metric {
  game: 'tracking' | 'memory' | 'cimt';
  timestamp: number;
  success: boolean;
  reactionTime?: number;
  side?: 'left' | 'right';
  errorsCount?: number;
}

export default function Home() {
  const { playTap, initAudio } = useAudioFeedback();
  const [activeTab, setActiveTab] = useState<Tab>("tracking");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [memoryKey, setMemoryKey] = useState(0); // Clave para reiniciar el Memotest cuando cambie la configuración

  // Cargar métricas guardadas de localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("oscar_rehab_metrics");
      if (saved) {
        try {
          setMetrics(JSON.parse(saved));
        } catch (e) {
          console.error("Error al cargar métricas", e);
        }
      }
    }
  }, []);

  const handleRecordMetric = (newMetric: Omit<Metric, 'timestamp'>) => {
    const metricWithTime: Metric = {
      ...newMetric,
      timestamp: Date.now()
    };
    
    setMetrics(prev => {
      const updated = [...prev, metricWithTime];
      if (typeof window !== "undefined") {
        localStorage.setItem("oscar_rehab_metrics", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearMetrics = () => {
    if (window.confirm("¿Seguro que deseas borrar el historial de métricas de Oscar?")) {
      playTap();
      setMetrics([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("oscar_rehab_metrics");
      }
    }
  };

  const handleTabChange = (tab: Tab) => {
    // Inicializa el contexto de audio con la primera interacción del usuario en iPad
    initAudio();
    playTap();
    setActiveTab(tab);
  };

  const handleSettingsSaved = () => {
    // Al guardar configuraciones, incrementamos la key para obligar al Memotest a remontarse con nuevos datos
    setMemoryKey(prev => prev + 1);
  };

  // Botones de navegación situados estratégicamente en el LADO DERECHO
  // debido a la hemianopsia izquierda (Oscar ve mejor el lado derecho).
  const NAV_ITEMS = [
    {
      id: "tracking" as Tab,
      label: "Buscar Estrella",
      sub: "Rastreo Visual",
      icon: <Target className="w-8 h-8 text-primary-blue" />
    },
    {
      id: "memory" as Tab,
      label: "Memotest",
      sub: "Memoria Episódica",
      icon: <Brain className="w-8 h-8 text-indigo-600" />
    },
    {
      id: "cimt" as Tab,
      label: "Mano Izquierda",
      sub: "Coordinación Motora",
      icon: <Hand className="w-8 h-8 text-emerald-600" />
    },
    {
      id: "dashboard" as Tab,
      label: "Panel Terapeuta",
      sub: "Ver Estadísticas",
      icon: <BarChart3 className="w-8 h-8 text-amber-600" />
    },
    {
      id: "settings" as Tab,
      label: "Configuración",
      sub: "Saliencia Personal",
      icon: <SettingsIcon className="w-8 h-8 text-slate-600" />
    }
  ];

  return (
    <div className="flex flex-row h-screen w-screen bg-stone-50 overflow-hidden font-sans">
      {/* 1. LADO IZQUIERDO: Área de juego / contenido interactivo principal */}
      <main className="flex-grow h-full flex flex-col p-3 z-10 relative">
        
        {/* Encabezado Principal Limpio */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border border-stone-200 rounded-2xl mb-2 shadow-sm select-none">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Suite de Estimulación "Oscar"</h1>
              <p className="text-xs font-semibold text-slate-400">Rehabilitación Neurocognitiva ACV</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-50 text-primary-blue font-bold text-xs rounded-full uppercase border border-blue-100 shadow-sm">
              iPad Touch-First
            </span>
          </div>
        </header>

        {/* Pantalla Activa de Juego o Datos */}
        <div className="flex-grow w-full overflow-hidden relative">
          {activeTab === "tracking" && (
            <VisualTracking onRecordMetric={handleRecordMetric} />
          )}
          {activeTab === "memory" && (
            <MemoryGame key={memoryKey} onRecordMetric={handleRecordMetric} />
          )}
          {activeTab === "cimt" && (
            <CimtCoordination onRecordMetric={handleRecordMetric} />
          )}
          {activeTab === "dashboard" && (
            <Dashboard metrics={metrics} onClearMetrics={handleClearMetrics} />
          )}
          {activeTab === "settings" && (
            <Settings onSaved={handleSettingsSaved} />
          )}
        </div>
      </main>

      {/* 2. LADO DERECHO: Menú de Navegación Principal (Fácil acceso visual para Oscar) */}
      <aside className="w-[280px] h-full bg-stone-100 border-l border-stone-200 p-4 flex flex-col justify-between select-none z-20">
        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-stone-200">
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Menú de Navegación</p>
            <p className="text-xs font-semibold text-slate-500">Usa tu mano derecha</p>
          </div>

          <nav className="space-y-3">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 shadow-sm ${
                    isActive
                      ? "bg-white border-primary-blue text-primary-blue scale-102"
                      : "bg-stone-50 border-stone-200 text-slate-700 hover:bg-white"
                  }`}
                  style={{ minHeight: "82px" }} // Área de toque táctil de 82px
                >
                  <div className="p-1 bg-stone-100 rounded-lg">{item.icon}</div>
                  <div className="text-left">
                    <p className="text-lg font-extrabold leading-tight tracking-tight">{item.label}</p>
                    <p className="text-xs font-semibold text-slate-400">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie de navegación lateral */}
        <div className="text-center text-xs text-slate-400 font-semibold border-t border-stone-200 pt-3">
          <p>Kinesiología & Terapia Ocupacional</p>
          <p className="mt-0.5 opacity-75">v1.2.0</p>
        </div>
      </aside>
    </div>
  );
}
