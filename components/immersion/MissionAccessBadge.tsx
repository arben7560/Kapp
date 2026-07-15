import React from "react";

import { StatusBadge } from "../ui/status-badge";
import { SeoulMidnightGlass } from "../../constants/theme";
import type { MissionAccess } from "../../lib/immersion/missions";

type MissionAccessBadgeProps = {
  access: MissionAccess;
  accent: string;
  featured?: boolean;
};

export function MissionAccessBadge({
  access,
  accent,
  featured = false,
}: MissionAccessBadgeProps) {
  const isPremium = access === "premium";
  const borderColor = isPremium
    ? SeoulMidnightGlass.colors.premiumBorder
    : featured
      ? `${accent}66`
      : `${accent}55`;
  const backgroundColor = isPremium
    ? SeoulMidnightGlass.colors.premiumSurface
    : featured
      ? `${accent}1A`
      : "rgba(255,255,255,0.07)";

  return (
    <StatusBadge
      label={isPremium ? "PREMIUM" : "GRATUIT"}
      tone={isPremium ? "premium" : "accent"}
      appearance="soft"
      size="compact"
      accentColor={accent}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
    />
  );
}
