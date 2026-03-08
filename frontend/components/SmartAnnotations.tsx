"use client";

import { SmartOptimization } from "@/lib/store";
import { Wind, Wifi, Footprints, Cpu } from "lucide-react";

interface SmartAnnotationsProps {
  optimizations: SmartOptimization[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  airflow: <Wind className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  traffic: <Footprints className="w-5 h-5" />,
  smart: <Cpu className="w-5 h-5" />,
};

const COLOR_MAP: Record<string, string> = {
  airflow: "from-blue-500 to-cyan-400",
  wifi: "from-green-500 to-emerald-400",
  traffic: "from-purple-500 to-violet-400",
  smart: "from-amber-500 to-orange-400",
};

export default function SmartAnnotations({
  optimizations,
}: SmartAnnotationsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg text-navy-500">
        Smart Optimization
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        AI-detected improvements for your space
      </p>

      <div className="space-y-3">
        {optimizations.map((opt, index) => (
          <div
            key={index}
            className="bg-white rounded-card p-4 border border-navy-100 shadow-sm hover:shadow-card transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                  COLOR_MAP[opt.type] || COLOR_MAP.smart
                } flex items-center justify-center text-white flex-shrink-0`}
              >
                {ICON_MAP[opt.type] || ICON_MAP.smart}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-500">
                  {opt.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {opt.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
