"use client";
import { useDialog } from "@/lib/useDialog";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Layers, Sparkles } from "lucide-react";
import { FloorPlan, CanvasFurniture, Wall, DoorElement, WindowElement, RoomLabel } from "@/lib/store";

interface Props {
  floorPlan: FloorPlan;
  isOpen: boolean;
  onClose: () => void;
}

const ROOM_COLORS: Record<string, string> = {
  living_room: "rgba(99, 102, 241, 0.18)",
  kitchen: "rgba(249, 115, 22, 0.18)",
  bedroom: "rgba(16, 185, 129, 0.18)",
  bathroom: "rgba(59, 130, 246, 0.18)",
  dining_room: "rgba(245, 158, 11, 0.18)",
};

const FURNITURE_HEIGHTS: Record<string, number> = {
  "RUMA-BED-01": 28,
  "RUMA-SOFA-01": 32,
  "RUMA-TV-01": 45,
  "RUMA-WARDROBE-01": 65,
  "DAPUR-FRIDGE-01": 60,
  "DAPUR-HOOD-01": 50,
  "DAPUR-HOB-01": 20,
  "RUMA-TABLE-01": 18,
  "RUMA-WIFI-01": 12,
  "RUMA-FAN-01": 8,
  "RUMA-SENSOR-01": 8,
  "RUMA-MESH-01": 12,
};

