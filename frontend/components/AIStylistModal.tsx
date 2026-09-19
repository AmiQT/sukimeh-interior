"use client";
import { useDialog } from "@/lib/useDialog";

import React, { useState } from "react";
import { X, Sparkles, Wand2, Compass, Check, ArrowRight, Lightbulb } from "lucide-react";

export interface StylePreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  tagline: string;
  focus: string;
  description: string;
  recommendedKeywords: string[];
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "japandi",
    name: "Japandi & Minimalist Zen",
    badge: "NATURAL CALM",
    icon: "🌿",
    tagline: "Ketenangan semulajadi, perabot rendah & pengudaraan optimum",
    focus: "Airflow + Declutter",
    description: "Gabungan estetika Jepun & Skandinavia. Menitikberatkan ruang bernafas, pencahayaan lembut, dan susun atur tanpa halangan.",
    recommendedKeywords: ["Almari gelongsor", "Katil rendah", "Kipas angin senyap", "Zon solat/rehat"],
  },
  {
    id: "scandinavian",
    name: "Nordic Scandinavian Living",
    badge: "COZY COMFORT",
    icon: "❄️",
    tagline: "Lounge hangat, sudut pandangan TV pawagam & coffee nook",
    focus: "Ergonomics + Viewing Angle",
    description: "Ruang santai keluarga dengan sofa L-Shape berorientasikan TV bebas silau dan meja kopi kayu walnut.",
    recommendedKeywords: ["L-Sofa empuk", "TV 65-inci Glare-Free", "Meja Kopi Walnut", "Laluan 90cm"],
  },
  {
    id: "smart_haven",
    name: "Cyber Smart Haven",
    badge: "TECH INTEGRATED",
    icon: "🎮",
    tagline: "Liputan WiFi 6E mesh penuh, sensor suhu & automasi pintar",
    focus: "WiFi 6E + Smart Sensors",
    description: "Rumah pintar masa depan dengan penghala WiFi berpusat, pengesan iklim pintar, dan peralatan elektrik cekap tenaga.",
    recommendedKeywords: ["Smart WiFi Router", "Mesh Extender", "Smart Sensor C1", "Inverter Fridge"],
  },
  {
    id: "executive_wfh",
    name: "Executive WFH & Creative Studio",
    badge: "PRODUCTIVITY",
    icon: "💼",
    tagline: "Zon fokus kerja akustik, ergonomik & sudut mesyuarat video",
    focus: "Productivity + Lighting",
    description: "Dioptimumkan untuk profesional yang bekerja dari rumah. Menjarakkan ruang tidur dari meja kerja untuk keseimbangan fokus.",
    recommendedKeywords: ["Monitor / Screen besar", "Sudut tenang", "Ventilasi tingkap", "Kamera video angle"],
  },
  {
    id: "gourmet_chef",
    name: "Gourmet Chef & Culinary Loft",
    badge: "CULINARY FLOW",
    icon: "🍳",
    tagline: "Segitiga kerja dapur pantas (Hood-Hob-Fridge) & ventilasi ekzos",
    focus: "Work Triangle < 6m",
    description: "Reka bentuk dapur pakar dengan ekzos terus ke tingkap dan jarak ideal antara peti sejuk, dapur memasak, dan sinki.",
    recommendedKeywords: ["Smart Hood X5", "Gas Hob G4 Pro", "Peti Sejuk Side-by-Side", "Dishwasher"],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (preset: StylePreset, customPrompt: string) => void;
  isLoading: boolean;
}

export default function AIStylistModal({ isOpen, onClose, onApplyStyle, isLoading }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState("");

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyStyle(selectedPreset, customPrompt);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Gaya ruang" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-navy-100 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy-700 text-white px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold font-display flex items-center gap-1.5 sm:gap-2 truncate">
                <span>AI Auto-Room Stylist</span>
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-sans tracking-wide">
                  DEEPSEEK V4
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-navy-200 mt-0.5 line-clamp-1">
                Pilih tema gaya hiasan dalaman atau taip arahan suasana bilik anda
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup pilihan gaya"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Preset Selector */}
          <div>
            <label className="text-[11px] sm:text-xs font-bold text-navy-600 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              Pilih Konsep & Vibe Rekaan:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {STYLE_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                      isSelected
                        ? "border-navy bg-navy-50/60 shadow-md ring-2 ring-navy/10"
                        : "border-navy-100 bg-white hover:border-navy-200 hover:bg-navy-50/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl sm:text-2xl">{preset.icon}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-navy text-white" : "bg-navy-100 text-navy-600"
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-navy-700">{preset.name}</h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {preset.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-navy-100/60 flex items-center justify-between text-[10px] text-navy-500 font-semibold">
                      <span>🎯 {preset.focus}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent font-black" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt Box */}
          <div>
            <label className="text-[11px] sm:text-xs font-bold text-navy-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              Arahan Tambahan / Citarasa Tersuai (Opsional):
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`cth: "Susun bilik tidur agar kepala katil menghadap dinding selamat, meja kerja dekat tingkap..."`}
              className="w-full text-xs p-3 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-navy-800 placeholder-gray-400 bg-navy-50/30 transition-all resize-none"
            />

            {/* Quick keyword chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-gray-400 font-medium py-0.5">Cadangan:</span>
              {selectedPreset.recommendedKeywords.map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setCustomPrompt((prev) => (prev ? `${prev}, ${kw}` : `Utamakan ${kw}`))
                  }
                  className="text-[10px] bg-navy-100/80 hover:bg-navy-200 text-navy-600 px-2 py-0.5 rounded-full transition-colors font-medium active:scale-95"
                >
                  + {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-navy-100 flex items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Tutup pilihan gaya"
            onClick={onClose}
              className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-accent to-accent-500 hover:from-accent-500 hover:to-accent text-white shadow-card hover:shadow-hover transition-all disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Jana Rekaan AI ({selectedPreset.name.split("&")[0].trim()})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
