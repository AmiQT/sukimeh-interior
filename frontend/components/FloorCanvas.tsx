"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Circle, Group, Image as KonvaImage } from "react-konva";
import { FurniturePlacement } from "@/lib/store";

interface FloorCanvasProps {
  imageUrl: string | null;
  placements: FurniturePlacement[];
  selectedRoom: string;
  selectedFurniture: string | null;
  score: number;
  onSelectFurniture: (id: string | null) => void;
  onDragEnd: (productId: string, x: number, y: number) => void;
}

function useImage(url: string | null): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = url;
  }, [url]);

  return image;
}

const ANNOTATION_ICONS: Record<string, string> = {
  "WiFi Optimal — Central Position": "📡",
  "WiFi Optimal": "📡",
  "Airflow Optimized": "💨",
  "Traffic Flow Clear": "🚶",
  "Central Airflow": "💨",
};

function FurnitureItem({
  placement,
  canvasWidth,
  canvasHeight,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  placement: FurniturePlacement;
  canvasWidth: number;
  canvasHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const x = (placement.x_percent / 100) * canvasWidth;
  const y = (placement.y_percent / 100) * canvasHeight;
  const size = 50;

  return (
    <Group
      x={x}
      y={y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const newX = (e.target.x() / canvasWidth) * 100;
        const newY = (e.target.y() / canvasHeight) * 100;
        onDragEnd(
          Math.max(0, Math.min(100, newX)),
          Math.max(0, Math.min(100, newY))
        );
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={size / 2 + 8}
          fill="rgba(249,115,22,0.15)"
          stroke="#F97316"
          strokeWidth={2}
        />
      )}

      {/* Background circle */}
      <Circle
        x={0}
        y={0}
        radius={size / 2}
        fill={isSelected ? "#1B2B6B" : "#FFFFFF"}
        stroke={isSelected ? "#F97316" : "#1B2B6B"}
        strokeWidth={2}
        shadowBlur={isSelected ? 12 : 6}
        shadowColor="rgba(27,43,107,0.2)"
        shadowOffsetY={2}
      />

      {/* Icon */}
      <Text
        x={-14}
        y={-12}
        text={placement.icon}
        fontSize={22}
        align="center"
      />

      {/* Label */}
      <Text
        x={-40}
        y={size / 2 + 4}
        width={80}
        text={placement.name.split(" ").slice(-1)[0]}
        fontSize={10}
        fill={isSelected ? "#F97316" : "#1B2B6B"}
        fontStyle="bold"
        align="center"
      />

      {/* Annotation badge */}
      {placement.annotation && (
        <>
          <Rect
            x={size / 2 - 4}
            y={-size / 2 - 2}
            width={12}
            height={12}
            cornerRadius={6}
            fill="#10B981"
          />
          <Text
            x={size / 2 - 2}
            y={-size / 2}
            text="✓"
            fontSize={8}
            fill="white"
            fontStyle="bold"
          />
        </>
      )}
    </Group>
  );
}

export default function FloorCanvas({
  imageUrl,
  placements,
  selectedRoom,
  selectedFurniture,
  score,
  onSelectFurniture,
  onDragEnd,
}: FloorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const bgImage = useImage(imageUrl);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.max(500, rect.height),
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const filteredPlacements =
    selectedRoom === "all"
      ? placements
      : placements.filter((p) => p.room === selectedRoom);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative bg-gray-50 rounded-card overflow-hidden">
      {/* Score badge */}
      <div className="absolute top-4 right-4 z-10 bg-navy text-white px-4 py-2 rounded-full shadow-card flex items-center gap-2">
        <span className="text-accent font-bold text-lg">{score}%</span>
        <span className="text-xs text-navy-100">Match</span>
      </div>

      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectFurniture(null);
          }
        }}
      >
        {/* Background layer */}
        <Layer>
          {bgImage ? (
            <KonvaImage
              image={bgImage}
              width={dimensions.width}
              height={dimensions.height}
              opacity={0.3}
            />
          ) : (
            <>
              <Rect
                width={dimensions.width}
                height={dimensions.height}
                fill="#F1F5F9"
              />
              {/* Grid lines */}
              {Array.from({ length: 20 }).map((_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={(dimensions.width / 20) * i}
                  y={0}
                  width={1}
                  height={dimensions.height}
                  fill="#E2E8F0"
                />
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={(dimensions.height / 15) * i}
                  width={dimensions.width}
                  height={1}
                  fill="#E2E8F0"
                />
              ))}
            </>
          )}
        </Layer>

        {/* Furniture layer */}
        <Layer>
          {filteredPlacements.map((placement) => (
            <FurnitureItem
              key={placement.product_id}
              placement={placement}
              canvasWidth={dimensions.width}
              canvasHeight={dimensions.height}
              isSelected={selectedFurniture === placement.product_id}
              onSelect={() => onSelectFurniture(placement.product_id)}
              onDragEnd={(x, y) => onDragEnd(placement.product_id, x, y)}
            />
          ))}
        </Layer>

        {/* Annotation layer */}
        <Layer>
          {filteredPlacements
            .filter((p) => p.annotation)
            .map((placement) => {
              const x = (placement.x_percent / 100) * dimensions.width;
              const y = (placement.y_percent / 100) * dimensions.height;
              const annotIcon =
                ANNOTATION_ICONS[placement.annotation] || "✅";
              return (
                <Group key={`ann-${placement.product_id}`} x={x + 30} y={y - 30}>
                  <Rect
                    x={0}
                    y={0}
                    width={placement.annotation.length * 5.5 + 30}
                    height={20}
                    cornerRadius={10}
                    fill="rgba(27,43,107,0.85)"
                  />
                  <Text
                    x={6}
                    y={4}
                    text={`${annotIcon} ${placement.annotation}`}
                    fontSize={9}
                    fill="white"
                    fontStyle="500"
                  />
                </Group>
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}
