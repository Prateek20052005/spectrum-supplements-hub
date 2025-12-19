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
    slug: "vitamins-minerals",
    name: "Vitamins & Minerals",
    description: "Essential daily nutrients",
    icon: ShieldCheck,
    color: "text-primary",
  },
  {
    slug: "post-workout",
    name: "Post-workout",
    description: "Recovery and muscle repair",
    icon: HeartPulse,
    color: "text-accent",
  },
  {
    slug: "mass-gainers",
    name: "Mass Gainers",
    description: "Build muscle and gain weight",
    icon: Beef,
    color: "text-primary",
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness",
    description: "General health supplements",
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
