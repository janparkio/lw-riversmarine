import { ACFSelectValue, VesselType } from "@/lib/wordpress.d";

export const vesselTypeLabels: Record<VesselType, string> = {
  towboat: "Towboat/Pushboat",
  tugboat: "Tugboat",
  barge: "Barge",
};

export const classificationSocietyLabels: Record<string, string> = {
  abs: "ABS",
  dnv: "DNV",
  bv: "Bureau Veritas",
  none: "Unclassified",
};

export const pumpLabels: Record<string, string> = {
  single: "Single Pump",
  dual: "Dual Pumps",
};

export const propulsionLabels: Record<string, string> = {
  conventional_open_wheel: "Conventional (Open Wheel)",
  conventional_kort_nozzle: "Conventional (Kort Nozzle)",
  z_drive: "Z-Drive",
  other: "Other",
};

export const vaporRecoveryLabels: Record<string, string> = {
  "common: Individual PV": "Common / Individual PV",
  individual_pv: "Individual PV",
  none: "No",
};

export const heatingLabels: Record<string, string> = {
  steam_coils: "Steam Coils",
  thermal_fuild: "Thermal Fluid",
  none: "No",
};

export const cargoTankMaterialLabels: Record<string, string> = {
  steel: "Steel",
  stainless: "Stainless Steel",
  lined: "Lined",
};

export function getSelectLabel(
  option?: ACFSelectValue | null | string,
  fallbackMap?: Record<string, string>
): string {
  if (!option) {
    return "";
  }

  if (typeof option === "string") {
    return fallbackMap?.[option] ?? option;
  }

  const value = option.value ?? "";
  if (option.label) {
    return option.label;
  }

  if (fallbackMap && value in fallbackMap) {
    return fallbackMap[value];
  }

  return value;
}
