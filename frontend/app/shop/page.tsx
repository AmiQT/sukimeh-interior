"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Wind,
  Footprints,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import ShopBundle from "@/components/ShopBundle";
import ScoreCard from "@/components/ScoreCard";
import CartDrawer from "@/components/CartDrawer";
import { useAppStore, BundleProduct } from "@/lib/store";
import { createProposal } from "@/lib/foundry";

export default function ShopPage() {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const {
    layoutData,
    uploadedFileUrl,
    imagePath,
    addToCart,
    getCartCount,
    getCartTotal,
  } = useAppStore();

  useEffect(() => {
    if (!layoutData) {
      router.replace("/");
    }
  }, [layoutData, router]);

  if (!layoutData) return null;

  const imageUrl =
    uploadedFileUrl ||
    (imagePath
      ? `/uploads${imagePath.replace("/uploads", "")}`
      : null);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const handleAddToCart = (product: BundleProduct) => {
    addToCart(product);
    toast.success(`${product.name} ditambah ke troli!`, {
      description: `RM ${product.price.toLocaleString()}`,
      action: {
        label: "Lihat Troli",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handlePurchaseAll = () => {
    layoutData!.bundle.products.forEach((p) => addToCart(p));
    toast.success("Semua item ditambah ke troli!", {
      description: `${layoutData!.bundle.products.length} item — RM ${layoutData!.bundle.total_discounted.toLocaleString()}`,
      action: {
        label: "Lihat Troli",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handleShare = async () => {
    try {
      const result = await createProposal(layoutData, imageUrl ?? undefined);
      const proposalUrl = `${window.location.origin}/proposal/${result.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(proposalUrl);
      } else {
        // Fallback untuk browser yang tak support clipboard API
        const ta = document.createElement("textarea");
        ta.value = proposalUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Link proposal disalin!", {
        description: proposalUrl,
        action: {
          label: "Buka",
          onClick: () => window.open(proposalUrl, "_blank"),
        },
      });
    } catch {
      toast.error("Gagal cipta shareable link — Cuba semula");
    }
  };

  const tags = [
    { label: "100% Coverage", icon: Shield },
    { label: "Airflow Optimized", icon: Wind },
    { label: "Traffic Flow Clear", icon: Footprints },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-3 px-6 shadow-card sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/layout")}
              className="p-2 hover:bg-navy-600 rounded-btn transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h1 className="text-base font-display">Shop the Look</h1>
            </div>
          </div>
          {/* Cart indicator */}
          {cartCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-accent hover:bg-accent-500 text-white px-3 py-2 rounded-btn transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{cartCount} item</span>
              <span className="hidden sm:inline">— RM {cartTotal.toLocaleString()}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="bg-dark rounded-card overflow-hidden shadow-card mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Room image */}
            <div className="md:w-1/2">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Room layout"
                  className="w-full h-64 md:h-80 object-contain bg-navy-800"
                />
              ) : (
                <div className="w-full h-64 md:h-80 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                </div>
              )}
            </div>

            {/* Room info */}
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <ScoreCard score={layoutData.score} />
                <div>
                  <h2 className="text-2xl font-display text-white">
                    Your AI-Designed Space
                  </h2>
                  <p className="text-navy-200 text-sm mt-1">
                    {layoutData.rooms.length} rooms •{" "}
                    {layoutData.furniture_placements.length} items placed
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-600/50 rounded-full text-xs text-navy-100"
                  >
                    <tag.icon className="w-3 h-3" />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Intelligence card */}
        <div className="bg-white rounded-card p-6 border border-navy-100 shadow-sm mb-8">
          <h3 className="font-display text-lg text-navy-500 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            AI Layout Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layoutData.smart_optimizations.map((opt, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-navy-500">
                    {opt.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop bundle */}
        <ShopBundle
          bundle={layoutData.bundle}
          onAddToCart={handleAddToCart}
          onPurchaseAll={handlePurchaseAll}
          onShare={handleShare}
        />
      </main>

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
