"use client";

import React, { useState, useEffect } from "react";
import { Save, RotateCcw, Image, Heart, Home, Smile, User, Check, Coffee } from "lucide-react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface SettingsProps {
  onSaved: () => void;
}

interface CustomCardConfig {
  id: number;
  label: string;
  icon: string;
  imageUrl?: string;
}

const DEFAULT_CONFIGS: CustomCardConfig[] = [
  { id: 1, label: "Tu Casa", icon: "Home" },
  { id: 2, label: "Hijo Juan", icon: "User" },
  { id: 3, label: "Nieta Sofía", icon: "Smile" },
  { id: 4, label: "Tu Perro 'Tobi'", icon: "Heart" },
  { id: 5, label: "Tu Mate", icon: "Mate" },
  { id: 6, label: "Hija María", icon: "User2" }
];

const AVAILABLE_ICONS = [
  { name: "Home", label: "Casa" },
  { name: "User", label: "Hombre / Hijo" },
  { name: "User2", label: "Mujer / Hija" },
  { name: "Smile", label: "Sonrisa / Nieto" },
  { name: "Heart", label: "Corazón / Amor" },
  { name: "Mate", label: "Mate 🧉" }
];

export default function Settings({ onSaved }: SettingsProps) {
  const { playSuccess, playTap } = useAudioFeedback();
  const [configs, setConfigs] = useState<CustomCardConfig[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    // Cargar configuraciones guardadas o usar valores por defecto
    const saved = localStorage.getItem("oscar_memory_config");
    if (saved) {
      try {
        setConfigs(JSON.parse(saved));
      } catch (e) {
        setConfigs(DEFAULT_CONFIGS);
      }
    } else {
      setConfigs(DEFAULT_CONFIGS);
    }
  }, []);

  const handleLabelChange = (id: number, val: string) => {
    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, label: val } : c))
    );
  };

  const handleIconChange = (id: number, val: string) => {
    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, icon: val } : c))
    );
  };

  const handleUrlChange = (id: number, val: string) => {
    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, imageUrl: val } : c))
    );
  };

  const handleSave = () => {
    playSuccess();
    localStorage.setItem("oscar_memory_config", JSON.stringify(configs));
    setSuccessMsg(true);
    onSaved();
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleRestore = () => {
    playTap();
    if (window.confirm("¿Seguro que deseas restablecer los valores de prueba por defecto?")) {
      setConfigs(DEFAULT_CONFIGS);
      localStorage.setItem("oscar_memory_config", JSON.stringify(DEFAULT_CONFIGS));
      setSuccessMsg(true);
      onSaved();
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="w-full h-full bg-stone-50 border-4 border-stone-200 rounded-3xl m-2 p-6 overflow-y-auto shadow-inner select-none flex flex-col justify-between">
      
      <div>
        <div className="border-b border-stone-200 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800">Saliencia Personal (Memotest)</h2>
          <p className="text-sm font-semibold text-slate-500">
            Personaliza los 6 elementos del juego de memoria con fotos de familiares, mascotas o lugares conocidos para motivar a Oscar.
          </p>
        </div>

        {/* Formulario de 6 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {configs.map((config, index) => (
            <div key={config.id} className="bg-white border-2 border-stone-200 p-4 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-base font-black text-slate-700">Tarjeta {index + 1}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-stone-100 rounded text-slate-500">Pareja {config.id}</span>
              </div>

              {/* Nombre de la tarjeta */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-slate-600">Nombre / Parentesco (Ej. "Hijo Juan")</label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => handleLabelChange(config.id, e.target.value)}
                  className="px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-primary-blue focus:outline-none font-bold text-slate-700 text-lg"
                  placeholder="Nombre de la foto"
                />
              </div>

              {/* URL de imagen o Icono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">Ícono Representativo</label>
                  <select
                    value={config.icon}
                    onChange={(e) => handleIconChange(config.id, e.target.value)}
                    className="px-3 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-primary-blue focus:outline-none font-bold text-slate-700 text-base"
                  >
                    {AVAILABLE_ICONS.map(item => (
                      <option key={item.name} value={item.name}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-600">URL Foto (Opcional)</label>
                  <input
                    type="text"
                    value={config.imageUrl || ""}
                    onChange={(e) => handleUrlChange(config.id, e.target.value)}
                    className="px-3 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-primary-blue focus:outline-none text-slate-700 text-sm truncate"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Guardar / Reset - Táctiles en la parte inferior */}
      <div className="border-t border-stone-200 pt-6 mt-4 flex items-center justify-between gap-4">
        <button
          onClick={handleRestore}
          className="px-6 py-4 border-2 border-stone-300 hover:border-slate-400 bg-stone-200 text-slate-700 font-bold text-xl rounded-2xl active:scale-95 transition-all flex items-center gap-2"
          style={{ minHeight: "80px" }}
        >
          <RotateCcw className="w-6 h-6" />
          Restablecer Predeterminados
        </button>

        <div className="flex items-center gap-4">
          {successMsg && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 font-bold animate-pulse text-lg">
              <Check className="w-6 h-6" />
              <span>¡Guardado correctamente!</span>
            </div>
          )}

          <button
            onClick={handleSave}
            className="px-8 py-5 bg-primary-blue text-white font-extrabold text-2xl rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-3 justify-center min-w-[220px]"
            style={{ minHeight: "80px" }}
          >
            <Save className="w-8 h-8" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
