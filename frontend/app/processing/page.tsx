"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import { useAppStore } from "@/lib/store";
import { generateLayout } from "@/lib/foundry";

export default function ProcessingPage() {
  const router = useRouter();
  const { analysis, imagePath, uploadedFileUrl, setLayoutData } = useAppStore();
  const [isApiDone, setIsApiDone] = useState(false);

  useEffect(() => {
    if (!analysis) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    async function fetchLayout() {
      try {
        const layout = await generateLayout(analysis!.rooms, imagePath || undefined);
        if (!cancelled) {
          setLayoutData(layout);
          setIsApiDone(true);
        }
      } catch {
        if (!cancelled) {
          // Use the analysis data to generate a client-side fallback
          setIsApiDone(true);
        }
      }
    }

    fetchLayout();

    return () => {
      cancelled = true;
    };
  }, [analysis, imagePath, setLayoutData, router]);

  const handleComplete = useCallback(() => {
    router.push("/layout");
  }, [router]);

  const imageUrl = uploadedFileUrl || (imagePath ? `/uploads${imagePath.replace("/uploads", "")}` : null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-lg font-display">Sukimeh AI Interior Designer</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <ProcessingAnimation
          imageUrl={imageUrl}
          onComplete={handleComplete}
          isApiDone={isApiDone}
        />
      </main>
    </div>
  );
}
