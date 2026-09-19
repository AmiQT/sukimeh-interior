"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line, Arc, Rect, Text, Group, Circle, Arrow } from "react-konva";
import type Konva from "konva";
import { nanoid } from "nanoid";
import {
  useAppStore,
  Wall,
  DoorElement,
  WindowElement,
  RoomLabel,
  CanvasFurniture,
  FloorPlan,
} from "@/lib/store";
import { Wifi, Wind, Footprints, Ruler } from "lucide-react";

export type DrawTool = "wall" | "door" | "window" | "label" | "select" | "eraser";

const GRID = 20;
const ENDPOINT_SNAP_RADIUS = 24;
const snap = (v: number) => Math.round(v / GRID) * GRID;

const ROOM_META: Record<string, { label: string; icon: string; color: string; border: string }> = {
  living_room: { label: "Living Room", icon: "🛋️", color: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.3)" },
  kitchen: { label: "Kitchen", icon: "🍳", color: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.3)" },
  bedroom: { label: "Bedroom", icon: "🛏️", color: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)" },
  bathroom: { label: "Bathroom", icon: "🚿", color: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)" },
  dining_room: { label: "Dining Room", icon: "🍽️", color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)" },
};

interface LabelPopup {
  screenX: number;
  screenY: number;
  canvasX: number;
  canvasY: number;
}
interface SelectedEl {
  type: "wall" | "door" | "window" | "label" | "furniture";
  id: string;
}

interface Props {
  tool: DrawTool;
  onDrawingStateChange?: (isDrawing: boolean) => void;
}

