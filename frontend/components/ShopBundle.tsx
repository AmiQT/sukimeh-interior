"use client";

import ProductArt from "@/components/ProductArt";
import { useAppStore } from "@/lib/store";
import { BundleProduct, Bundle } from "@/lib/store";
import { ShoppingCart, Package, Tag, Check, Plus } from "lucide-react";

interface ShopBundleProps {
  bundle: Bundle;
  onAddToCart: (product: BundleProduct) => void;
  onPurchaseAll: () => void;
  onShare: () => void;
}

export default function ShopBundle({
  bundle,
  onAddToCart,
  onPurchaseAll,
  onShare,
}: ShopBundleProps) {
  const cart = useAppStore((s) => s.cart);
  const addedIds = new Set(cart.map((item) => item.id));
  const savings = bundle.total_original - bundle.total_discounted;
  const savingsPercent = bundle.total_original > 0 ? Math.round((savings / bundle.total_original) * 100) : 0;

  const handleAdd = (product: BundleProduct) => {
    onAddToCart(product);

  };

  const handlePurchaseAllClick = () => {
    // Mark all as added visually

    onPurchaseAll();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-navy-400 bg-navy-50 rounded-xl p-4">Katalog rekaan untuk demo. Harga bukan tawaran jualan; tiada bayaran atau penghantaran.</p>
      {/* Products list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-navy-500 flex items-center gap-2">
            <span className="text-accent">📦</span>
            Pilihan untuk ruang anda
          </h3>
          <span className="text-xs text-gray-400">
            {addedIds.size}/{bundle.products.length} dalam troli
          </span>
        </div>

        <div className="space-y-3">
          {bundle.products.map((product) => {
            const isAdded = addedIds.has(product.id);
            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 bg-white rounded-card p-4 border shadow-sm transition-all ${
                  isAdded
                    ? "border-green-200 bg-green-50"
                    : "border-navy-100 hover:shadow-card"
                }`}
              >
                {/* Product icon */}
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 text-3xl ${
                    isAdded ? "bg-green-100" : "bg-navy-50"
                  }`}
                >
                  {isAdded ? (
                    <Check className="w-7 h-7 text-green-500" />
                  ) : (
                    <ProductArt sku={product.sku || product.id} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy-500 truncate">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    SKU: {product.sku}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-navy-500">
                      RM {product.price.toLocaleString()}
                    </span>
                    {product.original_price > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        RM {product.original_price.toLocaleString()}
                      </span>
                    )}
                    {product.original_price > product.price && (
                      <span className="text-xs text-green-600 font-medium">
                        -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  disabled={isAdded}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-btn transition-all flex-shrink-0 ${
                    isAdded
                      ? "bg-green-100 text-green-700 cursor-default"
                      : "bg-navy hover:bg-navy-600 text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Ditambah
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-navy-100 rounded-card p-4 shadow-hover -mx-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" />
              <span className="text-xs text-gray-500">Harga Bundle</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-navy-500">
                RM {bundle.total_discounted.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                RM {bundle.total_original.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-green-600 font-medium mt-0.5">
              Jimat RM {savings.toLocaleString()} ({savingsPercent}% diskaun)
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePurchaseAllClick}
            className="flex-1 bg-accent hover:bg-accent-500 text-white font-semibold py-3 px-6 rounded-btn transition-colors flex items-center justify-center gap-2 shadow-card"
          >
            <ShoppingCart className="w-4 h-4" />
            Tambah Pakej Demo →
          </button>
          <button
            onClick={onShare}
            className="px-4 py-3 bg-navy-50 hover:bg-navy-100 text-navy-500 font-medium rounded-btn transition-colors text-sm"
          >
            Kongsi 🔗
          </button>
        </div>
      </div>
    </div>
  );
}
