import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  initialPrice?: number;
  onPriceChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;          // e.g., "USD/tCO2e" or "₹/tCO2e"
  chinaProxy?: number;    // quick preset value
};

export function CarbonPriceInput({
  initialPrice = 9.5,
  onPriceChange,
  min = 0,
  max = 200, // updated default max to 200
  step = 0.5,
  unit = "USD/tCO2e",
  chinaProxy = 9.5,
}: Props) {
  const [value, setValue] = useState<number>(initialPrice);

  useEffect(() => {
    onPriceChange?.(value);
  }, [value, onPriceChange]);

  const unitLabel = useMemo(() => unit, [unit]);

  return (
    <Card className="border-border">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-lg">Carbon Price Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Set assumed carbon price. All numbers update dynamically.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <span className="text-2xl font-bold tabular-nums">{value.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{unitLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Range: {min}{step < 1 ? "" : ".0"} – {max}{step < 1 ? "" : ".0"} {unitLabel}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValue(chinaProxy)}
              className="px-3 py-1.5 rounded-md border text-xs hover:bg-accent"
              title="Set to China ETS proxy"
            >
              China proxy ({chinaProxy}{step < 1 ? "" : ".0"} {unitLabel})
            </button>
            {/* Removed Reset button */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarbonPriceInput;
