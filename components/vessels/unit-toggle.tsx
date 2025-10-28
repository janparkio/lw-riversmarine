"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Unit = "ft" | "m";

interface UnitContextType {
  displayUnit: Unit;
  toggleUnit: () => void;
  convertValue: (value: number | string, originalUnit: Unit) => number;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnit must be used within UnitProvider");
  }
  return context;
}

export function UnitProvider({
  children,
  defaultUnit,
}: {
  children: ReactNode;
  defaultUnit: Unit;
}) {
  const [displayUnit, setDisplayUnit] = useState<Unit>(defaultUnit);

  // Conversion factors
  const FT_TO_M = 0.3048;
  const M_TO_FT = 3.28084;

  const toggleUnit = () => {
    setDisplayUnit(displayUnit === "ft" ? "m" : "ft");
  };

  const convertValue = (value: number | string, originalUnit: Unit): number => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue) || !numValue) {
      return 0;
    }

    if (displayUnit === originalUnit) {
      return numValue;
    }

    return originalUnit === "ft" ? numValue * FT_TO_M : numValue * M_TO_FT;
  };

  return (
    <UnitContext.Provider value={{ displayUnit, toggleUnit, convertValue }}>
      {children}
    </UnitContext.Provider>
  );
}

export function UnitToggle() {
  const { displayUnit, toggleUnit } = useUnit();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleUnit}
      className="font-medium"
    >
      {displayUnit === "ft" ? "ft" : "m"} ⇄
    </Button>
  );
}

export function DimensionValue({
  value,
  originalUnit,
}: {
  value: number | string;
  originalUnit: Unit;
}) {
  const { displayUnit, convertValue } = useUnit();

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue) || !numValue) {
    return <span>—</span>;
  }

  const displayValue = convertValue(numValue, originalUnit);

  return (
    <span>
      {displayValue.toFixed(1)} {displayUnit}
    </span>
  );
}
