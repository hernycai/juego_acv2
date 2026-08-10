"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, Play, Pause, RotateCcw, Target } from "lucide-react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface VisualTrackingProps {
  onRecordMetric: (metric: {
    game: 'tracking';
    success: boolean;
    reactionTime?: number;
    side?: 'left' | 'right';
  }) => void;
}

interface StarItem {
  id: number;
  x: number; // porcentaje (10 a 90)
  y: number; // porcentaje (15 a 85)
  color: string;
  side: "left" | "right";
  spawnTime: number;
}

const STAR_COLORS = [
  "text-blue-600",
  "text-amber-500",
  "text-emerald-600",
  "text-rose-600",
  "text-violet-600"
];

export default function VisualTracking({ onRecordMetric }: VisualTrackingProps) {
  const { playSuccess, playTap } = useAudioFeedback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStar, setCurrentStar] = useState<StarItem | null>(null);
  const [score, setScore] = useState({ hits: 0, missed: 0 });
  const [reactionTimes, setReactionTimes] = useState<{ left: number[]; right: number[] }>({
    left: [],
    right: []
  });

  const starTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const starIdCounterRef = useRef(0);

  // Genera una nueva estrella respetando el 70% en el margen izquierdo
  const spawnStar = useCallback(() => {
    if (starTimeoutRef.current) {
      clearTimeout(starTimeoutRef.current);
    }

    const id = ++starIdCounterRef.current;
    const isLeft = Math.random() < 0.70; // 70% de probabilidad para la izquierda
    
    // Coordenadas limitadas para evitar los bordes extremos del iPad
    let x = 0;
    if (isLeft) {
      // Lado izquierdo: 12% a 45% de la pantalla
      x = Math.floor(Math.random() * 33) + 12;
    } else {
      // Lado derecho: 55% a 88% de la pantalla
      x = Math.floor(Math.random() * 33) + 55;
    }
    
    // Altura: 15% a 80% para evitar tapar controles
    const y = Math.floor(Math.random() * 65) + 15;
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const side = isLeft ? "left" : "right";

    setCurrentStar({
      id,
      x,
      y,
      color,
      side,
      spawnTime: performance.now()
    });

    // Tiempo máximo para tocar la estrella: 8 segundos
    starTimeoutRef.current = setTimeout(() => {
      handleStarMissed(side);
    }, 8000);
  }, []);

  // Maneja el caso en que la estrella no es tocada a tiempo
  const handleStarMissed = useCallback((side: "left" | "right") => {
    setScore(prev => ({ ...prev, missed: prev.missed + 1 }));
    
    // Registrar métrica de fracaso/escapada
    onRecordMetric({
      game: "tracking",
      success: false,
      side
    });

    if (isPlaying) {
      spawnStar();
    }
  }, [isPlaying, spawnStar, onRecordMetric]);

  // Maneja el toque exitoso en la estrella
  const handleStarClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Evita clicks fantasmas
    if (!currentStar) return;

    if (starTimeoutRef.current) {
      clearTimeout(starTimeoutRef.current);
    }

    const clickTime = performance.now();
    const duration = clickTime - currentStar.spawnTime;

    // Vibrar si el dispositivo lo soporta (iPad Safari no lo soporta de forma nativa, pero se implementa de manera segura)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80);
    }

    // Feedback sonoro inmediato
    playSuccess();

    setScore(prev => ({ ...prev, hits: prev.hits + 1 }));
    setReactionTimes(prev => {
      const side = currentStar.side;
      return {
        ...prev,
        [side]: [...prev[side], duration]
      };
    });

    // Registrar métrica exitosa
    onRecordMetric({
      game: "tracking",
      success: true,
      reactionTime: duration,
      side: currentStar.side
    });

    if (isPlaying) {
      // Spawn inmediato de la siguiente
      spawnStar();
    } else {
      setCurrentStar(null);
    }
  };

  // Efecto para controlar el ciclo de juego
  useEffect(() => {
    if (isPlaying) {
      spawnStar();
    } else {
      if (starTimeoutRef.current) {
        clearTimeout(starTimeoutRef.current);
      }
      setCurrentStar(null);
    }

    return () => {
      if (starTimeoutRef.current) {
        clearTimeout(starTimeoutRef.current);
      }
    };
  }, [isPlaying, spawnStar]);

  const togglePlay = () => {
    playTap();
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    playTap();
    setIsPlaying(false);
    setCurrentStar(null);
    setScore({ hits: 0, missed: 0 });
    setReactionTimes({ left: [], right: [] });
  };

  // Calcular tiempos de reacción promedio
  const getAverageTime = (side: "left" | "right") => {
    const list = reactionTimes[side];
    if (list.length === 0) return 0;
    const sum = list.reduce((a, b) => a + b, 0);
    return Math.round(sum / list.length);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Área de juego (Lado izquierdo y central dominante) */}
      <div className="relative flex-grow bg-stone-50 border-4 border-stone-200 rounded-3xl m-2 overflow-hidden shadow-inner select-none">
        
        {/* Guías visuales sutiles del campo visual */}
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-stone-200/50 pointer-events-none flex items-center justify-start pl-4">
          <span className="text-xs text-stone-300 font-medium tracking-wider uppercase">Campo Visual Izquierdo (70% Estímulos)</span>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-50/90 z-10">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Target className="w-16 h-16 text-primary-blue" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Busca la Estrella</h2>
            <p className="text-lg text-slate-600 max-w-md mb-6 leading-relaxed">
              Aparecerán estrellas en diferentes partes de la pantalla. Tocalas tan rápido como puedas.
              <br />
              <span className="font-semibold text-primary-blue">Focaliza tu mirada hacia el lado izquierdo.</span>
            </p>
            <button
              onClick={togglePlay}
              className="px-8 py-5 bg-primary-blue text-white rounded-2xl font-bold text-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-3 min-w-[200px] justify-center"
              style={{ minHeight: "80px" }}
            >
              <Play className="w-8 h-8 fill-current" />
              Comenzar
            </button>
          </div>
        )}

        {/* Estrella activa */}
        {isPlaying && currentStar && (
          <button
            key={currentStar.id}
            onMouseDown={handleStarClick}
            onTouchStart={handleStarClick}
            className="absolute p-6 active:scale-90 transition-transform cursor-pointer focus:outline-none"
            style={{
              left: `${currentStar.x}%`,
              top: `${currentStar.y}%`,
              transform: "translate(-50%, -50%)",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20
            }}
          >
            <Star 
              className={`w-20 h-20 filter drop-shadow-md ${currentStar.color} fill-current animate-pulse`}
              style={{ pointerEvents: "none" }}
            />
          </button>
        )}
      </div>

      {/* Controles de juego y marcador - Diseñados para estar accesibles en la parte inferior */}
      <div className="h-32 bg-stone-100 border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-20">
        
        {/* Información de Progreso */}
        <div className="flex gap-8 items-center">
          <div className="text-slate-700">
            <p className="text-xs font-semibold uppercase text-slate-500">Aciertos</p>
            <p className="text-4xl font-extrabold text-emerald-600">{score.hits}</p>
          </div>
          <div className="text-slate-700">
            <p className="text-xs font-semibold uppercase text-slate-500">Omitidas</p>
            <p className="text-4xl font-extrabold text-rose-500">{score.missed}</p>
          </div>
          <div className="hidden md:flex gap-6 border-l border-stone-300 pl-6 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-500">Reac. Izquierda:</span>{" "}
              <span className="font-bold text-slate-800">
                {getAverageTime("left") > 0 ? `${(getAverageTime("left") / 1000).toFixed(2)}s` : "-"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Reac. Derecha:</span>{" "}
              <span className="font-bold text-slate-800">
                {getAverageTime("right") > 0 ? `${(getAverageTime("right") / 1000).toFixed(2)}s` : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Control - Gigantes y del lado derecho */}
        <div className="flex items-center gap-4">
          {isPlaying && (
            <button
              onClick={togglePlay}
              className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl shadow-md active:scale-95 transition-transform flex items-center gap-2"
              style={{ minHeight: "80px", minWidth: "140px", justifyContent: "center" }}
            >
              <Pause className="w-6 h-6 fill-current" />
              Pausar
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="px-6 py-4 bg-stone-300 text-slate-800 rounded-2xl font-bold text-xl shadow-md active:scale-95 transition-transform flex items-center gap-2"
            style={{ minHeight: "80px", minWidth: "140px", justifyContent: "center" }}
          >
            <RotateCcw className="w-6 h-6" />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
