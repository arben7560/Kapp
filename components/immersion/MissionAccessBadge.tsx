import React from "react";

import { StatusBadge } from "../ui/status-badge";
import { SeoulMidnightGlass } from "../../constants/theme";
import type { MissionAccess } from "../../lib/immersion/missions";

type MissionAccessBadgeProps = {
  access: MissionAccess;
  accent: string;
  featured?: boolean;
  variant?: "access" | "vocal";
};

export function MissionAccessBadge({
  access,
  accent,
  featured = false,
  variant = "access",
}: MissionAccessBadgeProps) {
  const isPremium = access === "premium";
  const isVocal = variant === "vocal";
  const borderColor = isVocal
    ? `${accent}66`
    : isPremium
    ? SeoulMidnightGlass.colors.premiumBorder
    : featured
      ? `${accent}66`
      : `${accent}55`;
  const backgroundColor = isVocal
    ? `${accent}1A`
    : isPremium
    ? SeoulMidnightGlass.colors.premiumSurface
    : featured
      ? `${accent}1A`
      : "rgba(255,255,255,0.07)";

  return (
    <StatusBadge
      label={isVocal ? "VOCAL" : isPremium ? "PREMIUM" : "GRATUIT"}
      tone={isVocal ? "accent" : isPremium ? "premium" : "accent"}
      appearance="soft"
      size="compact"
      accentColor={accent}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
    />
  );
}