export default function DrawingCanvas({ tool, onDrawingStateChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });
  const canvasScale = Math.min(1, dimensions.width / 800);
  const worldWidth = dimensions.width / canvasScale;
  const worldHeight = dimensions.height / canvasScale;
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [snappedEndpoint, setSnappedEndpoint] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<SelectedEl | null>(null);
  const [labelPopup, setLabelPopup] = useState<LabelPopup | null>(null);
  const [history, setHistory] = useState<FloorPlan[]>([]);

  // Simulation Overlays Toggles
  const [showWifiHeatmap, setShowWifiHeatmap] = useState(true);
  const [showAirflow, setShowAirflow] = useState(true);
  const [showTrafficFlow, setShowTrafficFlow] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);

  const {
    floorPlan,
    addWall,
    removeWall,
    addDoor,
    removeDoor,
    updateDoorRotation,
    addWindow,
    removeWindow,
    updateWindowRotation,
    addRoomLabel,
    removeRoomLabel,
    addFurniture,
    removeFurniture,
    updateFurniturePosition,
    setFloorPlan,
  } = useAppStore();

  // Notify parent when wall drawing starts/stops
  useEffect(() => {
    onDrawingStateChange?.(wallStart !== null);
  }, [wallStart, onDrawingStateChange]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const minH = window.innerWidth < 640 ? 420 : 520;
      setDimensions({ width: el.clientWidth || 360, height: Math.max(el.clientHeight || minH, minH) });
    });
    obs.observe(el);
    const minH = typeof window !== "undefined" && window.innerWidth < 640 ? 420 : 520;
    setDimensions({ width: el.clientWidth || 360, height: Math.max(el.clientHeight || minH, minH) });
    return () => obs.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
      if (e.key === "Escape") {
        setWallStart(null);
        setLabelPopup(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        snapshot();
        eraseEl(selected);
        setSelected(null);
      }
      if (selected?.type === "furniture" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const furn = floorPlan.furniture.find((f) => f.id === selected.id);
        if (furn) {
          snapshot();
          const step = e.shiftKey ? GRID * 2 : GRID;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          updateFurniturePosition(furn.id, Math.max(0, furn.x + dx), Math.max(0, furn.y + dy));
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    setWallStart(null);
    setLabelPopup(null);
    setSelected(null);
  }, [tool]);

  const snapshot = useCallback(() => {
    setHistory((h) => [...h.slice(-29), { ...floorPlan }]);
  }, [floorPlan]);

  const undo = useCallback(() => {
    if (!history.length) return;
    setFloorPlan(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setWallStart(null);
    setSelected(null);
  }, [history, setFloorPlan]);

  useEffect(() => {
    const h = () => undo();
    window.addEventListener("drawing-undo", h);
    return () => window.removeEventListener("drawing-undo", h);
  }, [undo]);

  const eraseEl = (sel: SelectedEl) => {
    if (sel.type === "wall") removeWall(sel.id);
    else if (sel.type === "door") removeDoor(sel.id);
    else if (sel.type === "window") removeWindow(sel.id);
    else if (sel.type === "label") removeRoomLabel(sel.id);
    else if (sel.type === "furniture") removeFurniture(sel.id);
  };

  // Snap to nearest existing wall endpoint
  const getNearestEndpoint = (pos: { x: number; y: number }) => {
    for (const wall of floorPlan.walls) {
      for (const pt of [
        { x: wall.x1, y: wall.y1 },
        { x: wall.x2, y: wall.y2 },
      ]) {
        if (Math.abs(pt.x - pos.x) < ENDPOINT_SNAP_RADIUS && Math.abs(pt.y - pos.y) < ENDPOINT_SNAP_RADIUS) {
          return pt;
        }
      }
    }
    return null;
  };

  const getPos = () => {
    const raw = stageRef.current?.getRelativePointerPosition();
    if (!raw) return { x: 0, y: 0 };
    const gridSnapped = { x: snap(raw.x), y: snap(raw.y) };
    const endpoint = getNearestEndpoint(gridSnapped);
    return endpoint ?? gridSnapped;
  };

  const handleMouseMove = () => {
    if (tool !== "wall" || !wallStart) {
      if (snappedEndpoint) setSnappedEndpoint(null);
      return;
    }
    const raw = stageRef.current?.getRelativePointerPosition();
    if (!raw) return;
    const gridSnapped = { x: snap(raw.x), y: snap(raw.y) };
    const endpoint = getNearestEndpoint(gridSnapped);
    setSnappedEndpoint(endpoint);
    setPreviewPos(endpoint ?? gridSnapped);
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (tool !== "wall" || !wallStart) return;
    e.evt.preventDefault();
    const touch = e.evt.touches[0];
    if (!touch || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const raw = { x: (touch.clientX - rect.left) / canvasScale, y: (touch.clientY - rect.top) / canvasScale };
    const gridSnapped = { x: snap(raw.x), y: snap(raw.y) };
    const endpoint = getNearestEndpoint(gridSnapped);
    setSnappedEndpoint(endpoint);
    setPreviewPos(endpoint ?? gridSnapped);
  };

  const handlePlace = (e: Konva.KonvaEventObject<MouseEvent | Event>) => {
    if (e.target !== e.target.getStage() && tool !== "wall") return;
    const { x, y } = getPos();

    if (tool === "wall") {
      if (!wallStart) {
        setWallStart({ x, y });
      } else {
        if (wallStart.x !== x || wallStart.y !== y) {
          snapshot();
          addWall({ id: nanoid(8), x1: wallStart.x, y1: wallStart.y, x2: x, y2: y });
        }
        setWallStart({ x, y });
      }
    } else if (tool === "door") {
      snapshot();
      addDoor({ id: nanoid(8), x, y, rotation: 0 });
    } else if (tool === "window") {
      snapshot();
      addWindow({ id: nanoid(8), x, y, rotation: 0 });
    } else if (tool === "label") {
      const nativeEvent = e.evt as any;
      const containerRect = containerRef.current!.getBoundingClientRect();
      const screenX = (nativeEvent.clientX ?? nativeEvent.touches?.[0]?.clientX ?? 0) - containerRect.left;
      const screenY = (nativeEvent.clientY ?? nativeEvent.touches?.[0]?.clientY ?? 0) - containerRect.top;
      setLabelPopup({ screenX, screenY, canvasX: x, canvasY: y });
    } else if (tool === "select") {
      setSelected(null);
    }
  };

  const handleDblClick = () => {
    if (tool === "wall") setWallStart(null);
  };

  // HTML5 drop from furniture sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("furniture");
    if (!data) return;
    const item = JSON.parse(data) as { product_id: string; name: string; icon: string };
    const rect = containerRef.current!.getBoundingClientRect();
    const x = snap((e.clientX - rect.left) / canvasScale);
    const y = snap((e.clientY - rect.top) / canvasScale);
    snapshot();
    addFurniture({ id: nanoid(8), product_id: item.product_id, name: item.name, icon: item.icon, x, y });
  };

  const handleAddRoomLabel = (type: string) => {
    if (!labelPopup) return;
    snapshot();
    addRoomLabel({ id: nanoid(8), x: labelPopup.canvasX, y: labelPopup.canvasY, type });
    setLabelPopup(null);
  };

  // ── Element renderers ──────────────────────────────────────────────────────

  const WallEl = ({ wall }: { wall: Wall }) => {
    const isSel = selected?.id === wall.id;
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    const lengthM = (lengthPx / 40).toFixed(1); // 40px = 1 meter scale
    const midX = (wall.x1 + wall.x2) / 2;
    const midY = (wall.y1 + wall.y2) / 2;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <Group>
        <Line
          points={[wall.x1, wall.y1, wall.x2, wall.y2]}
          stroke={isSel ? "#F97316" : "#1B2B6B"}
          strokeWidth={8}
          lineCap="round"
          hitStrokeWidth={20}
          onClick={(e) => {
            e.cancelBubble = true;
            tool === "eraser"
              ? (snapshot(), removeWall(wall.id))
              : tool === "select" && setSelected({ type: "wall", id: wall.id });
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            tool === "eraser"
              ? (snapshot(), removeWall(wall.id))
              : tool === "select" && setSelected({ type: "wall", id: wall.id });
          }}
        />

        {/* Real-time Dimensions in meters */}
        {showDimensions && lengthPx > 30 && (
          <Group x={midX} y={midY} rotation={angle > 90 || angle < -90 ? angle + 180 : angle} listening={false}>
            <Rect x={-18} y={-14} width={36} height={13} fill="rgba(27, 43, 107, 0.85)" cornerRadius={4} />
            <Text x={-18} y={-12} width={36} text={`${lengthM}m`} fontSize={8} fill="#ffffff" fontStyle="bold" align="center" />
          </Group>
        )}
      </Group>
    );
  };

  const DoorEl = ({ door }: { door: DoorElement }) => {
    const isSel = selected?.id === door.id;
    const c = isSel ? "#F97316" : "#1B2B6B";
    return (
      <Group
        x={door.x}
        y={door.y}
        rotation={door.rotation}
        onClick={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeDoor(door.id);
          } else if (tool === "select") {
            isSel ? (snapshot(), updateDoorRotation(door.id, (door.rotation + 90) % 360)) : setSelected({ type: "door", id: door.id });
          }
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeDoor(door.id);
          } else if (tool === "select") {
            isSel ? (snapshot(), updateDoorRotation(door.id, (door.rotation + 90) % 360)) : setSelected({ type: "door", id: door.id });
          }
        }}
      >
        <Circle radius={3} fill={c} />
        <Line points={[0, 0, 40, 0]} stroke={c} strokeWidth={2.5} lineCap="round" />
        <Arc
          innerRadius={38}
          outerRadius={40}
          angle={90}
          stroke={c}
          strokeWidth={1.5}
          fill={isSel ? "rgba(249,115,22,0.06)" : "rgba(27,43,107,0.06)"}
        />
        {isSel && <Text x={6} y={-20} text="klik lagi = putar 🔄" fontSize={8} fill="#F97316" />}
      </Group>
    );
  };

  const WindowEl = ({ win }: { win: WindowElement }) => {
    const isSel = selected?.id === win.id;
    const c = isSel ? "#F97316" : "#1B2B6B";
    return (
      <Group
        x={win.x}
        y={win.y}
        rotation={win.rotation}
        onClick={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeWindow(win.id);
          } else if (tool === "select") {
            isSel ? (snapshot(), updateWindowRotation(win.id, (win.rotation + 90) % 360)) : setSelected({ type: "window", id: win.id });
          }
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeWindow(win.id);
          } else if (tool === "select") {
            isSel ? (snapshot(), updateWindowRotation(win.id, (win.rotation + 90) % 360)) : setSelected({ type: "window", id: win.id });
          }
        }}
      >
        <Line points={[-24, 0, 24, 0]} stroke={c} strokeWidth={4} lineCap="square" />
        <Line points={[-24, -5, 24, -5]} stroke={c} strokeWidth={1} />
        <Line points={[-24, 5, 24, 5]} stroke={c} strokeWidth={1} />
        <Line points={[-24, -8, -24, 8]} stroke={c} strokeWidth={2} />
        <Line points={[24, -8, 24, 8]} stroke={c} strokeWidth={2} />
        {isSel && <Text x={-20} y={-22} text="klik lagi = putar 🔄" fontSize={8} fill="#F97316" />}
      </Group>
    );
  };

  const RoomLabelEl = ({ label }: { label: RoomLabel }) => {
    const meta = ROOM_META[label.type] ?? { label: label.type, icon: "🏠", color: "rgba(0,0,0,0.05)", border: "rgba(0,0,0,0.2)" };
    const isSel = selected?.id === label.id;
    return (
      <Group
        x={label.x}
        y={label.y}
        onClick={(e) => {
          e.cancelBubble = true;
          tool === "eraser" ? (snapshot(), removeRoomLabel(label.id)) : setSelected({ type: "label", id: label.id });
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          tool === "eraser" ? (snapshot(), removeRoomLabel(label.id)) : setSelected({ type: "label", id: label.id });
        }}
      >
        <Rect
          x={-52}
          y={-16}
          width={104}
          height={32}
          fill={meta.color}
          stroke={isSel ? "#F97316" : meta.border}
          strokeWidth={isSel ? 2 : 1}
          cornerRadius={8}
        />
        <Text
          x={-48}
          y={-7}
          width={96}
          text={`${meta.icon} ${meta.label}`}
          fontSize={11}
          fill={isSel ? "#F97316" : "#1B2B6B"}
          fontStyle="bold"
          align="center"
        />
      </Group>
    );
  };

  const FurnitureEl = ({ furn }: { furn: CanvasFurniture }) => {
    const isSel = selected?.id === furn.id;
    return (
      <Group
        x={furn.x}
        y={furn.y}
        draggable
        onMouseEnter={() => {
          const container = stageRef.current?.container();
          if (container && tool !== "eraser") container.style.cursor = "grab";
        }}
        onMouseLeave={() => {
          const container = stageRef.current?.container();
          if (container) container.style.cursor = tool === "eraser" || tool === "wall" ? "crosshair" : "default";
        }}
        onClick={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeFurniture(furn.id);
          } else {
            setSelected({ type: "furniture", id: furn.id });
          }
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (tool === "eraser") {
            snapshot();
            removeFurniture(furn.id);
          } else {
            setSelected({ type: "furniture", id: furn.id });
          }
        }}
        onDragStart={() => {
          const container = stageRef.current?.container();
          if (container) container.style.cursor = "grabbing";
        }}
        onDragEnd={(e) => {
          const container = stageRef.current?.container();
          if (container) container.style.cursor = "grab";
          const nx = snap(e.target.x());
          const ny = snap(e.target.y());
          e.target.x(nx);
          e.target.y(ny);
          if (nx !== furn.x || ny !== furn.y) {
            snapshot();
            updateFurniturePosition(furn.id, nx, ny);
          }
        }}
      >
        <Circle
          radius={22}
          fill={isSel ? "#1B2B6B" : "#ffffff"}
          stroke={isSel ? "#F97316" : "#1B2B6B"}
          strokeWidth={isSel ? 3 : 2}
          shadowBlur={isSel ? 12 : 5}
          shadowColor={isSel ? "rgba(249,115,22,0.35)" : "rgba(27,43,107,0.25)"}
          shadowOffsetY={2}
        />
        {isSel && (
          <Circle
            radius={28}
            stroke="#F97316"
            strokeWidth={1.5}
            dash={[4, 4]}
            listening={false}
          />
        )}
        <Text x={-12} y={-13} text={furn.icon} fontSize={20} align="center" listening={false} />
        <Text
          x={-32}
          y={27}
          width={64}
          text={furn.name.split(" ").slice(-1)[0]}
          fontSize={9}
          fill={isSel ? "#F97316" : "#1B2B6B"}
          fontStyle="bold"
          align="center"
          listening={false}
        />
        {furn.annotation && (
          <Group x={20} y={-28} listening={false}>
            <Rect x={0} y={0} width={Math.min(furn.annotation.length * 5.5, 100) + 12} height={18} cornerRadius={9} fill="#10B981" />
            <Text x={6} y={4} text={`✓ ${furn.annotation.slice(0, 18)}`} fontSize={8} fill="white" fontStyle="bold" />
          </Group>
        )}
      </Group>
    );
  };


  // ── Render ──────────────────────────────────────────────────────────────────
  const gridCols = Math.ceil(worldWidth / GRID);
  const gridRows = Math.ceil(worldHeight / GRID);
  const isEmpty = floorPlan.walls.length === 0 && floorPlan.furniture.length === 0;

  // Filter WiFi & Airflow nodes for overlays
  const wifiRouters = floorPlan.furniture.filter((f) => f.product_id.includes("WIFI") || f.product_id.includes("MESH"));
  const windows = floorPlan.windows;
  const fansOrHoods = floorPlan.furniture.filter(
    (f) => f.product_id.includes("FAN") || f.product_id.includes("HOOD") || f.product_id.includes("HOB")
  );

  return (
    <div
      className="relative w-full h-full"
      style={{ cursor: tool === "eraser" || tool === "wall" ? "crosshair" : "default" }}
    >
      {/* Simulation & Heatmap Overlay Toggles (Floating Top Right) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-navy-100 rounded-full px-2 py-1 shadow-sm max-w-[calc(100%-16px)] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setShowWifiHeatmap(!showWifiHeatmap)}
          title="Toggle WiFi 6E Coverage Radar"
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex-shrink-0 active:scale-95 ${
            showWifiHeatmap
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 bg-gray-100"
          }`}
        >
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">WiFi</span>
        </button>

        <button
          onClick={() => setShowAirflow(!showAirflow)}
          title="Toggle Airflow & Ventilation Streams"
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex-shrink-0 active:scale-95 ${
            showAirflow
              ? "bg-cyan-500 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 bg-gray-100"
          }`}
        >
          <Wind className="w-3 h-3" />
          <span className="hidden sm:inline">Airflow</span>
        </button>

        <button
          onClick={() => setShowTrafficFlow(!showTrafficFlow)}
          title="Toggle 90cm Traffic Clearance Corridors"
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex-shrink-0 active:scale-95 ${
            showTrafficFlow
              ? "bg-purple-500 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 bg-gray-100"
          }`}
        >
          <Footprints className="w-3 h-3" />
          <span className="hidden sm:inline">Traffic</span>
        </button>

        <button
          onClick={() => setShowDimensions(!showDimensions)}
          title="Toggle Wall Dimensions"
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex-shrink-0 active:scale-95 ${
            showDimensions
              ? "bg-navy text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 bg-gray-100"
          }`}
        >
          <Ruler className="w-3 h-3" />
          <span className="hidden sm:inline">Dimensi</span>
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full min-h-[420px] sm:min-h-[520px]" onDragOver={handleDragOver} onDrop={handleDrop}>
        <Stage
          ref={stageRef}
          scaleX={canvasScale}
          scaleY={canvasScale}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={handlePlace}
          onTap={handlePlace}
          onDblClick={handleDblClick}
        >
          {/* 1. Background Grid & Simulation Overlays (listening={false}) */}
          <Layer listening={false}>
            <Rect width={worldWidth} height={worldHeight} fill="#F8F9FF" />
            {Array.from({ length: gridCols }).map((_, i) => (
              <Line
                key={`vg${i}`}
                points={[i * GRID, 0, i * GRID, worldHeight]}
                stroke={i % 5 === 0 ? "#DDE3F0" : "#EEF1F8"}
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
              />
            ))}
            {Array.from({ length: gridRows }).map((_, i) => (
              <Line
                key={`hg${i}`}
                points={[0, i * GRID, worldWidth, i * GRID]}
                stroke={i % 5 === 0 ? "#DDE3F0" : "#EEF1F8"}
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
              />
            ))}

            {/* WiFi Coverage Heatmap Rings */}
            {showWifiHeatmap &&
              wifiRouters.map((router) => (
                <Group key={`wifi-${router.id}`}>
                  <Circle x={router.x} y={router.y} radius={140} fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth={1.5} dash={[6, 4]} />
                  <Circle x={router.x} y={router.y} radius={90} fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth={1.5} dash={[4, 4]} />
                  <Circle x={router.x} y={router.y} radius={45} fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.6)" strokeWidth={2} />
                  <Text x={router.x + 35} y={router.y - 12} text="WiFi 6E (> -45dBm)" fontSize={8} fill="#059669" fontStyle="bold" />
                </Group>
              ))}

            {/* Airflow Vector Streams */}
            {showAirflow &&
              windows.map((win) => {
                const nearestFan = fansOrHoods[0];
                if (!nearestFan) return null;
                return (
                  <Group key={`air-${win.id}`}>
                    <Arrow
                      points={[win.x, win.y, (win.x + nearestFan.x) / 2, (win.y + nearestFan.y) / 2 - 20, nearestFan.x, nearestFan.y]}
                      tension={0.4}
                      stroke="rgba(6, 182, 212, 0.6)"
                      fill="rgba(6, 182, 212, 0.6)"
                      strokeWidth={2}
                      dash={[8, 5]}
                      pointerLength={6}
                      pointerWidth={5}
                    />
                    <Text x={(win.x + nearestFan.x) / 2 - 25} y={(win.y + nearestFan.y) / 2 - 32} text="🍃 Natural Breeze" fontSize={8} fill="#0891B2" fontStyle="bold" />
                  </Group>
                );
              })}

            {/* Traffic Clearance Paths */}
            {showTrafficFlow &&
              floorPlan.doors.map((door) => (
                <Group key={`traffic-${door.id}`}>
                  <Line points={[door.x, door.y, door.x, door.y + 60]} stroke="rgba(168, 85, 247, 0.5)" strokeWidth={16} lineCap="round" opacity={0.3} />
                  <Line points={[door.x, door.y, door.x, door.y + 60]} stroke="#9333EA" strokeWidth={1.5} dash={[4, 4]} />
                  <Text x={door.x + 12} y={door.y + 25} text="🚶 90cm Clearance" fontSize={8} fill="#9333EA" fontStyle="bold" />
                </Group>
              ))}
          </Layer>

          {/* 2. Interactive Floor Plan & Furniture Layer */}
          <Layer>
            {/* Walls */}
            {floorPlan.walls.map((w) => (
              <WallEl key={w.id} wall={w} />
            ))}
            {/* Wall endpoint dots */}
            {floorPlan.walls.map((w) => [
              <Circle key={`ep1-${w.id}`} x={w.x1} y={w.y1} radius={4} fill="#1B2B6B" opacity={0.3} listening={false} />,
              <Circle key={`ep2-${w.id}`} x={w.x2} y={w.y2} radius={4} fill="#1B2B6B" opacity={0.3} listening={false} />,
            ])}
            {/* Drawing preview */}
            {tool === "wall" && wallStart && (
              <>
                <Line
                  points={[wallStart.x, wallStart.y, previewPos.x, previewPos.y]}
                  stroke="#F97316"
                  strokeWidth={4}
                  dash={[10, 6]}
                  lineCap="round"
                  listening={false}
                />
                <Circle x={wallStart.x} y={wallStart.y} radius={7} fill="#F97316" listening={false} />
                <Circle
                  x={previewPos.x}
                  y={previewPos.y}
                  radius={5}
                  fill={snappedEndpoint ? "#10B981" : "#F97316"}
                  opacity={0.7}
                  listening={false}
                />
              </>
            )}
            {/* Snap indicator */}
            {tool === "wall" && snappedEndpoint && (
              <Circle
                x={snappedEndpoint.x}
                y={snappedEndpoint.y}
                radius={12}
                stroke="#10B981"
                strokeWidth={2}
                fill="rgba(16,185,129,0.1)"
                listening={false}
              />
            )}

            {/* Doors & Windows */}
            {floorPlan.doors.map((d) => (
              <DoorEl key={d.id} door={d} />
            ))}
            {floorPlan.windows.map((w) => (
              <WindowEl key={w.id} win={w} />
            ))}

            {/* Room Labels */}
            {floorPlan.roomLabels.map((l) => (
              <RoomLabelEl key={l.id} label={l} />
            ))}

            {/* Furniture (Rendered at top for smooth dragging) */}
            {floorPlan.furniture.map((f) => (
              <FurnitureEl key={f.id} furn={f} />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Empty canvas guide */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 opacity-40">
            <div className="text-5xl">✏️</div>
            <p className="text-navy-400 font-semibold text-sm">Mula lukis pelan lantai anda</p>
            <div className="text-xs text-navy-300 space-y-1">
              <p>
                1. Pilih <strong>— Dinding</strong> dan klik untuk lukis (atau klik <strong>Templat</strong> di atas)
              </p>
              <p>
                2. Letak <strong>🚪 Pintu</strong> dan <strong>🪟 Tingkap</strong>
              </p>
              <p>
                3. Label bilik dengan <strong>🏷️ Label Bilik</strong>
              </p>
              <p>4. Seret perabot atau klik <strong>AI Stylist</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Room label popup */}
      {labelPopup && (
        <div
          className="absolute z-50 bg-white border border-navy-100 rounded-2xl shadow-xl p-3 min-w-[180px] max-w-[90vw]"
          style={{
            left: Math.max(8, Math.min(labelPopup.screenX + 8, dimensions.width - 200)),
            top: Math.max(8, Math.min(labelPopup.screenY - 20, dimensions.height - 240)),
          }}
        >
          <p className="text-xs font-bold text-navy-600 mb-2">Pilih Jenis Bilik</p>
          <div className="space-y-1">
            {Object.entries(ROOM_META).map(([type, meta]) => (
              <button
                key={type}
                onClick={() => handleAddRoomLabel(type)}
                className="w-full text-left text-xs px-2.5 py-1.5 rounded-xl hover:bg-navy-50 flex items-center gap-2 text-navy-600 font-medium transition-colors active:bg-navy-100"
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setLabelPopup(null)}
            className="w-full text-xs font-medium text-gray-400 mt-2 py-1 hover:text-gray-600 border-t border-navy-50"
          >
            Batal
          </button>
        </div>
      )}

      {/* Contextual hints */}
      {tool === "wall" && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy/90 text-white text-[11px] sm:text-xs px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap shadow-md max-w-[92vw] truncate text-center z-20">
          {wallStart ? "Sentuh untuk sambung • 2x tekan untuk tamat" : "Sentuh titik mula dinding"}
        </div>
      )}
      {tool === "select" && selected && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy/90 text-white text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full pointer-events-none shadow-md max-w-[92vw] truncate text-center z-20">
          {selected.type === "furniture"
            ? "🖱️ Seret tetikus atau guna kekunci anak panah (← ↑ → ↓) untuk gerakkan · Del padam"
            : selected.type === "door" || selected.type === "window"
            ? "Tekan lagi untuk putar · Del padam"
            : "Tekan Padam (✕) untuk padam"}
        </div>
      )}
    </div>
  );
}
