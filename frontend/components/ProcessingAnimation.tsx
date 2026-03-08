"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface Step {
  label: string;
  done: boolean;
  active: boolean;
}

interface ProcessingAnimationProps {
  imageUrl: string | null;
  onComplete: () => void;
  isApiDone: boolean;
}

const STEPS = [
  "Floor plan received",
  "Detecting room boundaries...",
  "Identifying kitchen, living, bedroom zones...",
  "Calculating smart placement rules...",
  "Generating product recommendations...",
];

export default function ProcessingAnimation({
  imageUrl,
  onComplete,
  isApiDone,
}: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(
    STEPS.map((label, i) => ({
      label,
      done: false,
      active: i === 0,
    }))
  );

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    STEPS.forEach((_, index) => {
      const timer = setTimeout(
        () => {
          setCurrentStep(index);
          setSteps((prev) =>
            prev.map((step, i) => ({
              ...step,
              done: i < index,
              active: i === index,
            }))
          );
        },
        index * 1500
      );
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1 && isApiDone) {
      setSteps((prev) => prev.map((s) => ({ ...s, done: true, active: false })));
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isApiDone, onComplete]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center w-full max-w-4xl mx-auto">
      {/* Image preview */}
      <div className="w-full lg:w-1/2">
        <div className="rounded-card overflow-hidden shadow-card bg-white border border-navy-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded floor plan"
              className="w-full h-64 lg:h-80 object-contain bg-gray-50"
            />
          ) : (
            <div className="w-full h-64 lg:h-80 bg-navy-50 flex items-center justify-center">
              <div className="text-navy-300 text-lg">Analyzing image...</div>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="w-full lg:w-1/2 space-y-4">
        <h2 className="text-2xl font-display text-navy mb-6">
          AI Analysis in Progress
        </h2>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-btn transition-all duration-500 ${
              step.done
                ? "bg-green-50 text-green-700"
                : step.active
                ? "bg-accent-50 text-navy-500"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {step.done ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : step.active ? (
              <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
