import AsyncStorage from "@react-native-async-storage/async-storage";

const HOME_RESUME_STORAGE_KEY = "kapp:home-resume:v1";

export type HomeResumeContext = {
  track: "vocab";
  title: string;
  detail: string;
  route: string;
  updatedAt: string;
};

export async function readHomeResumeContext(): Promise<HomeResumeContext | null> {
  const raw = await AsyncStorage.getItem(HOME_RESUME_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<HomeResumeContext>;

    if (
      parsed.track !== "vocab" ||
      typeof parsed.title !== "string" ||
      typeof parsed.detail !== "string" ||
      typeof parsed.route !== "string"
    ) {
      return null;
    }

    return {
      track: "vocab",
      title: parsed.title,
      detail: parsed.detail,
      route: parsed.route,
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
