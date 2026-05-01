"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  value: string;
  onValueChange: (value: string, cursorPos: number) => void;
  disabled?: boolean;
};

const DIGIT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const OPERATOR_KEYS = [".", "E"];

const NUMPAD_LAYOUT = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["0", "."],
];

/**
 * Validates if a character can be inserted at a given position
 * Rules:
 * - Only one decimal point allowed
 * - Only one 'E' allowed
 * - 'E' cannot be first character
 * - '-' allowed only at beginning or immediately after 'E'
 * - '+' allowed after 'E' only
 * - Prevent invalid sequences: .., EE, --, E., .E
 */
function canInsertCharacter(
  value: string,
  cursorPos: number,
  char: string
): boolean {
  if (DIGIT_KEYS.includes(char)) {
    return true;
  }

  if (char === ".") {
    // Check if decimal point already exists before E
    const eIndex = value.indexOf("E");
    const beforeE = eIndex === -1 ? value : value.substring(0, eIndex);
    if (beforeE.includes(".")) return false;
    // Prevent .. sequence
    if (cursorPos > 0 && value[cursorPos - 1] === ".") return false;
    // Prevent E. sequence
    if (cursorPos > 0 && value[cursorPos - 1] === "E") return false;
    return true;
  }

  if (char === "-") {
    // '-' allowed at beginning only
    if (cursorPos === 0) return true;
    // '-' allowed immediately after 'E'
    if (cursorPos > 0 && value[cursorPos - 1] === "E") {
      // Check if there's already a sign after E
      const afterE = value.substring(cursorPos);
      return !afterE.startsWith("-") && !afterE.startsWith("+");
    }
    return false;
  }

  if (char === "+") {
    // '+' allowed immediately after 'E' only
    if (cursorPos > 0 && value[cursorPos - 1] === "E") {
      const afterE = value.substring(cursorPos);
      return !afterE.startsWith("-") && !afterE.startsWith("+");
    }
    return false;
  }

  if (char === "E") {
    // 'E' cannot be first character
    if (cursorPos === 0) return false;
    // Only one 'E' allowed
    if (value.includes("E")) return false;
    // Cannot have .E sequence
    if (cursorPos > 0 && value[cursorPos - 1] === ".") return false;
    return true;
  }

  return false;
}

export function VirtualKeyboard({
  value,
  onValueChange,
  disabled = false,
}: Props) {
  const [cursorPos, setCursorPos] = useState(value.length);
  const inputRef = useRef<HTMLInputElement>(null);

  // Block physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow only Ctrl/Cmd+A, Ctrl/Cmd+C for select/copy
      const isSelectOrCopy =
        (e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "c");
      if (!isSelectOrCopy) {
        e.preventDefault();
      }
    };

    const input = inputRef.current;
    if (input && disabled) {
      input.addEventListener("keydown", handleKeyDown);
      return () => input.removeEventListener("keydown", handleKeyDown);
    }
  }, [disabled]);

  const handleKeyPress = (char: string) => {
    if (disabled || !canInsertCharacter(value, cursorPos, char)) return;

    const newValue =
      value.substring(0, cursorPos) + char + value.substring(cursorPos);
    const newCursorPos = cursorPos + 1;

    onValueChange(newValue, newCursorPos);
    setCursorPos(newCursorPos);
  };

  const handleBackspace = () => {
    if (disabled || cursorPos === 0) return;

    const newValue =
      value.substring(0, cursorPos - 1) + value.substring(cursorPos);
    const newCursorPos = cursorPos - 1;

    onValueChange(newValue, newCursorPos);
    setCursorPos(newCursorPos);
  };

  const handleCursorLeft = () => {
    const newCursorPos = Math.max(0, cursorPos - 1);
    setCursorPos(newCursorPos);
  };

  const handleCursorRight = () => {
    const newCursorPos = Math.min(value.length, cursorPos + 1);
    setCursorPos(newCursorPos);
  };

  const handleToggleSign = () => {
    if (disabled || value.length === 0) return;

    let newValue = value;
    let newCursorPos = cursorPos;

    // Check if cursor is after 'E' (for exponent sign)
    const eIndex = value.indexOf("E");
    if (eIndex !== -1 && cursorPos > eIndex) {
      // Toggle sign in exponent
      const beforeExponent = value.substring(0, eIndex + 1);
      const afterE = value.substring(eIndex + 1);

      if (afterE.startsWith("-")) {
        newValue = beforeExponent + "+" + afterE.substring(1);
        newCursorPos = cursorPos; // Keep same position
      } else if (afterE.startsWith("+")) {
        newValue = beforeExponent + "-" + afterE.substring(1);
        newCursorPos = cursorPos; // Keep same position
      } else {
        newValue = beforeExponent + "-" + afterE;
        newCursorPos = cursorPos + 1;
      }
    } else {
      // Toggle sign at beginning
      if (value.startsWith("-")) {
        newValue = value.substring(1);
        newCursorPos = Math.max(0, cursorPos - 1);
      } else {
        newValue = "-" + value;
        newCursorPos = cursorPos + 1;
      }
    }

    onValueChange(newValue, newCursorPos);
    setCursorPos(newCursorPos);
  };

  const handleClear = () => {
    if (disabled) return;
    onValueChange("", 0);
    setCursorPos(0);
  };

  // Display cursor in input (visual feedback)
  const displayValue =
    value.substring(0, cursorPos) +
    "|" +
    value.substring(cursorPos);

  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Numerical Input</p>

      {/* Display Input with Cursor */}
      <div className="mb-3 rounded-md border border-slate-300 bg-white p-3">
        <input
          ref={inputRef}
          type="text"
          value={displayValue || "|"}
          onChange={() => {}} // Controlled by keyboard only
          onFocus={(e) => e.target.blur()} // Blur immediately to prevent editing
          readOnly
          className="w-full font-mono text-sm text-slate-800"
        />
      </div>

      {/* Numpad Layout */}
      <div className="mb-3 space-y-2">
        {NUMPAD_LAYOUT.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                disabled={disabled}
                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-50"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Operator Keys */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          {OPERATOR_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              disabled={disabled || !canInsertCharacter(value, cursorPos, key)}
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-200 disabled:opacity-50"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation & Control Keys */}
      <div className="mb-3">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleCursorLeft}
            disabled={disabled || cursorPos === 0}
            className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-300 disabled:opacity-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleCursorRight}
            disabled={disabled || cursorPos === value.length}
            className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-300 disabled:opacity-50"
          >
            →
          </button>
          <button
            type="button"
            onClick={handleToggleSign}
            disabled={disabled || value.length === 0}
            className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-300 disabled:opacity-50"
          >
            ±
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={disabled || cursorPos === 0}
            className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-300 disabled:opacity-50"
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={handleClear}
        disabled={disabled || value.length === 0}
        className="w-full rounded-md bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-300 disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  );
}
