"use client";

import { QuestionStatus } from "@/types/exam";

type QuestionPaletteButtonProps = {
  index: number;
  status: QuestionStatus;
  isActive: boolean;
  onClick: () => void;
};

const statusClassMap = {
  answered: "text-white border",
  "not-answered": "text-white border",
  "not-visited": "text-black border",
  "marked-for-review": "text-white border",
} as const;

const statusStyleMap = {
  answered: {
    background: "linear-gradient(#6fdc6f, #2ca02c)",
    borderColor: "#2c7a2c",
  },
  "not-answered": {
    background: "linear-gradient(#ff6b6b, #d32f2f)",
    borderColor: "#8b1e1e",
  },
  "not-visited": {
    background: "#e0e0e0",
    borderColor: "#bdbdbd",
  },
  "marked-for-review": {
    background: "linear-gradient(#b388ff, #6a1b9a)",
    borderColor: "#5b1686",
  },
} as const;

const jeeButtonShadow =
  "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.2)";

export function QuestionPaletteButton({
  index,
  status,
  isActive,
  onClick,
}: QuestionPaletteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...statusStyleMap[status],
        boxShadow: jeeButtonShadow,
        borderColor: isActive ? "#000000" : statusStyleMap[status].borderColor,
        borderWidth: isActive ? "2px" : "1px",
        borderRadius: status === "marked-for-review" ? "9999px" : "6px",
      }}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-sm font-semibold transition-all before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white before:to-transparent before:opacity-20 hover:scale-105 hover:brightness-105 ${statusClassMap[status]} ${
        isActive ? "scale-105" : ""
      }`}
    >
      {index + 1}
    </button>
  );
}
