"use client";

import { FurniturePlacement } from "@/lib/store";

interface FurniturePanelProps {
  placements: FurniturePlacement[];
  selectedRoom: string;
  selectedFurniture: string | null;
  onSelectRoom: (room: string) => void;
  onSelectFurniture: (id: string | null) => void;
}

const ROOM_TABS = [
  { key: "all", label: "All Rooms", icon: "🏠" },
  { key: "kitchen", label: "Kitchen", icon: "🍳" },
  { key: "living_room", label: "Living Room", icon: "🛋️" },
  { key: "bedroom", label: "Bedroom", icon: "🛏️" },
];

export default function FurniturePanel({
  placements,
  selectedRoom,
  selectedFurniture,
  onSelectRoom,
  onSelectFurniture,
}: FurniturePanelProps) {
  const filtered =
    selectedRoom === "all"
      ? placements
      : placements.filter((p) => p.room === selectedRoom);

  return (
    <div className="space-y-4">
      {/* Room tabs */}
      <div className="flex gap-1 bg-navy-50 p-1 rounded-btn overflow-x-auto">
        {ROOM_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSelectRoom(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              selectedRoom === tab.key
                ? "bg-navy text-white shadow-sm"
                : "text-navy-400 hover:bg-navy-100"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Furniture list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filtered.map((item) => (
          <button
            key={item.product_id}
            onClick={() =>
              onSelectFurniture(
                selectedFurniture === item.product_id ? null : item.product_id
              )
            }
            className={`w-full flex items-center gap-3 p-3 rounded-btn text-left transition-all ${
              selectedFurniture === item.product_id
                ? "bg-accent-50 border border-accent shadow-sm"
                : "bg-white border border-navy-100 hover:border-navy-300 hover:shadow-sm"
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-navy-500 truncate">
                {item.name}
              </div>
              <div className="text-xs text-gray-500">{item.annotation}</div>
            </div>
            <div className="text-xs text-navy-300 flex-shrink-0">
              {item.room.replace("_", " ")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