export default function IsometricViewer({ floorPlan, isOpen, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState<0 | 90 | 180 | 270>(0);
  const [wallHeight, setWallHeight] = useState(48);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Convert 2D coord to Isometric projection
  const toIso = useCallback(
    (x: number, y: number, z: number = 0, centerX: number = 400, centerY: number = 300) => {
      // Apply rotation angle
      let rx = x - centerX;
      let ry = y - centerY;

      if (rotationAngle === 90) {
        const temp = rx;
        rx = -ry;
        ry = temp;
      } else if (rotationAngle === 180) {
        rx = -rx;
        ry = -ry;
      } else if (rotationAngle === 270) {
        const temp = rx;
        rx = ry;
        ry = -temp;
      }

      const isoX = (rx - ry) * Math.cos(Math.PI / 6);
      const isoY = (rx + ry) * Math.sin(Math.PI / 6) - z;

      return {
        x: isoX * zoom + pan.x,
        y: isoY * zoom + pan.y,
      };
    },
    [zoom, pan, rotationAngle]
  );

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2 + 40;

    ctx.clearRect(0, 0, width, height);

    // Background Gradient (Architectural blueprint/isometric studio look)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0F172A");
    bgGrad.addColorStop(1, "#1E293B");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle 3D Isometric Grid Floor
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    const gridRange = 14;

    for (let i = -gridRange; i <= gridRange; i++) {
      const p1 = toIso(i * gridSize + 400, -gridRange * gridSize + 300, 0, 400, 300);
      const p2 = toIso(i * gridSize + 400, gridRange * gridSize + 300, 0, 400, 300);
      ctx.beginPath();
      ctx.moveTo(originX + p1.x, originY + p1.y);
      ctx.lineTo(originX + p2.x, originY + p2.y);
      ctx.stroke();

      const q1 = toIso(-gridRange * gridSize + 400, i * gridSize + 300, 0, 400, 300);
      const q2 = toIso(gridRange * gridSize + 400, i * gridSize + 300, 0, 400, 300);
      ctx.beginPath();
      ctx.moveTo(originX + q1.x, originY + q1.y);
      ctx.lineTo(originX + q2.x, originY + q2.y);
      ctx.stroke();
    }
    ctx.restore();

    // 1. Render Room Floor Zones
    floorPlan.roomLabels.forEach((room) => {
      const color = ROOM_COLORS[room.type] || "rgba(255, 255, 255, 0.08)";
      const r = 90;
      const pts = [
        toIso(room.x - r, room.y - r, 0),
        toIso(room.x + r, room.y - r, 0),
        toIso(room.x + r, room.y + r, 0),
        toIso(room.x - r, room.y + r, 0),
      ];

      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(originX + pts[0].x, originY + pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(originX + pts[i].x, originY + pts[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Room Name in 3D Floor
      const center = toIso(room.x, room.y, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(room.type.toUpperCase().replace("_", " "), originX + center.x, originY + center.y);
      ctx.restore();
    });

    // 2. WiFi Heatmap Glow (if active and router exists)
    if (showHeatmap) {
      const routers = floorPlan.furniture.filter((f) => f.product_id.includes("WIFI") || f.product_id.includes("MESH"));
      routers.forEach((router) => {
        const center = toIso(router.x, router.y, 0);
        ctx.save();
        for (let ring = 3; ring >= 1; ring--) {
          const radius = ring * 90 * zoom;
          const radGrad = ctx.createRadialGradient(
            originX + center.x,
            originY + center.y,
            0,
            originX + center.x,
            originY + center.y,
            radius
          );
          radGrad.addColorStop(0, "rgba(16, 185, 129, 0.25)");
          radGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.12)");
          radGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.ellipse(originX + center.x, originY + center.y, radius, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    // 3. Render 3D Extruded Walls
    const wallThick = 6;
    floorPlan.walls.forEach((w) => {
      const p1Bottom = toIso(w.x1, w.y1, 0);
      const p2Bottom = toIso(w.x2, w.y2, 0);
      const p1Top = toIso(w.x1, w.y1, wallHeight);
      const p2Top = toIso(w.x2, w.y2, wallHeight);

      // Wall shadow on floor
      ctx.save();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 14 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(originX + p1Bottom.x, originY + p1Bottom.y);
      ctx.lineTo(originX + p2Bottom.x, originY + p2Bottom.y);
      ctx.stroke();
      ctx.restore();

      // Wall Front / Side Face
      ctx.save();
      const wallFaceGrad = ctx.createLinearGradient(
        originX + p1Bottom.x,
        originY + p1Bottom.y,
        originX + p2Top.x,
        originY + p2Top.y
      );
      wallFaceGrad.addColorStop(0, "#1E3A8A");
      wallFaceGrad.addColorStop(1, "#3B82F6");

      ctx.fillStyle = wallFaceGrad;
      ctx.beginPath();
      ctx.moveTo(originX + p1Bottom.x, originY + p1Bottom.y);
      ctx.lineTo(originX + p2Bottom.x, originY + p2Bottom.y);
      ctx.lineTo(originX + p2Top.x, originY + p2Top.y);
      ctx.lineTo(originX + p1Top.x, originY + p1Top.y);
      ctx.closePath();
      ctx.fill();

      // Top Wall Cap Highlight
      ctx.strokeStyle = "#93C5FD";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(originX + p1Top.x, originY + p1Top.y);
      ctx.lineTo(originX + p2Top.x, originY + p2Top.y);
      ctx.stroke();
      ctx.restore();
    });

    // 4. Render Doors & Windows in 3D
    floorPlan.doors.forEach((d) => {
      const pos = toIso(d.x, d.y, 0);
      ctx.save();
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(originX + pos.x, originY + pos.y, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // 3D Door Swing Arc
      const swingEnd = toIso(d.x + 30, d.y + 10, 0);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(originX + pos.x, originY + pos.y);
      ctx.lineTo(originX + swingEnd.x, originY + swingEnd.y);
      ctx.stroke();
      ctx.restore();
    });

    floorPlan.windows.forEach((win) => {
      const b = toIso(win.x, win.y, 10);
      const t = toIso(win.x, win.y, 35);
      ctx.save();
      ctx.strokeStyle = "rgba(147, 197, 253, 0.9)";
      ctx.lineWidth = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(originX + b.x, originY + b.y);
      ctx.lineTo(originX + t.x, originY + t.y);
      ctx.stroke();
      ctx.restore();
    });

    // 5. Render 3D Furniture Blocks / Pedestals
    // Sort furniture by ISO depth (Y + X) for proper painter's algorithm
    const sortedFurniture = [...floorPlan.furniture].sort((a, b) => a.y + a.x - (b.y + b.x));

    sortedFurniture.forEach((furn) => {
      const h = (FURNITURE_HEIGHTS[furn.product_id] || 24) * (wallHeight / 48);
      const size = 22;

      const pBottom = toIso(furn.x, furn.y, 0);
      const pTop = toIso(furn.x, furn.y, h);

      // Floor Shadow
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(originX + pBottom.x, originY + pBottom.y, size * 1.2 * zoom, size * 0.7 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Extruded Cylinder/Block Pedestal
      const grad = ctx.createLinearGradient(
        originX + pBottom.x,
        originY + pBottom.y,
        originX + pTop.x,
        originY + pTop.y
      );
      grad.addColorStop(0, "#1E293B");
      grad.addColorStop(1, "#334155");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(originX + pTop.x, originY + pTop.y, size * zoom, size * 0.6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Side Pillar
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(
        originX + pTop.x - size * zoom,
        originY + pTop.y,
        size * 2 * zoom,
        Math.max(1, originY + pBottom.y - (originY + pTop.y))
      );

      // Top Cap
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.ellipse(originX + pTop.x, originY + pTop.y, size * zoom, size * 0.6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#F97316";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Product Icon in 3D
      ctx.font = `${Math.round(18 * zoom)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(furn.icon, originX + pTop.x, originY + pTop.y);

      // Floating 3D Badge Label
      ctx.font = `bold ${Math.max(9, Math.round(10 * zoom))}px system-ui, sans-serif`;
      const nameText = furn.name.split(" ").slice(-1)[0];
      const textMetrics = ctx.measureText(nameText);
      const tagW = textMetrics.width + 12;
      const tagH = 16;
      const tagY = originY + pTop.y - 24 * zoom;

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(originX + pTop.x - tagW / 2, tagY - tagH / 2, tagW, tagH, 8);
      } else {
        ctx.rect(originX + pTop.x - tagW / 2, tagY - tagH / 2, tagW, tagH);
      }
      ctx.fill();
      ctx.strokeStyle = "#F97316";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#F8FAFC";
      ctx.fillText(nameText, originX + pTop.x, tagY);

      if (furn.annotation) {
        ctx.fillStyle = "#10B981";
        ctx.font = `${Math.max(8, Math.round(8 * zoom))}px system-ui, sans-serif`;
        ctx.fillText(`✓ ${furn.annotation}`, originX + pTop.x, tagY + 14);
      }

      ctx.restore();
    });
  }, [floorPlan, toIso, zoom, wallHeight, showHeatmap]);

  // Handle Resize and Render Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? 900;
      canvas.height = canvas.parentElement?.clientHeight ?? 600;
      drawScene();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [isOpen, drawScene]);

  // Redraw when state changes
  useEffect(() => {
    if (isOpen) drawScene();
  }, [isOpen, drawScene]);

  // Mouse drag to pan
  // Mouse & Touch drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(2.5, Math.max(0.4, z * factor)));
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ruma-3d-isometric-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Paparan isometrik" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-semibold text-slate-100 flex items-center gap-1.5 sm:gap-2 truncate">
                <span>3D Isometric Studio</span>
                <span className="text-[9px] sm:text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold border border-accent/30">
                  2.5D
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block truncate">
                Visualisasi 3D arkitektural dengan pencahayaan & heatmap
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eksport</span>
              <span className="sm:hidden">PNG</span>
            </button>
            <button
              aria-label="Tutup paparan isometrik"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div
          className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950 touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Floating HUD Controls (Zoom In/Out) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 backdrop-blur-md shadow-lg z-20">
            <button
              onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
              title="Zoom In"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors active:scale-90"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              title="Zoom Out"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors active:scale-90"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(0.85);
                setPan({ x: 0, y: 0 });
              }}
              title="Reset View"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors active:scale-90"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Bottom HUD: Responsive Flex Wrap Container */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
            {/* Rotation & Layer Controls */}
            <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1.5 backdrop-blur-md shadow-lg pointer-events-auto overflow-x-auto max-w-full no-scrollbar">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium px-1 hidden sm:inline">Sudut:</span>
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotationAngle(deg as any)}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all active:scale-95 ${
                    rotationAngle === deg
                      ? "bg-accent text-white shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {deg}°
                </button>
              ))}

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all active:scale-95 ${
                  showHeatmap
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>WiFi</span>
              </button>
            </div>

            {/* Wall Height Slider */}
            <div className="flex items-center gap-2 bg-slate-900/95 border border-slate-700/80 rounded-xl px-2.5 py-1.5 backdrop-blur-md shadow-lg pointer-events-auto ml-auto">
              <span className="text-[10px] sm:text-xs text-slate-400">Dinding:</span>
              <input
                type="range"
                min={16}
                max={80}
                value={wallHeight}
                onChange={(e) => setWallHeight(Number(e.target.value))}
                className="w-16 sm:w-20 accent-accent cursor-pointer h-1.5"
              />
              <span className="text-[10px] sm:text-xs font-bold text-accent w-4 text-right">{wallHeight}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
