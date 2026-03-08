"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Wifi, Signal, Router, Cpu } from "lucide-react";
import FurniturePanel from "@/components/FurniturePanel";
import SmartAnnotations from "@/components/SmartAnnotations";
import { useAppStore } from "@/lib/store";

const FloorCanvas = dynamic(() => import("@/components/FloorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-gray-50 rounded-card flex items-center justify-center">
      <div className="text-navy-300 animate-pulse-slow">Loading canvas...</div>
    </div>
  ),
});

export default function LayoutPage() {
  const router = useRouter();
  const {
    layoutData,
    uploadedFileUrl,
    imagePath,
    selectedRoom,
    selectedFurniture,
    setSelectedRoom,
    setSelectedFurniture,
    updateFurniturePosition,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"workflow" | "connectivity">(
    "workflow"
  );

  useEffect(() => {
    if (!layoutData) {
      router.replace("/");
    }
  }, [layoutData, router]);

  if (!layoutData) return null;

  const imageUrl =
    uploadedFileUrl ||
    (imagePath ? `/uploads${imagePath.replace("/uploads", "")}` : null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white py-3 px-6 shadow-card z-20">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-display">Sukimeh AI Interior Designer</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-navy-200 hidden sm:inline">
              Layout ID: {layoutData.layout_id.slice(0, 8)}...
            </span>
            <button
              onClick={() => router.push("/shop")}
              className="bg-accent hover:bg-accent-500 text-white text-sm font-medium px-4 py-2 rounded-btn transition-colors flex items-center gap-2"
            >
              View Shop the Look
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT — Canvas area (70%) */}
        <div className="flex-1 lg:w-[70%] flex flex-col p-4 overflow-auto">
          <FloorCanvas
            imageUrl={imageUrl}
            placements={layoutData.furniture_placements}
            selectedRoom={selectedRoom}
            selectedFurniture={selectedFurniture}
            score={layoutData.score}
            onSelectFurniture={setSelectedFurniture}
            onDragEnd={updateFurniturePosition}
          />

          {/* Bottom furniture panel / room tabs */}
          <div className="mt-4">
            <FurniturePanel
              placements={layoutData.furniture_placements}
              selectedRoom={selectedRoom}
              selectedFurniture={selectedFurniture}
              onSelectRoom={setSelectedRoom}
              onSelectFurniture={setSelectedFurniture}
            />
          </div>
        </div>

        {/* RIGHT — Smart Optimization sidebar (30%) */}
        <div className="lg:w-[30%] bg-white border-l border-navy-100 p-6 overflow-y-auto">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-navy-50 p-1 rounded-btn mb-6">
            <button
              onClick={() => setActiveTab("workflow")}
              className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                activeTab === "workflow"
                  ? "bg-navy text-white"
                  : "text-navy-400 hover:bg-navy-100"
              }`}
            >
              Workflow
            </button>
            <button
              onClick={() => setActiveTab("connectivity")}
              className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                activeTab === "connectivity"
                  ? "bg-navy text-white"
                  : "text-navy-400 hover:bg-navy-100"
              }`}
            >
              Connectivity
            </button>
          </div>

          {/* Smart optimizations / Connectivity content */}
          {activeTab === "workflow" ? (
            <SmartAnnotations optimizations={layoutData.smart_optimizations} />
          ) : (
            <div className="space-y-3">
              <h3 className="font-display text-lg text-navy-500">Connectivity Map</h3>
              <p className="text-xs text-gray-500 mb-4">Liputan WiFi & smart device dalam ruang anda</p>

              {/* Signal strength bar */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-card p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-navy-500">Liputan WiFi</span>
                  <span className="ml-auto text-xs font-bold text-green-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-full transition-all" />
                </div>
                <p className="text-xs text-gray-500 mt-2">WiFi 6E — Semua bilik diliputi</p>
              </div>

              {/* Devices */}
              {[
                { icon: Router, label: "Router Utama", room: "Living Room", signal: "Sangat Kuat", color: "text-green-500" },
                { icon: Wifi, label: "Mesh Extender", room: "Bedroom", signal: "Kuat", color: "text-green-400" },
                { icon: Cpu, label: "Smart Sensor", room: "Bedroom", signal: "Bersambung", color: "text-blue-500" },
                { icon: Cpu, label: "Smart Sensor", room: "Kitchen", signal: "Bersambung", color: "text-blue-500" },
              ].map((device, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-btn p-3 border border-navy-100">
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <device.icon className={`w-4 h-4 ${device.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-navy-500">{device.label}</p>
                    <p className="text-xs text-gray-400">{device.room}</p>
                  </div>
                  <span className={`text-xs font-medium ${device.color}`}>{device.signal}</span>
                </div>
              ))}

              <div className="bg-navy-50 rounded-btn p-3 text-xs text-navy-400">
                💡 Chin Hin WiFi 6E Mesh system memastikan tiada dead zone dalam rumah anda.
              </div>
            </div>
          )}

          {/* Selected furniture info */}
          {selectedFurniture && (
            <div className="mt-6 p-4 bg-accent-50 rounded-card border border-accent-200">
              <h4 className="text-sm font-semibold text-navy-500 mb-1">
                Selected Item
              </h4>
              {(() => {
                const item = layoutData.furniture_placements.find(
                  (p) => p.product_id === selectedFurniture
                );
                if (!item) return null;
                return (
                  <div>
                    <p className="text-sm text-navy-400">
                      {item.icon} {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Position: {item.x_percent.toFixed(0)}%,{" "}
                      {item.y_percent.toFixed(0)}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {item.annotation}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* View shop CTA */}
          <button
            onClick={() => router.push("/shop")}
            className="w-full mt-6 bg-accent hover:bg-accent-500 text-white font-semibold py-3 rounded-btn transition-colors flex items-center justify-center gap-2"
          >
            View Shop the Look
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
