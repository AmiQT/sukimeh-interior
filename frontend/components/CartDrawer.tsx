"use client";
import { useDialog } from "@/lib/useDialog";

import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ShoppingBag, Package } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartCount } =
    useAppStore();

  const total = getCartTotal();
  const count = getCartCount();
  const originalTotal = cart.reduce(
    (sum, item) => sum + item.original_price * item.quantity,
    0
  );
  const savings = originalTotal - total;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Troli demo"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-navy text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-display text-base">Troli Anda</h2>
              <p className="text-xs text-navy-200">{count} item dipilih</p>
            </div>
          </div>
          <button
            aria-label="Tutup troli"
            onClick={onClose}
            className="p-2 hover:bg-navy-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Package className="w-16 h-16 text-navy-200 mb-4" />
              <p className="text-navy-400 font-medium">Troli kosong</p>
              <p className="text-sm text-gray-400 mt-1">Tambah item dari senarai produk</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-gray-50 rounded-card p-3 border border-navy-100"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-navy-300" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-500 leading-tight line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-navy-500">
                      RM {(item.price * item.quantity).toLocaleString()}
                    </span>
                    {item.original_price > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        RM {(item.original_price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity control + remove */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-btn">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-l-btn transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-navy-500">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-r-btn transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — summary + checkout */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t border-navy-100 px-6 py-5 bg-white space-y-4">
            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Harga asal</span>
                <span>RM {originalTotal.toLocaleString()}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Diskaun bundle</span>
                  <span>- RM {savings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-500 font-bold text-base pt-1 border-t border-navy-100">
                <span>Jumlah</span>
                <span>RM {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <button
              onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent-500 text-white font-semibold py-3.5 rounded-btn transition-colors flex items-center justify-center gap-2 shadow-card"
            >
              <ShoppingBag className="w-4 h-4" />
              Teruskan ke Ringkasan demo →
            </button>
            <button
              onClick={() => {
                clearCart();
              }}
              className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Kosongkan troli
            </button>
          </div>
        )}
      </div>
    </>
  );
}
