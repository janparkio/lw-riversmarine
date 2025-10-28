"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DimensionConverterProps {
  value: number | string;
  currentUnit: "ft" | "m";
}

export function DimensionConverter({
  value,
  currentUnit,
}: DimensionConverterProps) {
  const [displayUnit, setDisplayUnit] = useState<"ft" | "m">(currentUnit);

  // Parse value to number
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue) || !numValue) {
    return <span>—</span>;
  }

  // Conversion factors
  const FT_TO_M = 0.3048;
  const M_TO_FT = 3.28084;

  // Convert value based on display unit
  const displayValue =
    displayUnit === currentUnit
      ? numValue
      : currentUnit === "ft"
      ? numValue * FT_TO_M
      : numValue * M_TO_FT;

  const toggleUnit = () => {
    setDisplayUnit(displayUnit === "ft" ? "m" : "ft");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {displayValue.toFixed(1)} {displayUnit}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleUnit}
        className="h-6 px-2 text-xs"
      >
        ⇄ {displayUnit === "ft" ? "m" : "ft"}
      </Button>
    </div>
  );
}
