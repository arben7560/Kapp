import AsyncStorage from "@react-native-async-storage/async-storage";

const HOME_RESUME_STORAGE_KEY = "kapp:home-resume:v1";

export type HomeResumeTrack =
  | "hangul"
  | "grammar"
  | "vocab"
  | "numbers"
  | "dialogs"
  | "listen"
  | "cafe_ia"
  | "metro_ia"
  | "restaurant_ia"
  | "aeroport_ia";

const HOME_RESUME_TRACKS = new Set<HomeResumeTrack>([
  "hangul",
  "grammar",
  "vocab",
  "numbers",
  "dialogs",
  "listen",
  "cafe_ia",
  "metro_ia",
  "restaurant_ia",
  "aeroport_ia",
]);

export type HomeResumeContext = {
  track: HomeResumeTrack;
  title: string;
  detail: string;
  route: string;
  routeParams?: Record<string, string>;
  updatedAt: string;
};

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((entry) => typeof entry === "string");
}

export async function readHomeResumeContext(): Promise<HomeResumeContext | null> {
  const raw = await AsyncStorage.getItem(HOME_RESUME_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<HomeResumeContext>;

    if (
      typeof parsed.track !== "string" ||
      !HOME_RESUME_TRACKS.has(parsed.track as HomeResumeTrack) ||
      typeof parsed.title !== "string" ||
      typeof parsed.detail !== "string" ||
      typeof parsed.route !== "string"
    ) {
      return null;
    }

    return {
      track: parsed.track as HomeResumeTrack,
      title: parsed.title,
      detail: parsed.detail,
      route: parsed.route,
      routeParams: isStringRecord(parsed.routeParams)
        ? parsed.routeParams
        : undefined,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveHomeResumeContext(
  context: Omit<HomeResumeContext, "updatedAt">,
): Promise<void> {
  const next: HomeResumeContext = {
    ...context,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(HOME_RESUME_STORAGE_KEY, JSON.stringify(next));
}
