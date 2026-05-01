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
  "inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25)";

export function QuestionPaletteButton({
  index,
  status,
  isActive,
  onClick,
}: QuestionPaletteButtonProps) {
  const pentagonClip =
    "polygon(20% 0%, 80% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)";

  // Render special pentagon badge for answered / not-answered
  if (status === "answered" || status === "not-answered") {
    const isAnswered = status === "answered";
    const bg = isAnswered
      ? "linear-gradient(to bottom, #a8e063, #56ab2f)"
      : "linear-gradient(to bottom, #ff5f6d, #c0392b)";

    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className={`relative flex items-center justify-center transition-all ${
          isActive ? "scale-110" : ""
        }`}
      >
        <div
          style={{
            width: 40,
            height: 40,
            clipPath: pentagonClip,
            background: bg,
            boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: "13px",
            fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}
        >
          {index + 1}
        </div>
      </button>
    );
  }

  // Default rectangular / circular handling for other statuses
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...statusStyleMap[status],
        boxShadow: jeeButtonShadow,
        borderColor: isActive ? "#000000" : statusStyleMap[status].borderColor,
        borderWidth: isActive ? "2px" : "1px",
        borderRadius: status === "marked-for-review" ? "50%" : "12px",
      }}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-sm font-semibold transition-all before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white before:to-transparent before:opacity-30 hover:scale-110 hover:brightness-110 ${statusClassMap[status]} ${
        isActive ? "scale-110" : ""
      }`}
    >
      {index + 1}
    </button>
  );
}
