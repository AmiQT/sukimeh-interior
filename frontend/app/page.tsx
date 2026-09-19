"use client";

import PlanPreview from "@/components/PlanPreview";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Sparkles, Layout, ShoppingBag, Play, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { MOCK_FLOOR_PLAN, MOCK_LAYOUT_DATA } from "@/lib/mockData";

const STEPS = [
  { icon: Pencil,      label: "Lukis Pelan / Templat", desc: "Dinding, pintu & tingkap 2D" },
  { icon: Wand2,       label: "AI Room Stylist",       desc: "Japandi, Nordic & Smart Vibe" },
  { icon: Layout,      label: "3D Isometric Studio",   desc: "Visualisasi 2.5D & Heatmap" },
  { icon: ShoppingBag, label: "Shop the Look",         desc: "Katalog rekaan untuk demo" },
];

export default function HomePage() {
  const router = useRouter();
  const { setFloorPlan, setLayoutData, reset } = useAppStore();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleStart = () => {
    if (useAppStore.getState().floorPlan.walls.length && !window.confirm("Mulakan pelan baharu dan gantikan draf semasa?")) return;
    reset();
    router.push("/layout");
  };

  const handleDemo = async () => {
    if (useAppStore.getState().floorPlan.walls.length && !window.confirm("Muatkan demo dan gantikan draf semasa?")) return;
    setIsDemoLoading(true);
    toast.success("Memuatkan demo...", { description: "Pelan 4 bilik • 8 perabot • Skor 98%" });
    await new Promise((r) => setTimeout(r, 1000));
    setFloorPlan(MOCK_FLOOR_PLAN);
    setLayoutData(MOCK_LAYOUT_DATA);
    setIsDemoLoading(false);
    router.push("/layout");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 shadow-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display tracking-tight">Ruma Studio</h1>
              <p className="text-xs text-navy-200">Perancang ruang sumber terbuka</p>
            </div>
          </div>
          <span className="hidden md:inline px-2 py-1 bg-navy-600 rounded-md text-xs text-navy-200">
            Open-source room planner
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-display text-navy mb-4 leading-tight">
            Ruang anda, idea anda.
            <br />
            <span className="text-accent">Mulakan dengan satu pelan.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Lukis pelan, cuba susunan perabot dan lihat ruang dalam paparan isometrik. Draf disimpan pada pelayar anda.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-slide-up">
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-btn font-semibold text-lg bg-accent hover:bg-accent-500 text-white shadow-card hover:shadow-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
          >
            <Pencil className="w-5 h-5" />
            Mula Lukis Pelan Lantai
          </button>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:inline">atau</span>
            <button
              onClick={handleDemo}
              disabled={isDemoLoading}
              className="px-6 py-4 rounded-btn font-semibold text-base border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 flex items-center gap-2 hover:shadow-card active:scale-[0.98] disabled:opacity-60"
            >
              {isDemoLoading ? (
                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Cuba Demo
            </button>
          </div>
        </div>

        <button onClick={() => router.push("/layout")} className="mb-10 text-navy underline underline-offset-4">Sambung draf tersimpan</button>

        <div className="w-full max-w-2xl mb-12"><PlanPreview plan={MOCK_FLOOR_PLAN} /><p className="text-center text-xs text-gray-500 mt-3">Daripada lakaran pertama kepada ruang yang terasa seperti rumah.</p></div>

        {/* Steps */}
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center shadow-card">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-500">{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>

          {/* Connector lines for desktop */}
          <div className="hidden md:flex mt-[-76px] mb-12 px-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-0.5 bg-navy-100 mx-4 mt-7" />
            ))}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t border-navy-50">
        Ruma Studio | Sumber terbuka | Katalog dan harga rekaan.
      </footer>
    </div>
  );
}
