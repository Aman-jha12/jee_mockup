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
    background: "linear-gradient(to bottom, #158f2a, #158f2a)",
    borderColor: "#158f2a",
  },
  "not-answered": {
    background: "linear-gradient(to bottom, #8f1515, #8f1515)",
    borderColor: "#8f1515",
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

export function QuestionPaletteButton({
  index,
  status,
  isActive,
  onClick,
}: QuestionPaletteButtonProps) {
  const pentagonClip =
    "polygon(20% 0%, 80% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)";

  const renderPentagonBadge = (background: string, rotateBadge: boolean) => (
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
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "13px",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          transform: rotateBadge ? "rotate(180deg)" : undefined,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: rotateBadge ? "rotate(180deg)" : undefined,
          }}
        >
          {index + 1}
        </span>
      </div>
    </button>
  );

  if (status === "answered") {
    return renderPentagonBadge("linear-gradient(to bottom, #3cb650, #3cb650)", true);
  }

  if (status === "not-answered") {
    return renderPentagonBadge("linear-gradient(to bottom, #c52020, #c52020)", false);
  }

  // Default rectangular / circular handling for other statuses
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...statusStyleMap[status],
        borderColor: isActive ? "#000000" : statusStyleMap[status].borderColor,
        borderWidth: isActive ? "2px" : "1px",
        borderRadius: status === "marked-for-review" ? "50%" : "12px",
      }}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-sm font-semibold transition-all hover:scale-110 hover:brightness-110 ${statusClassMap[status]} ${
        isActive ? "scale-110" : ""
      }`}
    >
      {index + 1}
    </button>
  );
}
