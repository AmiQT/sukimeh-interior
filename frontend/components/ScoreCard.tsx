"use client";

interface ScoreCardProps {
  score: number;
  label?: string;
}

export default function ScoreCard({ score, label = "Match" }: ScoreCardProps) {
  const getColor = () => {
    if (score >= 90) return { bg: "bg-green-500", text: "text-green-500" };
    if (score >= 70) return { bg: "bg-yellow-500", text: "text-yellow-500" };
    return { bg: "bg-red-500", text: "text-red-500" };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colors.text} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-navy-500">{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
}
