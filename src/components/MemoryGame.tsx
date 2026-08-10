"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle, RefreshCw, Eye, Heart, Home, Smile, ShieldAlert, Award } from "lucide-react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface MemoryGameProps {
  onRecordMetric: (metric: {
    game: 'memory';
    success: boolean;
    errorsCount: number;
  }) => void;
}

interface CustomCardConfig {
  id: number;
  label: string;
  icon: string;
  imageUrl?: string;
}

// Tarjetas iniciales por defecto (Relevancia personal simulada)
const DEFAULT_CARDS_CONFIG: CustomCardConfig[] = [
  { id: 1, label: "Tu Casa", icon: "Home" },
  { id: 2, label: "Hijo Juan", icon: "User" },
  { id: 3, label: "Nieta Sofía", icon: "Smile" },
  { id: 4, label: "Tu Perro 'Tobi'", icon: "Heart" },
  { id: 5, label: "Tu Mate", icon: "Mate" },
  { id: 6, label: "Hija María", icon: "User2" }
];

interface CardInstance {
  uniqueId: number;
  pairId: number;
  label: string;
  icon: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame({ onRecordMetric }: MemoryGameProps) {
  const { playCorrectMatch, playError, playTap } = useAudioFeedback();
  
  const [cards, setCards] = useState<CardInstance[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // Índices seleccionados
  const [attempts, setAttempts] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [failedPairsCount, setFailedPairsCount] = useState<Record<number, number>>({}); // pairId -> fallos acumulados
  const [glowTarget, setGlowTarget] = useState<number | null>(null); // pairId de la carta que debe brillar
  const [isWon, setIsWon] = useState(false);

  // Inicializar juego
  const initGame = useCallback(() => {
    // Intentar leer configuración personalizada de localStorage
    let configs = DEFAULT_CARDS_CONFIG;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("oscar_memory_config");
      if (saved) {
        try {
          configs = JSON.parse(saved);
        } catch (e) {
          console.error("Error al cargar configuración de memotest", e);
        }
      }
    }

    // Duplicar para crear las parejas
    const deck: CardInstance[] = [];
    let uniqueId = 0;
    configs.forEach(config => {
      // Primera carta de la pareja
      deck.push({
        uniqueId: uniqueId++,
        pairId: config.id,
        label: config.label,
        icon: config.icon,
        imageUrl: config.imageUrl,
        isFlipped: false,
        isMatched: false
      });
      // Segunda carta de la pareja
      deck.push({
        uniqueId: uniqueId++,
        pairId: config.id,
        label: config.label,
        icon: config.icon,
        imageUrl: config.imageUrl,
        isFlipped: false,
        isMatched: false
      });
    });

    // Mezclar
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setAttempts(0);
    setMatchesCount(0);
    setErrorsCount(0);
    setFailedPairsCount({});
    setGlowTarget(null);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    const card = cards[index];
    if (card.isFlipped || card.isMatched || selectedCards.length >= 2) return;

    playTap();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    // Si es la primera carta de la selección y tiene historial de fallos altos,
    // activamos el destello de ayuda en su carta gemela.
    if (newSelected.length === 1) {
      const firstCard = newCards[index];
      const previousFailures = failedPairsCount[firstCard.pairId] || 0;
      if (previousFailures >= 2) {
        setGlowTarget(firstCard.pairId); // Forzar brillo en la pareja correcta
      } else {
        setGlowTarget(null);
      }
    }

    // Evaluar pareja
    if (newSelected.length === 2) {
      setGlowTarget(null); // Quitar destello al completar la selección
      const firstIdx = newSelected[0];
      const secondIdx = newSelected[1];
      const cardA = cards[firstIdx];
      const cardB = cards[secondIdx];

      setAttempts(prev => prev + 1);

      if (cardA.pairId === cardB.pairId) {
        // ¡Coincidencia exitosa!
        setTimeout(() => {
          playCorrectMatch();
          const matchedDeck = cards.map((c, idx) => {
            if (idx === firstIdx || idx === secondIdx) {
              return { ...c, isMatched: true };
            }
            return c;
          });
          setCards(matchedDeck);
          setSelectedCards([]);
          
          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          // Limpiar contador de fallos para esta pareja
          setFailedPairsCount(prev => ({ ...prev, [cardA.pairId]: 0 }));

          // Verificar victoria (6 parejas ganadas)
          if (newMatches === 6) {
            setIsWon(true);
            onRecordMetric({
              game: "memory",
              success: true,
              errorsCount: errorsCount
            });
          }
        }, 600);
      } else {
        // Fallo en la coincidencia
        setTimeout(() => {
          playError();
          const resetDeck = cards.map((c, idx) => {
            if (idx === firstIdx || idx === secondIdx) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setCards(resetDeck);
          setSelectedCards([]);
          setErrorsCount(prev => prev + 1);

          // Registrar fallo para este ID de pareja
          setFailedPairsCount(prev => {
            const count = (prev[cardA.pairId] || 0) + 1;
            return { ...prev, [cardA.pairId]: count };
          });
        }, 1200);
      }
    }
  };

  const renderIcon = (iconName: string) => {
    const props = { className: "w-16 h-16 text-slate-800" };
    switch (iconName) {
      case "Home": return <Home {...props} />;
      case "Heart": return <Heart {...props} className={`${props.className} text-rose-500 fill-current`} />;
      case "Smile": return <Smile {...props} />;
      case "User":
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-bold text-slate-800 text-xl border-2 border-slate-700">J</div>
          </div>
        );
      case "User2":
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center font-bold text-slate-800 text-xl border-2 border-slate-700">M</div>
          </div>
        );
      case "Mate":
        return (
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl">🧉</span>
          </div>
        );
      default: return <HelpCircle {...props} />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Tablero (Lado izquierdo y central dominante) */}
      <div className="flex-grow bg-stone-50 border-4 border-stone-200 rounded-3xl m-2 p-6 overflow-y-auto shadow-inner select-none flex items-center justify-center">
        {isWon ? (
          <div className="text-center p-8 bg-stone-50 rounded-3xl max-w-lg shadow-md border border-stone-200">
            <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <Award className="w-20 h-20" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-800 mb-2">¡Felicitaciones Oscar!</h2>
            <p className="text-xl text-slate-600 mb-6">Completaste el juego de memoria con éxito.</p>
            <p className="text-base text-slate-500 mb-8">
              Intentos: <strong className="text-slate-800">{attempts}</strong> | Errores: <strong className="text-slate-800">{errorsCount}</strong>
            </p>
            <button
              onClick={initGame}
              className="px-8 py-5 bg-primary-blue text-white rounded-2xl font-bold text-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-3 justify-center mx-auto"
              style={{ minHeight: "80px" }}
            >
              <RefreshCw className="w-7 h-7" />
              Jugar de Nuevo
            </button>
          </div>
        ) : (
          /* Grid de cartas adaptado para dedos grandes en iPad (mínimo 100px por celda) */
          <div className="grid grid-cols-4 gap-4 w-full max-w-3xl justify-items-center">
            {cards.map((card, idx) => {
              const isCardSelected = selectedCards.includes(idx);
              const showFront = card.isFlipped || card.isMatched;
              
              // Debería brillar si:
              // 1. Es la carta opuesta (no seleccionada) de la pareja que queremos destacar
              // 2. Se ha seleccionado la primera carta de esa pareja
              const shouldGlow = glowTarget === card.pairId && !isCardSelected && !card.isMatched && !card.isFlipped;

              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleCardClick(idx)}
                  className={`w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 transition-all duration-300 transform flex flex-col items-center justify-center p-2 relative active:scale-95 shadow-md ${
                    showFront
                      ? "bg-cream-card border-slate-700"
                      : "bg-primary-blue border-blue-900 text-white"
                  } ${shouldGlow ? "animate-glow border-blue-500" : ""}`}
                  style={{ minHeight: "100px", minWidth: "100px" }}
                >
                  {showFront ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {card.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={card.imageUrl}
                          alt={card.label}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-slate-300 mb-1"
                        />
                      ) : (
                        <div className="mb-1">{renderIcon(card.icon)}</div>
                      )}
                      <span className="text-sm font-extrabold text-slate-800 text-center tracking-tight truncate w-full">
                        {card.label}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <HelpCircle className="w-14 h-14 text-blue-200" />
                    </div>
                  )}

                  {/* Indicador sutil de ayuda contra frustración */}
                  {shouldGlow && (
                    <span className="absolute -top-3 bg-amber-400 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full uppercase border border-amber-600 shadow-sm z-30 animate-bounce">
                      ¡Toca Aquí!
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Controles y marcador en la parte inferior */}
      <div className="h-32 bg-stone-100 border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-20">
        <div className="flex gap-8 items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Parejas Encontradas</p>
            <p className="text-4xl font-extrabold text-emerald-600">{matchesCount} / 6</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Intentos</p>
            <p className="text-4xl font-extrabold text-slate-700">{attempts}</p>
          </div>
          {Object.values(failedPairsCount).some(c => c >= 2) && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 text-sm font-semibold">
              <Eye className="w-5 h-5" />
              <span>Ayuda activada</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={initGame}
            className="px-6 py-4 bg-stone-300 text-slate-800 rounded-2xl font-bold text-xl shadow-md active:scale-95 transition-transform flex items-center gap-2"
            style={{ minHeight: "80px", minWidth: "140px", justifyContent: "center" }}
          >
            <RefreshCw className="w-6 h-6" />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
