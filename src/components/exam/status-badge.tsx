type Props = {
  label: string;
  color: string;
};

export function StatusBadge({ label, color }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-700">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}
