"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, Layout, ShoppingBag, Play } from "lucide-react";
import { toast } from "sonner";
import UploadZone from "@/components/UploadZone";
import { useAppStore } from "@/lib/store";
import { analyzeFloorplan } from "@/lib/foundry";
import { MOCK_LAYOUT, MOCK_ANALYSIS } from "@/lib/mockData";

const STEPS = [
  { icon: Upload, label: "Upload", active: true },
  { icon: Sparkles, label: "AI Processing", active: false },
  { icon: Layout, label: "Layout Generation", active: false },
  { icon: ShoppingBag, label: "Shop the Look", active: false },
];

export default function HomePage() {
  const router = useRouter();
  const { setUploadedFile, setAnalysis, setImagePath, setLayoutData, uploadedFileUrl } =
    useAppStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    uploadedFileUrl
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemo = async () => {
    setIsDemoLoading(true);
    toast.success("Memuatkan demo...", { description: "3 bilik • 12 item perabot • Skor 98%" });
    // Simulate brief loading
    await new Promise((r) => setTimeout(r, 1200));
    setAnalysis(MOCK_ANALYSIS);
    setLayoutData(MOCK_LAYOUT);
    setImagePath(null);
    setIsDemoLoading(false);
    router.push("/layout");
  };

  const handleFileSelected = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setUploadedFile(file, url);
    },
    [setUploadedFile]
  );

  const handleClear = useCallback(() => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadedFile(null, null);
  }, [setUploadedFile]);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload a floor plan first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFloorplan(selectedFile);
      setAnalysis(result.analysis);
      setImagePath(result.image_path);
      router.push("/processing");
    } catch (error) {
      toast.error("Analysis failed. Retrying with fallback...");
      // Use mock data as fallback
      setAnalysis({
        rooms: [
          { type: "kitchen", confidence: 0.95, approximate_size: "medium", features: ["window", "door"] },
          { type: "living_room", confidence: 0.92, approximate_size: "large", features: ["window", "door", "corner"] },
          { type: "bedroom", confidence: 0.89, approximate_size: "medium", features: ["window", "door"] },
        ],
        overall_layout: "open_plan",
        image_quality: "floor_plan",
      });
      setImagePath(null);
      router.push("/processing");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 shadow-card">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display tracking-tight">
                Sukimeh AI Interior Designer
              </h1>
              <p className="text-xs text-navy-200">by Chin Hin Group</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-navy-200">
            <span className="px-2 py-1 bg-navy-600 rounded-md">
              AI Hackathon 2026
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-display text-navy mb-4 leading-tight">
            Transform your empty space
            <br />
            <span className="text-accent">into a dream home</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Upload your floor plan and let AI design the perfect layout with
            smart furniture placement and product recommendations.
          </p>
        </div>

        {/* Upload zone */}
        <div className="w-full mb-8 animate-slide-up">
          <UploadZone
            onFileSelected={handleFileSelected}
            previewUrl={previewUrl}
            onClear={handleClear}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className={`px-8 py-4 rounded-btn font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-card ${
              selectedFile && !isAnalyzing
                ? "bg-accent hover:bg-accent-500 text-white hover:shadow-hover hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze My Space
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:inline">atau</span>
            <button
              onClick={handleDemo}
              disabled={isDemoLoading}
              className="px-6 py-4 rounded-btn font-semibold text-base transition-all duration-300 flex items-center gap-2 border-2 border-navy text-navy hover:bg-navy hover:text-white hover:shadow-card active:scale-[0.98] disabled:opacity-60"
            >
              {isDemoLoading ? (
                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Cuba Demo
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          ✨ Demo: terus ke layout 3 bilik dengan 12 item perabot & skor 98%
        </p>

        {/* Progress stepper */}
        <div className="mt-16 w-full max-w-2xl">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.active
                      ? "bg-accent text-white"
                      : "bg-navy-50 text-navy-300"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    step.active ? "text-accent" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-[-36px] mb-8 px-5">
            {STEPS.slice(0, -1).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-0.5 bg-navy-100 mx-5 mt-[16px]"
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-navy-50">
        © 2026 Chin Hin Group Berhad. Powered by Microsoft Foundry AI.
      </footer>
    </div>
  );
}
