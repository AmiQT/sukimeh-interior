import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RoomAnalysis {
  type: string;
  confidence: number;
  approximate_size: string;
  features: string[];
}

export interface FurniturePlacement {
  product_id: string;
  name: string;
  room: string;
  x_percent: number;
  y_percent: number;
  rotation: number;
  annotation: string;
  icon: string;
}

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
  rooms: RoomAnalysis[];
  furniture_placements: FurniturePlacement[];
  smart_optimizations: SmartOptimization[];
  bundle: Bundle;
}

export interface CartItem extends BundleProduct {
  quantity: number;
}

export interface AppState {
  // Upload state
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  imagePath: string | null;

  // Analysis state
  analysis: {
    rooms: RoomAnalysis[];
    overall_layout: string;
    image_quality: string;
  } | null;

  // Layout state
  layoutData: LayoutData | null;
  selectedRoom: string;
  selectedFurniture: string | null;

  // Cart state
  cart: CartItem[];

  // Actions
  setUploadedFile: (file: File | null, url: string | null) => void;
  setImagePath: (path: string | null) => void;
  setAnalysis: (analysis: any) => void;
  setLayoutData: (data: LayoutData | null) => void;
  setSelectedRoom: (room: string) => void;
  setSelectedFurniture: (id: string | null) => void;
  updateFurniturePosition: (productId: string, x: number, y: number) => void;
  addToCart: (product: BundleProduct) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  reset: () => void;
}

const initialState = {
  uploadedFile: null,
  uploadedFileUrl: null,
  imagePath: null,
  analysis: null,
  layoutData: null,
  selectedRoom: "all",
  selectedFurniture: null,
  cart: [] as CartItem[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUploadedFile: (file, url) =>
        set({ uploadedFile: file, uploadedFileUrl: url }),

      setImagePath: (path) => set({ imagePath: path }),

      setAnalysis: (analysis) => set({ analysis }),

      setLayoutData: (data) => set({ layoutData: data }),

      setSelectedRoom: (room) => set({ selectedRoom: room }),

      setSelectedFurniture: (id) => set({ selectedFurniture: id }),

      updateFurniturePosition: (productId, x, y) => {
        const state = get();
        if (!state.layoutData) return;
        const placements = state.layoutData.furniture_placements.map((p) =>
          p.product_id === productId
            ? { ...p, x_percent: x, y_percent: y }
            : p
        );
        set({
          layoutData: {
            ...state.layoutData,
            furniture_placements: placements,
          },
        });
      },

      addToCart: (product) => {
        const state = get();
        const existing = state.cart.find((i) => i.id === product.id);
        if (existing) {
          set({
            cart: state.cart.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ cart: [...state.cart, { ...product, quantity: 1 }] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((i) => i.id !== productId) });
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity < 1) {
          set({ cart: get().cart.filter((i) => i.id !== productId) });
        } else {
          set({
            cart: get().cart.map((i) =>
              i.id === productId ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () =>
        get().cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      getCartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      reset: () => set(initialState),
    }),
    {
      name: "sukimeh-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        uploadedFileUrl: state.uploadedFileUrl,
        imagePath: state.imagePath,
        analysis: state.analysis,
        layoutData: state.layoutData,
        selectedRoom: state.selectedRoom,
        cart: state.cart,
      }),
    }
  )
);
