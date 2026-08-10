"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Hand, Settings as SettingsIcon } from "lucide-react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface CimtCoordinationProps {
  onRecordMetric: (metric: {
    game: 'cimt';
    success: boolean;
    reactionTime?: number;
    side?: 'left' | 'right';
  }) => void;
}

export default function CimtCoordination({ onRecordMetric }: CimtCoordinationProps) {
  const { playSuccess, playTap } = useAudioFeedback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ x: 30, y: 50 }); // en porcentajes
  const [score, setScore] = useState(0);
  const [speedSetting, setSpeedSetting] = useState<"lento" | "medio" | "rapido">("lento");
  const [lastTapTime, setLastTapTime] = useState<number | null>(null);

  const requestRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0.12, y: 0.08 }); // Velocidad en % por frame
  const positionRef = useRef({ x: 30, y: 50 });

  // Ajustar velocidades según configuración
  const getSpeedMultiplier = () => {
    switch (speedSetting) {
      case "rapido": return 2.2;
      case "medio": return 1.5;
      case "lento":
      default:
        return 0.8;
    }
  };

  const updateMovement = useCallback(() => {
    if (!isPlaying) return;

    let { x, y } = positionRef.current;
    let { x: vx, y: vy } = velocityRef.current;
    const mult = getSpeedMultiplier();

    // Siguiente posición
    let nextX = x + vx * mult;
    let nextY = y + vy * mult;

    // Límites de rebote (porcentajes de área)
    if (nextX <= 10) {
      nextX = 10;
      vx = Math.abs(vx); // Rebota a la derecha
    } else if (nextX >= 90) {
      nextX = 90;
      vx = -Math.abs(vx); // Rebota a la izquierda
    }

    if (nextY <= 12) {
      nextY = 12;
      vy = Math.abs(vy); // Rebota hacia abajo
    } else if (nextY >= 85) {
      nextY = 85;
      vy = -Math.abs(vy); // Rebota hacia arriba
    }

    // Sesgo hacia la izquierda (Anti-Negligencia):
    // Si el botón cruza al lado derecho (x > 50), aumentamos la probabilidad
    // de que rebote de vuelta a la izquierda rápidamente.
    if (nextX > 55 && Math.random() < 0.02) {
      vx = -Math.abs(vx); // Forzar dirección a la izquierda sutilmente
    }

    positionRef.current = { x: nextX, y: nextY };
    velocityRef.current = { x: vx, y: vy };
    setPosition({ x: nextX, y: nextY });

    requestRef.current = requestAnimationFrame(updateMovement);
  }, [isPlaying, speedSetting]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateMovement);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, updateMovement]);

  const handleButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;

    const now = performance.now();
    let reactionTime: number | undefined;

    if (lastTapTime !== null) {
      reactionTime = now - lastTapTime;
    }
    setLastTapTime(now);

    // Feedback táctil y sonoro
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }
    playSuccess();

    setScore(prev => prev + 1);

    // Determinar de qué lado de la pantalla estaba el botón al tocarlo
    const clickedSide: 'left' | 'right' = position.x < 50 ? 'left' : 'right';

    onRecordMetric({
      game: 'cimt',
      success: true,
      reactionTime,
      side: clickedSide
    });

    // Pequeño cambio aleatorio de dirección al tocar para hacerlo interactivo
    velocityRef.current = {
      x: (Math.random() > 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.08),
      y: (Math.random() > 0.5 ? 1 : -1) * (0.06 + Math.random() * 0.06)
    };
  };

  const togglePlay = () => {
    playTap();
    setIsPlaying(prev => !prev);
    if (!isPlaying) {
      setLastTapTime(performance.now());
    }
  };

  const handleReset = () => {
    playTap();
    setIsPlaying(false);
    setPosition({ x: 30, y: 50 });
    positionRef.current = { x: 30, y: 50 };
    velocityRef.current = { x: 0.12, y: 0.08 };
    setScore(0);
    setLastTapTime(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Área de Movimiento (Predominancia izquierda) */}
      <div className="relative flex-grow bg-stone-50 border-4 border-stone-200 rounded-3xl m-2 overflow-hidden shadow-inner select-none">
        
        {/* Línea divisoria sutil para visualización */}
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-stone-200/50 pointer-events-none flex items-center justify-start pl-4">
          <span className="text-xs text-stone-300 font-medium tracking-wider uppercase">Foco de Movimiento Izquierdo</span>
        </div>

        {/* Mensaje de instrucción persistente o de bienvenida */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-50/95 z-10">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Hand className="w-16 h-16 text-primary-blue" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Coordinación Mano Izquierda</h2>
            
            {/* Mensaje clínico específico */}
            <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl max-w-md mb-6 shadow-sm">
              <p className="text-xl font-bold text-amber-800 mb-1">¡Aviso Importante!</p>
              <p className="text-lg font-bold text-slate-700 leading-relaxed">
                "Oscar, intenta tocar este botón usando <span className="underline text-red-600">solo tu mano izquierda</span>."
              </p>
            </div>

            <p className="text-base text-slate-500 mb-6 max-w-sm">
              El botón azul se moverá despacio. Síguelo con la mirada y tócalo para acumular puntos. Tómate el tiempo que necesites.
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

        {/* El botón móvil gigante (diámetro mínimo 110px para paresia) */}
        {isPlaying && (
          <button
            onMouseDown={handleButtonClick}
            onTouchStart={handleButtonClick}
            className="absolute rounded-full bg-primary-blue text-white font-extrabold text-lg flex flex-col items-center justify-center border-4 border-blue-900 shadow-2xl active:scale-90 transition-transform focus:outline-none"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
              width: "115px",
              height: "115px",
              touchAction: "none",
              zIndex: 20
            }}
          >
            <span className="text-sm uppercase tracking-wider opacity-75">Tócame</span>
            <span className="text-2xl">👈</span>
          </button>
        )}
      </div>

      {/* Controles y marcador en la parte inferior */}
      <div className="h-32 bg-stone-100 border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-20">
        
        {/* Información del juego */}
        <div className="flex gap-8 items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Toques con Mano Izquierda</p>
            <p className="text-4xl font-extrabold text-emerald-600">{score}</p>
          </div>

          {/* Selector de velocidad (Tamaño grande para dedos) */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Velocidad del Botón</span>
            <div className="flex bg-stone-200 p-1 rounded-xl border border-stone-300">
              {(["lento", "medio", "rapido"] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    playTap();
                    setSpeedSetting(speed);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase transition-all ${
                    speedSetting === speed
                      ? "bg-primary-blue text-white shadow-sm"
                      : "text-slate-600 hover:bg-stone-300 active:bg-stone-400"
                  }`}
                  style={{ minHeight: "44px" }} // Área de toque de asistencia
                >
                  {speed === "lento" ? "Lenta" : speed === "medio" ? "Media" : "Rápida"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controles de juego */}
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
