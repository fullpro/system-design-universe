"use client";

import { icons, type LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name: string;
}

/**
 * Resolve a lucide icon by its PascalCase name at runtime, so concepts can
 * declare their icon as a plain string in data. Falls back to a neutral dot.
 */
export function Icon({ name, ...props }: IconProps) {
  const Cmp = icons[name as keyof typeof icons] ?? icons.Circle;
  return <Cmp {...props} />;
}
