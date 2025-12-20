import { Dumbbell, Zap, ShieldCheck, HeartPulse, Beef, Pill } from "lucide-react";

export type CategoryDef = {
  slug: string;
  name: string;
  description: string;
  icon: typeof Dumbbell;
  color: string;
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "whey-proteins",
    name: "Whey Proteins",
    description: "High-quality protein supplements",
    icon: Dumbbell,
    color: "text-primary",
  },
  {
    slug: "pre-workout",
    name: "Pre-workout",
    description: "Energy and performance boosters",
    icon: Zap,
    color: "text-accent",
  },
  {
    slug: "amino-acids",
    name: "Amino Acids",
    description: "Building blocks of protein for muscle growth",
    icon: ShieldCheck,
    color: "text-primary",
  },
  {
    slug: "creatine",
    name: "Creatine",
    description: "Strength and performance enhancement supplement",
    icon: Dumbbell,
    color: "text-accent",
  },
  {
    slug: "glutamine",
    name: "Glutamine",
    description: "Muscle recovery and immune system support",
    icon: HeartPulse,
    color: "text-primary",
  },
  {
    slug: "mass-gainers",
    name: "Mass Gainers",
    description: "Build muscle and gain weight",
    icon: Beef,
    color: "text-primary",
  },
  {
    slug: "test-booster",
    name: "Test Booster",
    description: "Natural testosterone support supplements",
    icon: Beef,
    color: "text-accent",
  },
  {
    slug: "omega-3",
    name: "Omega 3",
    description: "Essential fatty acids for heart and brain health",
    icon: HeartPulse,
    color: "text-primary",
  },
  {
    slug: "multivitamins",
    name: "Multivitamins",
    description: "Comprehensive daily nutritional support",
    icon: Pill,
    color: "text-accent",
  },
];

export const categoryNameToSlug = (name?: string) => {
  const found = CATEGORIES.find((c) => c.name.toLowerCase() === (name || "").toLowerCase());
  return found?.slug;
};

export const slugToCategory = (slug?: string) => {
  const s = (slug || "").toLowerCase();
  return CATEGORIES.find((c) => c.slug === s) || null;
};
