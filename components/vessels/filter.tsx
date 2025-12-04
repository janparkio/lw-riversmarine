"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RangeBounds,
  VesselFilterRanges,
} from "@/lib/vessel-filters";
import { vesselTypeLabels } from "@/lib/vessel";
import type { VesselType } from "@/lib/wordpress.d";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface RangeSliderProps {
  id: string;
  label: string;
  bounds?: RangeBounds;
  value?: [number, number];
  onValueChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  emptyLabel: string;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getStep = (bounds?: RangeBounds) => {
  if (!bounds) return 1;
  const span = bounds.max - bounds.min;
  if (span <= 50) return 1;
  if (span <= 500) return 5;
  if (span <= 5_000) return 25;
  if (span <= 25_000) return 100;
  return Math.max(1, Math.round(span / 100));
};

function RangeSlider({
  id,
  label,
  bounds,
  value,
  onValueChange,
  formatValue,
  emptyLabel,
}: RangeSliderProps) {
  if (!bounds || typeof bounds.min !== "number" || typeof bounds.max !== "number") {
    return (
      <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  const resolvedValue =
    value ?? ([bounds.min, bounds.max] as [number, number]);
  const [minValue, maxValue] = resolvedValue;
  const step = getStep(bounds);
  const span = bounds.max - bounds.min || 1;
  const startPercent = ((minValue - bounds.min) / span) * 100;
  const endPercent = ((maxValue - bounds.min) / span) * 100;

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(Number(event.target.value), maxValue);
    onValueChange([newValue, maxValue]);
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(Number(event.target.value), minValue);
    onValueChange([minValue, newValue]);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-min`} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <div className="space-y-3">
        <div className="relative h-6 select-none">
          <div className="pointer-events-none absolute inset-y-2 rounded-full bg-muted" />
          <div
            className="pointer-events-none absolute inset-y-2 rounded-full bg-primary"
            style={{
              left: `${startPercent}%`,
              right: `${100 - endPercent}%`,
            }}
          />
          <input
            id={`${id}-min`}
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            className="range-thumb pointer-events-auto absolute top-2 h-2 w-full appearance-none bg-transparent z-30"
          />
          <input
            id={`${id}-max`}
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            className="range-thumb pointer-events-auto absolute top-2 h-2 w-full appearance-none bg-transparent z-20"
          />
        </div>
        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>
            Min:{" "}
            {formatValue ? formatValue(minValue) : formatNumber(minValue)}
          </span>
          <span>
            Max:{" "}
            {formatValue ? formatValue(maxValue) : formatNumber(maxValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface FilterLabels {
  apply: string;
  reset: string;
  advancedHeading: string;
  yearBuilt: string;
  horsepower: string;
  price: string;
  length: string;
  hasPrice: string;
  propulsion: string;
  propulsionPlaceholder: string;
  fuelType: string;
  fuelPlaceholder: string;
  vesselType: string;
  vesselTypeAll: string;
  bargeType: string;
  bargeTypePlaceholder: string;
  rangeUnavailable: string;
}

interface FilterVesselsProps {
  bounds: VesselFilterRanges;
  initialFilters: {
    vesselType?: VesselType;
    bargeType?: string;
    propulsion?: string;
    fuelType?: string;
    hasPrice: boolean;
    yearRange?: [number, number];
    horsepowerRange?: [number, number];
    priceRange?: [number, number];
    lengthRange?: [number, number];
  };
  fuelOptions: FilterOption[];
  bargeOptions: FilterOption[];
  propulsionOptions: FilterOption[];
  labels: FilterLabels;
}

export function FilterVessels({
  bounds,
  initialFilters,
  fuelOptions,
  bargeOptions,
  propulsionOptions,
  labels,
}: FilterVesselsProps) {
  const ANY_PROPULSION = "__propulsion-any";
  const ANY_FUEL = "__fuel-any";
  const ANY_BARGE = "__barge-any";
  const router = useRouter();
  const pathname = usePathname();
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [vesselType, setVesselType] = useState<VesselType | "all">(
    initialFilters.vesselType ?? "all"
  );
  const [bargeType, setBargeType] = useState(
    initialFilters.bargeType ?? ANY_BARGE
  );
  const [propulsion, setPropulsion] = useState(
    initialFilters.propulsion ?? ANY_PROPULSION
  );
  const [fuelType, setFuelType] = useState(
    initialFilters.fuelType ?? ANY_FUEL
  );
  const [hasPrice, setHasPrice] = useState(Boolean(initialFilters.hasPrice));
  const [yearRange, setYearRange] = useState<[number, number] | undefined>(
    initialFilters.yearRange
  );
  const [hpRange, setHpRange] = useState<[number, number] | undefined>(
    initialFilters.horsepowerRange
  );
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(
    initialFilters.priceRange
  );
  const [lengthRange, setLengthRange] = useState<[number, number] | undefined>(
    initialFilters.lengthRange
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersExpanded = window.matchMedia("(min-width: 768px)").matches;
      setAdvancedOpen(prefersExpanded);
    }
  }, []);

  useEffect(() => {
    setVesselType(initialFilters.vesselType ?? "all");
    setBargeType(initialFilters.bargeType ?? ANY_BARGE);
    setPropulsion(initialFilters.propulsion ?? ANY_PROPULSION);
    setFuelType(initialFilters.fuelType ?? ANY_FUEL);
    setHasPrice(Boolean(initialFilters.hasPrice));
    setYearRange(initialFilters.yearRange);
    setHpRange(initialFilters.horsepowerRange);
    setPriceRange(initialFilters.priceRange);
    setLengthRange(initialFilters.lengthRange);
  }, [initialFilters]);

  const vesselTypeOptions = useMemo(
    () =>
      Object.entries(vesselTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    []
  );

  const applyRangeParam = (
    params: URLSearchParams,
    minKey: string,
    maxKey: string,
    value: [number, number] | undefined,
    rangeBounds?: RangeBounds
  ) => {
    if (!value || !rangeBounds) {
      params.delete(minKey);
      params.delete(maxKey);
      return;
    }

    const [minVal, maxVal] = value;
    if (minVal > rangeBounds.min) {
      params.set(minKey, minVal.toString());
    } else {
      params.delete(minKey);
    }

    if (maxVal < rangeBounds.max) {
      params.set(maxKey, maxVal.toString());
    } else {
      params.delete(maxKey);
    }
  };

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.delete("page");

    if (vesselType !== "all") {
      params.set("vesselType", vesselType);
    } else {
      params.delete("vesselType");
    }

    if (vesselType === "barge" && bargeType !== ANY_BARGE) {
      params.set("bargeType", bargeType);
    } else {
      params.delete("bargeType");
    }

    if (propulsion !== ANY_PROPULSION) {
      params.set("propulsion", propulsion);
    } else {
      params.delete("propulsion");
    }

    if (fuelType !== ANY_FUEL) {
      params.set("fuelType", fuelType);
    } else {
      params.delete("fuelType");
    }

    if (hasPrice) {
      params.set("hasPrice", "true");
    } else {
      params.delete("hasPrice");
    }

    applyRangeParam(params, "yearMin", "yearMax", yearRange, bounds.yearBuilt);
    applyRangeParam(params, "hpMin", "hpMax", hpRange, bounds.horsepower);
    applyRangeParam(params, "priceMin", "priceMax", priceRange, bounds.price);
    applyRangeParam(
      params,
      "lengthMin",
      "lengthMax",
      lengthRange,
      bounds.length
    );

    router.push(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  const handleResetFilters = () => {
    setVesselType("all");
    setBargeType(ANY_BARGE);
    setPropulsion(ANY_PROPULSION);
    setFuelType(ANY_FUEL);
    setHasPrice(false);
    setYearRange(bounds.yearBuilt ? [bounds.yearBuilt.min, bounds.yearBuilt.max] : undefined);
    setHpRange(
      bounds.horsepower
        ? [bounds.horsepower.min, bounds.horsepower.max]
        : undefined
    );
    setPriceRange(
      bounds.price ? [bounds.price.min, bounds.price.max] : undefined
    );
    setLengthRange(
      bounds.length ? [bounds.length.min, bounds.length.max] : undefined
    );
    router.push(pathname);
  };

  const showBargeSelect = vesselType === "barge" && bargeOptions.length > 0;

  return (
    <form
      onSubmit={handleApplyFilters}
      className="space-y-4 my-4 rounded-lg border p-4 bg-card"
    >
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <Select
          value={vesselType}
          onValueChange={(value) =>
            setVesselType(value === "all" ? "all" : (value as VesselType))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={labels.vesselType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.vesselTypeAll}</SelectItem>
            {vesselTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">{labels.apply}</Button>
        <Button type="button" variant="outline" onClick={handleResetFilters}>
          {labels.reset}
        </Button>
      </div>

      {showBargeSelect && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {labels.bargeType}
          </Label>
          <Select
            value={bargeType}
            onValueChange={(value) => setBargeType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={labels.bargeTypePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_BARGE}>
                {labels.bargeTypePlaceholder}
              </SelectItem>
              {bargeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-lg border bg-muted/20">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground"
        >
          <span>{labels.advancedHeading}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              advancedOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        {advancedOpen && (
          <div className="space-y-4 border-t px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <RangeSlider
                id="yearRange"
                label={labels.yearBuilt}
                bounds={bounds.yearBuilt}
                value={yearRange}
                onValueChange={setYearRange}
                emptyLabel={labels.rangeUnavailable}
              />
              <RangeSlider
                id="hpRange"
                label={labels.horsepower}
                bounds={bounds.horsepower}
                value={hpRange}
                onValueChange={setHpRange}
                emptyLabel={labels.rangeUnavailable}
              />
              <RangeSlider
                id="priceRange"
                label={labels.price}
                bounds={bounds.price}
                value={priceRange}
                onValueChange={setPriceRange}
                emptyLabel={labels.rangeUnavailable}
                formatValue={formatCurrency}
              />
              <RangeSlider
                id="lengthRange"
                label={labels.length}
                bounds={bounds.length}
                value={lengthRange}
                onValueChange={setLengthRange}
                emptyLabel={labels.rangeUnavailable}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {labels.propulsion}
                </Label>
                <Select
                  value={propulsion}
                  onValueChange={(value) => setPropulsion(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={labels.propulsionPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_PROPULSION}>
                      {labels.propulsionPlaceholder}
                    </SelectItem>
                    {propulsionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {labels.fuelType}
                </Label>
                <Select
                  value={fuelType}
                  onValueChange={(value) => setFuelType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={labels.fuelPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_FUEL}>
                      {labels.fuelPlaceholder}
                    </SelectItem>
                    {fuelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={hasPrice}
                onChange={(event) => setHasPrice(event.target.checked)}
                className="h-4 w-4 rounded border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              />
              {labels.hasPrice}
            </label>
          </div>
        )}
      </div>
    </form>
  );
}
