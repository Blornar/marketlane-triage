import { BrandName } from "./types";

export interface BrandColour {
  primary: string;
  bg: string;
  text: string;
  label: string;
}

export const BRAND_COLOURS: Record<BrandName, BrandColour> = {
  "The Barn": {
    primary: "#92400E",
    bg: "rgba(146, 64, 14, 0.06)",
    text: "#92400E",
    label: "Agribusiness & Food",
  },
  "G.O.A.T.": {
    primary: "#6B21A8",
    bg: "rgba(107, 33, 168, 0.06)",
    text: "#6B21A8",
    label: "Sports & Hospitality",
  },
  "Kokomo": {
    primary: "#0F766E",
    bg: "rgba(15, 118, 110, 0.06)",
    text: "#0F766E",
    label: "Tourism & Holiday",
  },
  "Square Mile": {
    primary: "#3730A3",
    bg: "rgba(55, 48, 163, 0.06)",
    text: "#3730A3",
    label: "Corporate Property",
  },
  "Fairlight": {
    primary: "#1D4ED8",
    bg: "rgba(29, 78, 216, 0.06)",
    text: "#1D4ED8",
    label: "Medical & Aged Care",
  },
  "Back Bay": {
    primary: "#475569",
    bg: "rgba(71, 85, 105, 0.06)",
    text: "#475569",
    label: "Professional Indemnity",
  },
  "ML Specialty": {
    primary: "#7E22CE",
    bg: "rgba(126, 34, 206, 0.06)",
    text: "#7E22CE",
    label: "Niche & Legal Expenses",
  },
  "MLX Risk Partners": {
    primary: "#991B1B",
    bg: "rgba(153, 27, 27, 0.06)",
    text: "#991B1B",
    label: "Wholesale Placement",
  },
};
