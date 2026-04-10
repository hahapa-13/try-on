"use client";

type Props = {
  opacity: number;
  onOpacityChange: (value: number) => void;
  scale: number;
  onScaleChange: (value: number) => void;
};

export function TryOnControls({
  opacity,
  onOpacityChange,
  scale,
  onScaleChange,
}: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Clothing opacity
          </div>
          <div className="text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-300">
            {Math.round(opacity * 100)}%
          </div>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={1}
          value={Math.round(opacity * 100)}
          onChange={(e) => onOpacityChange(Number(e.currentTarget.value) / 100)}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-800"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Clothing size
          </div>
          <div className="text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-300">
            {Math.round(scale * 100)}%
          </div>
        </div>
        <input
          type="range"
          min={60}
          max={140}
          step={1}
          value={Math.round(scale * 100)}
          onChange={(e) => onScaleChange(Number(e.currentTarget.value) / 100)}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-800"
        />
      </div>

      <div className="text-xs text-zinc-600 dark:text-zinc-300">
        This is a simulated overlay for the MVP (no real AI segmentation yet).
      </div>
    </div>
  );
}

