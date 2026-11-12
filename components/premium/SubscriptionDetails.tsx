import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppText } from "../app-text";
import type { subscriptionDetails } from "../../lib/paywall/subscriptionDetails";

export function SubscriptionDetails({ details }: { details: ReturnType<typeof subscriptionDetails> }) {
  const { t, i18n } = useTranslation("premium");
  const format = (value: number) => new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    dateStyle: "long", timeStyle: "short",
  }).format(value);
  const rows: string[] = [];
  if (details.currentPrice && details.plan) rows.push(t("subscription.currentPrice", {
    price: details.currentPrice, period: t(`subscription.period.${details.plan}`),
  }));
  if (details.hasHistory) rows.push(details.purchaseAt
    ? t("subscription.purchaseDate", { date: format(details.purchaseAt) })
    : t("subscription.purchaseDateUnknown"));
  if (details.expiresAt) rows.push(t("subscription.periodEnd", { date: format(details.expiresAt) }));
  if (details.willRenew !== undefined) rows.push(t(details.willRenew ? "subscription.autoRenewOn" : "subscription.autoRenewOff"));
  else if (details.hasHistory) rows.push(t("subscription.autoRenewUnknown"));
  if (details.state === "grace" && details.graceExpiresAt) rows.push(t("subscription.graceNotice", { date: format(details.graceExpiresAt) }));
  if (details.state === "billingIssue") rows.push(t(details.hasAccess ? "subscription.billingAccess" : "subscription.billingNoAccess"));
  if (details.state === "paused" && details.autoResumeAt) rows.push(t("subscription.resumeDate", { date: format(details.autoResumeAt) }));
  if (details.isTestStore) rows.push(t("subscription.testNotice"));
  else if (details.hasAccess && !details.canManage) rows.push(t("subscription.internalNotice"));
  if (!rows.length) return null;
  return <View style={{ gap: 8, marginTop: 12 }}>
    {rows.map((text) => <AppText key={text} variant="caption" tone="soft">{text}</AppText>)}
  </View>;
}
