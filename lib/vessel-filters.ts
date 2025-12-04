import { Vessel, VesselType } from "@/lib/wordpress.d";
import {
  bargeTypeLabels,
  fuelTypeLabels,
  propulsionLabels,
} from "@/lib/vessel";

export interface RangeBounds {
  min: number;
  max: number;
}

export interface VesselFilterRanges {
  yearBuilt?: RangeBounds;
  horsepower?: RangeBounds;
  price?: RangeBounds;
  length?: RangeBounds;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface VesselFilterMetadata {
  ranges: VesselFilterRanges;
  fuelTypes: FilterOption[];
  bargeTypes: FilterOption[];
  propulsionTypes: FilterOption[];
}

export interface VesselFilterValues {
  minYear?: number;
  maxYear?: number;
  minHp?: number;
  maxHp?: number;
  minPrice?: number;
  maxPrice?: number;
  minLength?: number;
  maxLength?: number;
  propulsion?: string;
  fuelType?: string;
  hasPrice?: boolean;
  vesselType?: VesselType;
  bargeType?: string;
  wpCategoryId?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const unique = <T>(values: T[]): T[] => [...new Set(values)];

function computeRange(values: Array<number | null | undefined>): RangeBounds | undefined {
  const filtered = values.filter(
    (value): value is number => typeof value === "number" && !Number.isNaN(value)
  );
  if (!filtered.length) {
    return undefined;
  }
  return {
    min: Math.min(...filtered),
    max: Math.max(...filtered),
  };
}

export function buildVesselFilterMetadata(
  vessels: Vessel[]
): VesselFilterMetadata {
  const yearBuiltValues = vessels.map(
    (vessel) => vessel.acf?.specs?.core_specs?.year_built
  );
  const horsepowerValues = vessels.map((vessel) => {
    const power = vessel.acf?.specs?.propulsion_power_specs;
    return (
      power?.total_horse_power ??
      power?.horse_power ??
      null
    );
  });
  const priceValues = vessels.map((vessel) =>
    vessel.acf?.has_asking_price ? vessel.acf.asking_price ?? null : null
  );
  const lengthValues = vessels.map(
    (vessel) => vessel.acf?.specs?.core_specs?.dimensions?.length
  );

  const fuelOptions = unique(
    vessels
      .map((vessel) => vessel.acf?.specs?.fuel?.type)
      .filter((value): value is string => Boolean(value))
  ).map((value) => ({
    value,
    label: fuelTypeLabels[value] ?? value,
  }));

  const bargeOptions = unique(
    vessels
      .map((v) => {
        const bargeType = v.acf?.barge_type;
        if (!bargeType) return undefined;
        if (typeof bargeType === "string") return bargeType;
        return bargeType.value ?? undefined;
      })
      .filter((value): value is string => Boolean(value))
  ).map((value) => ({
    value,
    label: bargeTypeLabels[value] ?? value,
  }));

  const propulsionOptions = unique(
    vessels
      .map((v) => {
        const propulsion = v.acf?.specs?.propulsion_power_specs?.propulsion;
        if (!propulsion) return undefined;
        if (typeof propulsion === "string") return propulsion;
        return propulsion.value ?? undefined;
      })
      .filter((value): value is string => Boolean(value))
  ).map((value) => ({
    value,
    label: propulsionLabels[value] ?? value,
  }));

  return {
    ranges: {
      yearBuilt: computeRange(yearBuiltValues),
      horsepower: computeRange(horsepowerValues),
      price: computeRange(priceValues),
      length: computeRange(lengthValues),
    },
    fuelTypes: fuelOptions,
    bargeTypes: bargeOptions,
    propulsionTypes: propulsionOptions,
  };
}

export function matchesVesselFilters(
  vessel: Vessel,
  filters: VesselFilterValues
): boolean {
  const specs = vessel.acf?.specs ?? {};
  const core = specs.core_specs ?? {};
  const dimensions = core.dimensions ?? {};
  const propulsionPower = specs.propulsion_power_specs ?? {};
  const fuel = specs.fuel ?? {};

  const yearBuilt = core.year_built ?? undefined;
  const totalHorsePower =
    propulsionPower.total_horse_power ??
    propulsionPower.horse_power ??
    undefined;
  const askingPrice =
    vessel.acf?.has_asking_price && vessel.acf.asking_price
      ? vessel.acf.asking_price
      : undefined;
  const length = dimensions.length ?? undefined;
  const propulsionValue = propulsionPower.propulsion
    ? typeof propulsionPower.propulsion === "string"
      ? propulsionPower.propulsion
      : propulsionPower.propulsion.value
    : undefined;
  const fuelTypeValue = fuel.type ?? undefined;
  const bargeTypeValue = vessel.acf?.barge_type
    ? typeof vessel.acf.barge_type === "string"
      ? vessel.acf.barge_type
      : vessel.acf.barge_type.value
    : undefined;

  if (
    filters.vesselType &&
    (vessel.acf?.vessel_type ?? null) !== filters.vesselType
  ) {
    return false;
  }

  if (
    filters.bargeType &&
    vessel.acf?.vessel_type === "barge" &&
    bargeTypeValue !== filters.bargeType
  ) {
    return false;
  }

  if (
    typeof filters.minYear === "number" &&
    (typeof yearBuilt !== "number" || yearBuilt < filters.minYear)
  ) {
    return false;
  }

  if (
    typeof filters.maxYear === "number" &&
    (typeof yearBuilt !== "number" || yearBuilt > filters.maxYear)
  ) {
    return false;
  }

  if (
    typeof filters.minHp === "number" &&
    (typeof totalHorsePower !== "number" ||
      totalHorsePower < filters.minHp)
  ) {
    return false;
  }

  if (
    typeof filters.maxHp === "number" &&
    (typeof totalHorsePower !== "number" ||
      totalHorsePower > filters.maxHp)
  ) {
    return false;
  }

  if (
    typeof filters.minPrice === "number" &&
    (typeof askingPrice !== "number" || askingPrice < filters.minPrice)
  ) {
    return false;
  }

  if (
    typeof filters.maxPrice === "number" &&
    (typeof askingPrice !== "number" || askingPrice > filters.maxPrice)
  ) {
    return false;
  }

  if (filters.hasPrice && typeof askingPrice !== "number") {
    return false;
  }

  if (
    typeof filters.minLength === "number" &&
    (typeof length !== "number" || length < filters.minLength)
  ) {
    return false;
  }

  if (
    typeof filters.maxLength === "number" &&
    (typeof length !== "number" || length > filters.maxLength)
  ) {
    return false;
  }

  if (
    filters.propulsion &&
    (!propulsionValue || propulsionValue !== filters.propulsion)
  ) {
    return false;
  }

  if (
    filters.fuelType &&
    (!fuelTypeValue || fuelTypeValue !== filters.fuelType)
  ) {
    return false;
  }

  if (
    filters.wpCategoryId &&
    !vessel.categories?.includes(filters.wpCategoryId)
  ) {
    return false;
  }

  return true;
}

export function clampRangeToBounds(
  value: [number, number],
  bounds?: RangeBounds
): [number, number] {
  if (!bounds) {
    return value;
  }
  return [
    clamp(value[0], bounds.min, bounds.max),
    clamp(value[1], bounds.min, bounds.max),
  ];
}
