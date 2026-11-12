import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SubscriptionOfferId } from "./config";

const STORAGE_KEY = "kapp:pending-premium-intent:v1";
const MAX_AGE = 24 * 60 * 60 * 1000;
let storageQueue: Promise<unknown> = Promise.resolve();
function withIntentStorage<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageQueue.catch(() => undefined).then(operation);
  storageQueue = result.catch(() => undefined);
  return result;
}
export type PurchaseIntent = {
  offerId: SubscriptionOfferId;
  returnTo?: string;
  action: "purchase" | "restore";
  createdAt: number;
};

export function premiumDestination(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 1000) return undefined;
  if (value === "/account") return value;
  if (!/^\/(?:voc|comptage|classificateur|grammar|lesson)\/[a-zA-Z0-9_-]+(?:\?[^#]*)?$/.test(value)) return undefined;
  return value;
}

export function premiumRoute(returnTo?: string, params?: Record<string, string>) {
  const destination = returnTo && params
    ? `${returnTo}?${Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")}`
    : returnTo;
  return { pathname: "/premium" as const, params: { returnTo: premiumDestination(destination) ?? "" } };
}

export function parsePurchaseIntent(value: unknown, now = Date.now()): PurchaseIntent | null {
  if (!value || typeof value !== "object") return null;
  const intent = value as PurchaseIntent;
  if ((intent.offerId !== "monthly" && intent.offerId !== "yearly") ||
      (intent.action !== "purchase" && intent.action !== "restore") ||
      !Number.isFinite(intent.createdAt) || intent.createdAt > now || now - intent.createdAt > MAX_AGE) return null;
  return { ...intent, returnTo: premiumDestination(intent.returnTo) };
}

export async function savePurchaseIntent(intent: Omit<PurchaseIntent, "createdAt">) {
  await withIntentStorage(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, createdAt: Date.now() })));
}

export async function clearPurchaseIntent() {
  await withIntentStorage(() => AsyncStorage.removeItem(STORAGE_KEY));
}

export async function resumePurchaseIntent(onResume: (intent: PurchaseIntent) => boolean): Promise<void> {
  await withIntentStorage(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let intent: PurchaseIntent | null = null;
    try { intent = parsePurchaseIntent(JSON.parse(raw)); } catch { /* discard invalid local data */ }
    // The focused screen decides synchronously whether it can navigate. A
    // blur/auth transition leaves the intent intact, without overwriting a
    // newer selection with an asynchronously re-saved old one.
    if (!intent || onResume(intent)) await AsyncStorage.removeItem(STORAGE_KEY);
  });
}
