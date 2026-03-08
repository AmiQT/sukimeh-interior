"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Package,
  ArrowRight,
  Shield,
  Wind,
  Footprints,
} from "lucide-react";
import ScoreCard from "@/components/ScoreCard";
import { getProposal } from "@/lib/foundry";

interface ProposalData {
  id: string;
  layout: {
    layout_id: string;
    score: number;
    rooms: any[];
    furniture_placements: any[];
    smart_optimizations: { type: string; title: string; desc: string }[];
    bundle: {
      products: {
        id: string;
        name: string;
        price: number;
        original_price: number;
        thumbnail: string;
        sku: string;
      }[];
      total_original: number;
      total_discounted: number;
    };
  };
  image_url: string | null;
  created_at: string;
}

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const id = params.id as string;
        const data = await getProposal(id);
        setProposal(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-400 font-medium">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-display text-navy mb-2">
            Proposal Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            This proposal link may have expired or doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-accent hover:bg-accent-500 text-white font-semibold px-6 py-3 rounded-btn transition-colors"
          >
            Get Your Own Design
          </button>
        </div>
      </div>
    );
  }

  const { layout } = proposal;
  const savings = layout.bundle.total_original - layout.bundle.total_discounted;
  const tags = [
    { label: "100% Coverage", icon: Shield },
    { label: "Airflow Optimized", icon: Wind },
    { label: "Traffic Flow Clear", icon: Footprints },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 shadow-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-display">
                Sukimeh AI Interior Designer
              </h1>
              <p className="text-xs text-navy-200">Shared Proposal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-dark rounded-card overflow-hidden shadow-card mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              {proposal.image_url ? (
                <img
                  src={proposal.image_url}
                  alt="Room layout"
                  className="w-full h-64 md:h-80 object-contain bg-navy-800"
                />
              ) : (
                <div className="w-full h-64 md:h-80 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                  <span className="text-5xl">🏠</span>
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <ScoreCard score={layout.score} />
                <div>
                  <h2 className="text-2xl font-display text-white">
                    AI-Designed Space
                  </h2>
                  <p className="text-navy-200 text-sm mt-1">
                    {layout.rooms.length} rooms •{" "}
                    {layout.furniture_placements.length} items
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
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

        {/* Products */}
        <div className="space-y-3 mb-8">
          <h3 className="font-display text-xl text-navy-500 flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            Included in this Design
          </h3>

          {layout.bundle.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 bg-white rounded-card p-4 border border-navy-100 shadow-sm"
            >
              <div className="w-16 h-16 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-navy-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-navy-500">
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-white rounded-card p-6 border border-navy-100 shadow-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bundle Price</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-bold text-navy-500">
                  RM {layout.bundle.total_discounted.toLocaleString()}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  RM {layout.bundle.total_original.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium mt-1">
                Save RM {savings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-accent hover:bg-accent-500 text-white font-semibold px-8 py-4 rounded-btn transition-colors inline-flex items-center gap-2 shadow-card"
          >
            Get Your Own Design
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-navy-50 mt-8">
        © 2026 Chin Hin Group Berhad. Powered by Microsoft Foundry AI.
      </footer>
    </div>
  );
}
