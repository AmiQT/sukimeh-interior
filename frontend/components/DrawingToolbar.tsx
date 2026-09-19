"use client";

import React, { useState, useRef, useEffect } from "react";
import { Undo2, Trash2, StopCircle, Box, Sparkles, LayoutTemplate, ChevronDown } from "lucide-react";
import type { DrawTool } from "./DrawingCanvas";
import { ROOM_TEMPLATES, RoomTemplate } from "@/lib/templates";

interface Props {
  tool: DrawTool;
  isDrawingWall: boolean;
  onToolChange: (t: DrawTool) => void;
  onStopDrawing: () => void;
  onUndo: () => void;
  onClear: () => void;
  onLoadTemplate: (template: RoomTemplate) => void;
  onOpenIsometric: () => void;
  onOpenAIStylist: () => void;
}

const TOOLS: { key: DrawTool; label: string; icon: string; tip: string }[] = [
  { key: "wall", label: "Dinding", icon: "—", tip: "Lukis dinding (klik titik mula → hujung · klik 2x untuk tamat)" },
  { key: "door", label: "Pintu", icon: "🚪", tip: "Klik pada dinding untuk letak pintu" },
  { key: "window", label: "Tingkap", icon: "🪟", tip: "Klik pada dinding untuk letak tingkap" },
  { key: "label", label: "Label Bilik", icon: "🏷️", tip: "Klik dalam bilik untuk label jenis bilik" },
  { key: "select", label: "Pilih", icon: "↖", tip: "Pilih elemen · klik pintu/tingkap 2x untuk putar" },
  { key: "eraser", label: "Padam", icon: "✕", tip: "Klik elemen untuk padam" },
];

export default function DrawingToolbar({
  tool,
  isDrawingWall,
  onToolChange,
  onStopDrawing,
  onUndo,
  onClear,
  onLoadTemplate,
  onOpenIsometric,
  onOpenAIStylist,
}: Props) {
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateMenu(false);
      }
    };
    if (showTemplateMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplateMenu]);

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-1.5 sm:p-2 shadow-sm flex flex-col gap-1.5 sm:gap-2">
      {/* Top / Main Controls Row */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* SCROLLABLE TOOLS (Mobile Touch Friendly) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full flex-1">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              title={t.tip}
              onClick={() => onToolChange(t.key)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                tool === t.key
                  ? "bg-navy text-white shadow-sm font-semibold"
                  : "text-navy-400 hover:bg-navy-50 hover:text-navy-600 bg-gray-50/70"
              }`}
            >
              <span className={t.key === "wall" ? "font-black text-sm leading-none" : "text-xs"}>{t.icon}</span>
              <span className="text-[11px] sm:text-xs">{t.label}</span>
            </button>
          ))}

          {/* Stop drawing — active indicator */}
          {isDrawingWall && (
            <button
              onClick={onStopDrawing}
              title="Tamat lukisan dinding semasa (ESC)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-accent text-white animate-pulse hover:animate-none hover:bg-accent-500 transition-all whitespace-nowrap flex-shrink-0"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Tamat (ESC)</span>
            </button>
          )}
        </div>

        {/* Undo & Clear Fast Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            title="Undo (Ctrl+Z)"
            onClick={onUndo}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-medium text-navy-400 hover:bg-navy-50 hover:text-navy-600 bg-gray-50/80 transition-all flex items-center gap-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Undo</span>
          </button>

          <button
            title="Bersih semua"
            onClick={onClear}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 bg-red-50/40 transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* SECONDARY ROW: Quick Actions (Templates, AI Stylist, 3D Studio) */}
      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-navy-50 overflow-x-auto no-scrollbar">
        {/* Template Selector Dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            title="Muat turun pelan lantai siap sedia"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold text-navy-600 bg-navy-50 hover:bg-navy-100 transition-all border border-navy-100 active:scale-95"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-navy-600" />
            <span>Templat</span>
            <ChevronDown className="w-3 h-3 text-navy-400" />
          </button>

          {showTemplateMenu && (
            <div className="absolute left-0 sm:left-0 mt-2 z-50 bg-white border border-navy-100 rounded-2xl shadow-xl p-2 w-72 max-w-[88vw] animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 border-b border-navy-100 mb-1">
                <p className="text-[11px] font-bold text-navy-600">Pilih Templat Bilik</p>
                <p className="text-[10px] text-gray-400">Muatkan pelan sedia ada untuk mula pantas</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {ROOM_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      onLoadTemplate(tmpl);
                      setShowTemplateMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-navy-50 flex items-start gap-2.5 transition-colors group active:bg-navy-100"
                  >
                    <span className="text-xl p-1 bg-white rounded-lg border border-navy-100 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                      {tmpl.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy-700 truncate">{tmpl.name}</div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{tmpl.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Stylist & 3D Studio Right Row */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          {/* AI Stylist Wizard Button */}
          <button
            onClick={onOpenAIStylist}
            title="Buka AI Room Stylist & Vibe Generator"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Stylist</span>
          </button>

          {/* 3D Isometric View Launch Button */}
          <button
            onClick={onOpenIsometric}
            title="Lihat dalam mod 3D Isometric Studio"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
          >
            <Box className="w-3.5 h-3.5 text-accent" />
            <span>3D View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
