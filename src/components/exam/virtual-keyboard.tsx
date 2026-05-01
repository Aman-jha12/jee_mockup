"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "-", "+", "E"];

type Props = {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
};

export function VirtualKeyboard({ onKeyPress, onBackspace, onClear }: Props) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Numerical Keyboard</p>
      <div className="grid grid-cols-5 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="col-span-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-300 hover:bg-amber-200"
        >
          Backspace
        </button>
        <button
          type="button"
          onClick={onClear}
          className="col-span-3 rounded-md bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-900 ring-1 ring-rose-300 hover:bg-rose-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
