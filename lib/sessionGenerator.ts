import {
  exercises,
  ListeningExercise,
  Theme,
} from "../data/listeningExercises";

export type WeeklyTheme = {
  dayIndex: number;
  shortLabel: string;
  theme: Theme | "review";
  themeLabel: string;
};

export type DailySession = {
  theme: Theme | "review";
  themeLabel: string;
  story: string;
  tomorrowLabel: string;
  weeklyProgram: WeeklyTheme[];
  items: ListeningExercise[];
};

const weeklyCycle: { theme: Theme | "review"; shortLabel: string }[] = [
  { theme: "cafe", shortLabel: "Lun" },
  { theme: "restaurant", shortLabel: "Mar" },
  { theme: "metro", shortLabel: "Mer" },
  { theme: "shop", shortLabel: "Jeu" },
  { theme: "social", shortLabel: "Ven" },
  { theme: "hotel", shortLabel: "Sam" },
  { theme: "review", shortLabel: "Dim" },
];

// JS getDay(): 0 = dimanche, 1 = lundi ... 6 = samedi
function mapJsDayToProgramIndex(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getThemeLabel(theme: Theme | "review") {
  switch (theme) {
    case "cafe":
      return "Café";
    case "restaurant":
      return "Restaurant";
    case "metro":
      return "Métro";
    case "shop":
      return "Magasin";
    case "convenience":
      return "Supérette";
    case "direction":
      return "Direction";
    case "social":
      return "Rencontre";
    case "hotel":
      return "Hôtel";
    case "taxi":
      return "Taxi";
    case "help":
      return "Aide";
    case "review":
      return "Révision Séoul";
    default:
      return "Séoul";
  }
}

function getStory(theme: Theme | "review") {
  switch (theme) {
    case "cafe":
      return "Aujourd’hui, tu commandes dans un café à Séoul.";
    case "restaurant":
      return "Aujourd’hui, tu manges au restaurant à Séoul.";
    case "metro":
      return "Aujourd’hui, tu te déplaces dans le métro de Séoul.";
    case "shop":
      return "Aujourd’hui, tu fais du shopping à Séoul.";
    case "convenience":
      return "Aujourd’hui, tu passes dans une supérette coréenne.";
    case "direction":
      return "Aujourd’hui, tu demandes ton chemin dans Séoul.";
    case "social":
      return "Aujourd’hui, tu échanges avec quelqu’un à Séoul.";
    case "hotel":
      return "Aujourd’hui, tu gères ton séjour à l’hôtel.";
    case "taxi":
      return "Aujourd’hui, tu prends un taxi en Corée.";
    case "help":
      return "Aujourd’hui, tu apprends à demander de l’aide.";
    case "review":
      return "Aujourd’hui, tu révises plusieurs situations de la vie réelle à Séoul.";
    default:
      return "Aujourd’hui, tu progresses en compréhension orale.";
  }
}

function seededShuffle<T>(array: T[], seed: number) {
  const result = [...array];
  let s = seed;

  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function sortByDifficulty(items: ListeningExercise[]) {
  return [...items].sort((a, b) => a.difficulty - b.difficulty);
}

function uniqueById(items: ListeningExercise[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildWeeklyProgram(): WeeklyTheme[] {
  return weeklyCycle.map((entry, idx) => ({
    dayIndex: idx,
    shortLabel: entry.shortLabel,
    theme: entry.theme,
    themeLabel: getThemeLabel(entry.theme),
  }));
}

function buildReviewSession(seed: number) {
  const shuffled = seededShuffle(exercises, seed);
  const sorted = sortByDifficulty(shuffled);
  return uniqueById(sorted).slice(0, 10);
}

function buildThemeSession(theme: Theme, seed: number) {
  const themed = sortByDifficulty(
    seededShuffle(
      exercises.filter((e) => e.theme === theme),
      seed,
    ),
  );

  const reviewPool = sortByDifficulty(
    seededShuffle(
      exercises.filter((e) => e.theme !== theme),
      seed + 77,
    ),
  );

  // 6 du thème du jour + 4 de révision
  const primary = themed.slice(0, 6);
  const review = reviewPool.slice(0, 4);

  return uniqueById([...primary, ...review]).slice(0, 10);
}

export function generateDailySession(): DailySession {
  const now = new Date();
  const jsDay = now.getDay();
  const todayIndex = mapJsDayToProgramIndex(jsDay);
  const tomorrowIndex = (todayIndex + 1) % 7;

  const todayTheme = weeklyCycle[todayIndex].theme;
  const tomorrowTheme = weeklyCycle[tomorrowIndex].theme;

  const seed = Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate(),
    ).padStart(2, "0")}`,
  );

  const items =
    todayTheme === "review"
      ? buildReviewSession(seed)
      : buildThemeSession(todayTheme, seed);

  return {
    theme: todayTheme,
    themeLabel: getThemeLabel(todayTheme),
    story: getStory(todayTheme),
    tomorrowLabel: getThemeLabel(tomorrowTheme),
    weeklyProgram: buildWeeklyProgram(),
    items,
  };
}
