"use client";

import dynamic from "next/dynamic";
import catalog from "@/lib/catalog.json";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { ArrowRight, Sparkles, Wand2, Loader2, Trash, Box, PenTool, Armchair, Bot } from "lucide-react";
import { toast } from "sonner";
import DrawingToolbar from "@/components/DrawingToolbar";
import FurnitureSidebar from "@/components/FurnitureSidebar";
import SmartAnnotations from "@/components/SmartAnnotations";
import AIStylistModal, { StylePreset } from "@/components/AIStylistModal";
import IsometricViewer from "@/components/IsometricViewer";
import { useAppStore } from "@/lib/store";
import { suggestFurniture } from "@/lib/foundry";
import type { DrawTool } from "@/components/DrawingCanvas";
import type { RoomTemplate } from "@/lib/templates";

const DrawingCanvas = dynamic(() => import("@/components/DrawingCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] sm:min-h-[520px] bg-[#F8F9FF] rounded-card flex items-center justify-center">
      <div className="text-navy-300 animate-pulse text-sm">Memuatkan kanvas...</div>
    </div>
  ),
});

type SidebarTab = "furniture" | "ai";
type MobileView = "canvas" | "furniture" | "ai";

export default function LayoutPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<DrawTool>("wall");
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("furniture");
  const [mobileView, setMobileView] = useState<MobileView>("canvas");

  // Modal States
  const [showAIStylist, setShowAIStylist] = useState(false);
  const [showIsometric, setShowIsometric] = useState(false);
  const [activeStyleName, setActiveStyleName] = useState<string | null>(null);

  const { floorPlan, layoutData, clearFloorPlan, setFloorPlan, setLayoutData, addFurniture } = useAppStore();

  const handleOpenCatalog = () => {
    const selectedIds = new Set(floorPlan.furniture.map((f) => f.product_id));
    const products = catalog.filter((p) => selectedIds.has(p.id)).map((p) => ({ ...p, sku: p.id }));
    if (!products.length) { toast.error("Tambah perabot pada pelan dahulu."); return; }
    setLayoutData({
      layout_id: `manual-${Date.now()}`,
      score: 0,
      smart_optimizations: [],
      bundle: {
        products,
        total_original: products.reduce((sum, p) => sum + p.original_price, 0),
        total_discounted: products.reduce((sum, p) => sum + p.price, 0),
      },
    });
    router.push("/shop");
  };

  const handleUndo = () => window.dispatchEvent(new Event("drawing-undo"));
  const handleStopDrawing = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

  const handleClear = () => {
    if (confirm("Bersihkan semua lukisan? Tindakan ini tidak boleh di-undo.")) clearFloorPlan();
  };

  const handleClearAISuggestions = useCallback(() => {
    setFloorPlan({
      ...floorPlan,
      furniture: floorPlan.furniture.filter((f) => !f.id.startsWith("ai-")),
    });
    toast.success("Cadangan AI dibersihkan");
  }, [floorPlan, setFloorPlan]);

  const handleLoadTemplate = useCallback(
    (template: RoomTemplate) => {
      if (floorPlan.walls.length && !window.confirm("Gantikan draf semasa dengan templat ini?")) return;
      setFloorPlan(template.plan);
      setLayoutData(null);
      toast.success(`Templat ${template.name} dimuatkan!`, {
        description: `${template.plan.walls.length} dinding & ${template.plan.furniture.length} perabot sedia ada.`,
      });
      // Switch back to canvas on mobile
      setMobileView("canvas");
    },
    [floorPlan.walls.length, setFloorPlan, setLayoutData]
  );

  const aiSuggestionCount = floorPlan.furniture.filter((f) => f.id.startsWith("ai-")).length;

  const handleAISuggest = async (preset?: StylePreset, customPrompt?: string) => {
    if (floorPlan.walls.length < 3) {
      toast.error("Lukis bilik dahulu!", {
        description: "Sekurang-kurangnya 3 dinding diperlukan atau pilih Templat di menu atas.",
      });
      setMobileView("canvas");
      return;
    }
    if (floorPlan.roomLabels.length === 0) {
      toast.error("Label bilik dahulu!", {
        description: "Guna tool 🏷️ Label Bilik untuk labelkan jenis setiap bilik.",
      });
      setSidebarTab("furniture");
      setTool("label");
      setMobileView("canvas");
      return;
    }

    setIsSuggesting(true);
    setSidebarTab("ai");
    if (preset) {
      setActiveStyleName(preset.name);
    }

    try {
      const result = await suggestFurniture({
        walls: floorPlan.walls,
        roomLabels: floorPlan.roomLabels,
        canvas_width: Math.max(800, canvasRef.current?.clientWidth ?? 800),
        canvas_height: Math.max(560, canvasRef.current?.clientHeight ?? 560),
        style_preset: preset?.id ?? "japandi",
        style_prompt: customPrompt ?? "",
      });

      const existingIds = new Set(floorPlan.furniture.map((f) => f.product_id));
      let added = 0;
      for (const item of result.furniture ?? []) {
        if (!existingIds.has(item.product_id)) {
          addFurniture({
            id: `ai-${item.product_id}-${Date.now()}`,
            product_id: item.product_id,
            name: item.name,
            icon: item.icon,
            x: item.x,
            y: item.y,
            annotation: item.annotation,
          });
          existingIds.add(item.product_id);
          added++;
        }
      }

      setLayoutData({
        layout_id: result.layout_id,
        score: result.score,
        smart_optimizations: result.smart_optimizations ?? [],
        bundle: result.bundle,
      });

      setShowAIStylist(false);
      setMobileView("canvas");
      toast.success(`Cadangan AI Siap! Skor: ${result.score}%`, {
        description: `${added} perabot disusun mengikut konsep ${preset ? preset.name : "Optimal"}.`,
      });
    } catch {
      toast.error("AI cadangan gagal. Pastikan backend berjalan dan cuba lagi.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 lg:pb-0">
      {/* Header */}
      <header className="bg-navy text-white py-2.5 sm:py-3 px-3 sm:px-6 shadow-card z-20 sticky top-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-display flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Ruma Studio</span>
                {activeStyleName && (
                  <span className="text-[9px] sm:text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-sans font-semibold border border-accent/30 hidden md:inline">
                    {activeStyleName}
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowIsometric(true)}
              className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-btn bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 sm:gap-1.5 active:scale-95"
            >
              <Box className="w-3.5 h-3.5 text-accent" />
              <span>3D Studio</span>
            </button>

            <button
              onClick={handleOpenCatalog}
              disabled={!floorPlan.furniture.length}
              className={`text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-btn transition-colors flex items-center gap-1 sm:gap-2 active:scale-95 ${
                floorPlan.furniture.length
                  ? "bg-accent hover:bg-accent-500 text-white shadow-sm"
                  : "bg-navy-700 text-navy-400 cursor-not-allowed opacity-60"
              }`}
            >
              <span className="hidden sm:inline">Katalog demo</span>
              <span className="sm:hidden">Katalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* VIEW 1: Canvas (Shown if mobileView === 'canvas' on mobile OR always on desktop) */}
        <div
          className={`flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-3 overflow-hidden min-w-0 ${
            mobileView === "canvas" ? "flex" : "hidden lg:flex"
          }`}
        >
          <DrawingToolbar
            tool={tool}
            isDrawingWall={isDrawingWall}
            onToolChange={setTool}
            onStopDrawing={handleStopDrawing}
            onUndo={handleUndo}
            onClear={handleClear}
            onLoadTemplate={handleLoadTemplate}
            onOpenIsometric={() => setShowIsometric(true)}
            onOpenAIStylist={() => setShowAIStylist(true)}
          />
          <div
            ref={canvasRef}
            className="flex-1 rounded-2xl overflow-hidden border border-navy-100 shadow-sm bg-white min-h-[420px] sm:min-h-[520px] touch-none"
          >
            <DrawingCanvas tool={tool} onDrawingStateChange={setIsDrawingWall} />
          </div>
        </div>

        {/* VIEW 2 & 3: Sidebar (Shown if mobileView !== 'canvas' on mobile OR always on desktop) */}
        <div
          className={`w-full lg:w-[320px] flex-shrink-0 flex flex-col border-l border-navy-100 bg-white overflow-hidden ${
            mobileView !== "canvas" ? "flex flex-1" : "hidden lg:flex"
          }`}
        >
          {/* Desktop Tabs */}
          <div className="flex border-b border-navy-100 flex-shrink-0">
            <button
              onClick={() => {
                setSidebarTab("furniture");
                setMobileView("furniture");
              }}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                sidebarTab === "furniture"
                  ? "text-navy border-b-2 border-navy bg-navy-50"
                  : "text-navy-300 hover:text-navy-500"
              }`}
            >
              🛋️ Katalog Perabot
            </button>
            <button
              onClick={() => {
                setSidebarTab("ai");
                setMobileView("ai");
              }}
              className={`flex-1 py-3 text-xs font-bold transition-colors relative ${
                sidebarTab === "ai"
                  ? "text-navy border-b-2 border-navy bg-navy-50"
                  : "text-navy-300 hover:text-navy-500"
              }`}
            >
              🤖 AI Cadangan
              {layoutData && <span className="absolute top-2.5 right-4 w-2 h-2 bg-accent rounded-full animate-ping" />}
            </button>
          </div>

          {/* Tab: Furniture */}
          {sidebarTab === "furniture" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <FurnitureSidebar
                onItemAdded={() => {
                  setTool("select");
                  setMobileView("canvas");
                }}
              />
            </div>
          )}

          {/* Tab: AI Suggestions */}
          {sidebarTab === "ai" && (
            <div className="flex-1 overflow-y-auto flex flex-col p-4 gap-4">
              {/* Quick AI Stylist Button */}
              <button
                onClick={() => setShowAIStylist(true)}
                disabled={isSuggesting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-accent to-accent-500 hover:from-accent-500 hover:to-accent text-white shadow-card hover:shadow-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Room Stylist & Vibe</span>
              </button>

              {/* Standard AI Suggest button */}
              <button
                onClick={() => handleAISuggest()}
                disabled={isSuggesting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs bg-navy hover:bg-navy-600 text-white shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                {isSuggesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI sedang menganalisis...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-accent" />
                    Auto-Cadang Cepat
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center -mt-2">
                Pilih tema atau klik Auto-Cadang untuk susun atur automatik
              </p>

              {/* Clear AI suggestions */}
              {aiSuggestionCount > 0 && (
                <button
                  onClick={handleClearAISuggestions}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-400 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Buang {aiSuggestionCount} cadangan AI
                </button>
              )}

              {/* Score */}
              {layoutData && (
                <div className="flex items-center gap-3 bg-navy-50 rounded-2xl p-3 border border-navy-100">
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-accent font-bold text-sm">{layoutData.score}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-600">Design Quality Score</p>
                    <p className="text-[11px] text-gray-500">Dioptimumkan oleh DeepSeek AI</p>
                  </div>
                </div>
              )}

              {/* Optimizations */}
              {layoutData?.smart_optimizations && layoutData.smart_optimizations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-navy-600">Analisis Ergonomik & Alam Sekitar:</p>
                  <SmartAnnotations optimizations={layoutData.smart_optimizations} />
                </div>
              )}

              {/* No result state */}
              {!layoutData && !isSuggesting && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3 opacity-60">
                  <span className="text-4xl animate-bounce">🤖</span>
                  <p className="text-xs text-navy-400 font-medium max-w-[200px]">
                    Klik butang di atas untuk dapatkan cadangan susunan perabot dari AI
                  </p>
                </div>
              )}

              {/* Shop CTA */}
              {layoutData && (
                <button
                  onClick={handleOpenCatalog}
                  className="w-full bg-accent hover:bg-accent-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs mt-auto shadow-card active:scale-95"
                >
                  <span>Lihat Bundle Penuh ({layoutData.bundle.products.length} Item)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on phones/tablets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-navy-100 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setMobileView("canvas")}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
            mobileView === "canvas"
              ? "text-navy font-bold scale-105"
              : "text-gray-400 hover:text-navy-500"
          }`}
        >
          <PenTool className={`w-4 h-4 ${mobileView === "canvas" ? "text-accent" : ""}`} />
          <span className="text-[10px]">Kanvas</span>
        </button>

        <button
          onClick={() => {
            setSidebarTab("furniture");
            setMobileView("furniture");
          }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
            mobileView === "furniture"
              ? "text-navy font-bold scale-105"
              : "text-gray-400 hover:text-navy-500"
          }`}
        >
          <Armchair className={`w-4 h-4 ${mobileView === "furniture" ? "text-accent" : ""}`} />
          <span className="text-[10px]">Perabot</span>
        </button>

        <button
          onClick={() => {
            setSidebarTab("ai");
            setMobileView("ai");
          }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all relative ${
            mobileView === "ai"
              ? "text-navy font-bold scale-105"
              : "text-gray-400 hover:text-navy-500"
          }`}
        >
          <Bot className={`w-4 h-4 ${mobileView === "ai" ? "text-accent" : ""}`} />
          <span className="text-[10px]">AI Cadangan</span>
          {layoutData && (
            <span className="absolute top-0.5 right-3 w-2 h-2 bg-accent rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setShowIsometric(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-700 hover:text-slate-900 transition-all"
        >
          <Box className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-semibold">3D</span>
        </button>
      </nav>

      {/* MODALS */}
      <AIStylistModal
        isOpen={showAIStylist}
        onClose={() => setShowAIStylist(false)}
        onApplyStyle={(preset, prompt) => handleAISuggest(preset, prompt)}
        isLoading={isSuggesting}
      />

      <IsometricViewer
        isOpen={showIsometric}
        onClose={() => setShowIsometric(false)}
        floorPlan={floorPlan}
      />
    </div>
  );
}
