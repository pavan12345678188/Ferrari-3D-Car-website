/* =========================================================
   VEHICLE CONFIGURATION TYPES
   ========================================================= */

export type BodyColor =
  | "rosso"
  | "nero"
  | "bianco"
  | "giallo"
  | "argento";

export type WheelFinish =
  | "forged"
  | "dark"
  | "chrome";

export type CaliperColor =
  | "rosso"
  | "giallo"
  | "nero";

export type InteriorColor =
  | "nero"
  | "rosso"
  | "tan";


/* =========================================================
   COMPLETE VEHICLE CONFIGURATION
   ========================================================= */

export type VehicleConfig = {
  bodyColor: BodyColor;
  wheelFinish: WheelFinish;
  caliperColor: CaliperColor;
  interiorColor: InteriorColor;
  carbonPackage: boolean;
};


/* =========================================================
   DEFAULT CONFIGURATION
   ========================================================= */

export const DEFAULT_CONFIG: VehicleConfig = {
  bodyColor: "rosso",
  wheelFinish: "forged",
  caliperColor: "rosso",
  interiorColor: "nero",
  carbonPackage: true,
};


/* =========================================================
   BODY COLORS
   ========================================================= */

export type VehicleColor = {
  name: string;
  hex: string;
};

export const BODY_COLORS: Record<
  BodyColor,
  VehicleColor
> = {
  rosso: {
    name: "Rosso Corsa",
    hex: "#C8102E",
  },

  nero: {
    name: "Nero",
    hex: "#080808",
  },

  bianco: {
    name: "Bianco",
    hex: "#E8E8E8",
  },

  giallo: {
    name: "Giallo",
    hex: "#D8A900",
  },

  argento: {
    name: "Argento",
    hex: "#8D9298",
  },
};


/* =========================================================
   WHEEL FINISHES
   ========================================================= */

export type WheelFinishData = {
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
};

export const WHEEL_FINISHES: Record<
  WheelFinish,
  WheelFinishData
> = {
  forged: {
    name: "Forged Silver",
    hex: "#777B80",
    metalness: 0.95,
    roughness: 0.22,
  },

  dark: {
    name: "Dark Graphite",
    hex: "#17191C",
    metalness: 0.95,
    roughness: 0.3,
  },

  chrome: {
    name: "Chrome",
    hex: "#D5D7DA",
    metalness: 1,
    roughness: 0.08,
  },
};


/* =========================================================
   BRAKE CALIPER COLORS
   ========================================================= */

export const CALIPER_COLORS: Record<
  CaliperColor,
  VehicleColor
> = {
  rosso: {
    name: "Rosso",
    hex: "#D40000",
  },

  giallo: {
    name: "Giallo",
    hex: "#F0B400",
  },

  nero: {
    name: "Nero",
    hex: "#111111",
  },
};


/* =========================================================
   INTERIOR COLORS
   ========================================================= */

export const INTERIOR_COLORS: Record<
  InteriorColor,
  VehicleColor
> = {
  nero: {
    name: "Nero",
    hex: "#080808",
  },

  rosso: {
    name: "Rosso",
    hex: "#4A0909",
  },

  tan: {
    name: "Tan",
    hex: "#765337",
  },
};