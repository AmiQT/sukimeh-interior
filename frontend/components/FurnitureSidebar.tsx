"use client";

import { useAppStore } from "@/lib/store";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import ProductArt from "@/components/ProductArt";
import { Plus } from "lucide-react";

export const CATALOG = [
  // Living Room
  { product_id: "RUMA-SOFA-01",   name: "Sofa",         icon: "🛋️", category: "Living Room" },
  { product_id: "RUMA-TV-01",    name: "TV",           icon: "📺", category: "Living Room" },
  { product_id: "RUMA-TABLE-01",     name: "Coffee Table", icon: "☕", category: "Living Room" },
  { product_id: "RUMA-FAN-01",    name: "Ceiling Fan",  icon: "🌀", category: "Living Room" },
  { product_id: "RUMA-WIFI-01",   name: "WiFi Router",  icon: "📡", category: "Living Room" },
  // Kitchen
  { product_id: "DAPUR-HOOD-01",  name: "Hood",         icon: "🔥", category: "Kitchen" },
  { product_id: "DAPUR-HOB-01",   name: "Hob",          icon: "🍳", category: "Kitchen" },
  { product_id: "DAPUR-FRIDGE-01",name: "Fridge",       icon: "🧊", category: "Kitchen" },
  { product_id: "DAPUR-DISHWASHER-01",    name: "Dishwasher",   icon: "🫧", category: "Kitchen" },
  // Bedroom
  { product_id: "RUMA-BED-01",    name: "Bed",          icon: "🛏️", category: "Bedroom" },
  { product_id: "RUMA-WARDROBE-01",     name: "Wardrobe",     icon: "🗄️", category: "Bedroom" },
  // Smart
  { product_id: "RUMA-SENSOR-01",   name: "Smart Sensor", icon: "📡", category: "Smart" },
  { product_id: "RUMA-MESH-01",   name: "Mesh Extender",icon: "📶", category: "Smart" },
] as const;

export type CatalogItem = typeof CATALOG[number];

const CATEGORIES = ["Living Room", "Kitchen", "Bedroom", "Smart"];

interface FurnitureSidebarProps {
  onItemAdded?: (item: CatalogItem) => void;
}

export default function FurnitureSidebar({ onItemAdded }: FurnitureSidebarProps) {
  const { addFurniture } = useAppStore();

  const handleDragStart = (e: React.DragEvent, item: CatalogItem) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "furniture",
      JSON.stringify({ product_id: item.product_id, name: item.name, icon: item.icon })
    );
  };

  const handleItemClick = (item: CatalogItem) => {
    // Add to canvas at default center
    const x = 360 + Math.floor(Math.random() * 60 - 30);
    const y = 260 + Math.floor(Math.random() * 60 - 30);
    addFurniture({
      id: nanoid(8),
      product_id: item.product_id,
      name: item.name,
      icon: item.icon,
      x,
      y,
    });
    toast.success(`${item.icon} ${item.name} ditambah ke kanvas`, {
      description: "Anda boleh seret & ubah kedudukan atas kanvas.",
    });
    onItemAdded?.(item);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <h3 className="text-sm font-bold text-navy-500 flex items-center justify-between">
          <span>Katalog Perabot</span>
          <span className="text-[10px] bg-navy-50 text-navy-400 px-2 py-0.5 rounded-full font-normal">
            13 Produk
          </span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          <span className="hidden sm:inline">Seret ke kanvas atau tekan</span>
          <span className="sm:hidden">Tekan ikon untuk letak atas kanvas</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3.5">
        {CATEGORIES.map((cat) => {
          const items = CATALOG.filter((c) => c.category === cat);
          return (
            <div key={cat}>
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5 px-1">
                {cat}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                {items.map((item) => (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleItemClick(item); } }}
                    key={item.product_id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    className="flex flex-col items-center gap-1 p-2 bg-white border border-navy-100 rounded-xl cursor-pointer hover:border-accent hover:shadow-sm active:scale-95 transition-all select-none group relative"
                    title={`Tekan untuk letak ${item.name} ke kanvas`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      <ProductArt sku={item.product_id} className="w-8 h-8 text-navy-400" />
                    </span>
                    <span className="text-[10px] font-semibold text-navy-600 text-center leading-tight">
                      {item.name}
                    </span>
                    <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 sm:opacity-0 text-[9px] bg-accent text-white rounded-full p-0.5 transition-opacity">
                      <Plus className="w-2.5 h-2.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
