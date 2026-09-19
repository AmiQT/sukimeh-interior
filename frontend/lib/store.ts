import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Floor plan drawing types ──────────────────────────────────────────────────
export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DoorElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

export interface WindowElement {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

export interface RoomLabel {
  id: string;
  x: number;
  y: number;
  type: string;
}

export interface CanvasFurniture {
  id: string;
  product_id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  annotation?: string;
}

export interface FloorPlan {
  walls: Wall[];
  doors: DoorElement[];
  windows: WindowElement[];
  roomLabels: RoomLabel[];
  furniture: CanvasFurniture[];
}

// ── AI result / shop types ────────────────────────────────────────────────────
export interface SmartOptimization {
  type: string;
  title: string;
  desc: string;
}

export interface BundleProduct {
  id: string;
  name: string;
  price: number;
  original_price: number;
  thumbnail: string;
  sku: string;
}

export interface Bundle {
  products: BundleProduct[];
  total_original: number;
  total_discounted: number;
}

export interface LayoutData {
  layout_id: string;
  score: number;
  smart_optimizations: SmartOptimization[];
  bundle: Bundle;
}

export interface CartItem extends BundleProduct {
  quantity: number;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export interface AppState {
  floorPlan: FloorPlan;
  layoutData: LayoutData | null;
  cart: CartItem[];

  // Floor plan actions
  addWall: (wall: Wall) => void;
  removeWall: (id: string) => void;
  addDoor: (door: DoorElement) => void;
  removeDoor: (id: string) => void;
  updateDoorRotation: (id: string, rotation: number) => void;
  addWindow: (win: WindowElement) => void;
  removeWindow: (id: string) => void;
  updateWindowRotation: (id: string, rotation: number) => void;
  addRoomLabel: (label: RoomLabel) => void;
  removeRoomLabel: (id: string) => void;
  addFurniture: (item: CanvasFurniture) => void;
  removeFurniture: (id: string) => void;
  updateFurniturePosition: (id: string, x: number, y: number) => void;
  setFloorPlan: (plan: FloorPlan) => void;
  clearFloorPlan: () => void;

  // AI result actions
  setLayoutData: (data: LayoutData | null) => void;

  // Cart actions
  addToCart: (product: BundleProduct) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  reset: () => void;
}

const emptyFloorPlan: FloorPlan = {
  walls: [],
  doors: [],
  windows: [],
  roomLabels: [],
  furniture: [],
};

const initialState = {
  floorPlan: emptyFloorPlan,
  layoutData: null,
  cart: [] as CartItem[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addWall: (wall) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, walls: [...s.floorPlan.walls, wall] } })),
      removeWall: (id) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, walls: s.floorPlan.walls.filter((w) => w.id !== id) } })),

      addDoor: (door) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, doors: [...s.floorPlan.doors, door] } })),
      removeDoor: (id) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, doors: s.floorPlan.doors.filter((d) => d.id !== id) } })),
      updateDoorRotation: (id, rotation) =>
        set((s) => ({
          floorPlan: {
            ...s.floorPlan,
            doors: s.floorPlan.doors.map((d) => (d.id === id ? { ...d, rotation } : d)),
          },
        })),

      addWindow: (win) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, windows: [...s.floorPlan.windows, win] } })),
      removeWindow: (id) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, windows: s.floorPlan.windows.filter((w) => w.id !== id) } })),
      updateWindowRotation: (id, rotation) =>
        set((s) => ({
          floorPlan: {
            ...s.floorPlan,
            windows: s.floorPlan.windows.map((w) => (w.id === id ? { ...w, rotation } : w)),
          },
        })),

      addRoomLabel: (label) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, roomLabels: [...s.floorPlan.roomLabels, label] } })),
      removeRoomLabel: (id) =>
        set((s) => ({
          floorPlan: { ...s.floorPlan, roomLabels: s.floorPlan.roomLabels.filter((l) => l.id !== id) },
        })),

      addFurniture: (item) =>
        set((s) => ({ floorPlan: { ...s.floorPlan, furniture: [...s.floorPlan.furniture, item] } })),
      removeFurniture: (id) =>
        set((s) => ({
          floorPlan: { ...s.floorPlan, furniture: s.floorPlan.furniture.filter((f) => f.id !== id) },
        })),
      updateFurniturePosition: (id, x, y) =>
        set((s) => ({
          floorPlan: {
            ...s.floorPlan,
            furniture: s.floorPlan.furniture.map((f) => (f.id === id ? { ...f, x, y } : f)),
          },
        })),

      setFloorPlan: (plan) => set({ floorPlan: plan }),
      clearFloorPlan: () => set({ floorPlan: emptyFloorPlan, layoutData: null }),

      setLayoutData: (data) => set({ layoutData: data }),

      addToCart: (product) => {
        const state = get();
        const existing = state.cart.find((i) => i.id === product.id);
        if (existing) {
          set({ cart: state.cart.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)) });
        } else {
          set({ cart: [...state.cart, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter((i) => i.id !== productId) }),
      updateCartQuantity: (productId, quantity) => {
        if (quantity < 1) {
          set({ cart: get().cart.filter((i) => i.id !== productId) });
        } else {
          set({ cart: get().cart.map((i) => (i.id === productId ? { ...i, quantity } : i)) });
        }
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      reset: () => set(initialState),
    }),
    {
      name: "ruma-store",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        floorPlan: state.floorPlan,
        layoutData: state.layoutData,
        cart: state.cart,
      }),
    }
  )
);
