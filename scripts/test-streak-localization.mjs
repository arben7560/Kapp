import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { createAppI18n } = await import("../lib/i18n/instance.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resources } = await import("../locales/index.ts");
const { resolveStreakText, formatStreakText, formatStreakCalendarDate } =
  await import("../lib/i18n/streakText.ts");

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const fr = JSON.parse(read("../locales/fr/streak.json"));
const ja = JSON.parse(read("../locales/ja/streak.json"));
const manifest = JSON.parse(read("../locales/manifest.json"));
const instance = createAppI18n("ja");
const translate = (source) => resolveStreakText(source, "ja", instance);
const display = (template, values, locale = "ja") =>
  formatStreakText(template, values, locale, instance);

test("Streak is a registered FR/JA namespace with identical source IDs and placeholders", () => {
  assert.ok(manifest.namespaces.includes("streak"));
  assert.ok(manifest.japaneseUiNamespaces.includes("streak"));
  assert.deepEqual(validateCataloguePair(resources.fr.streak, resources.ja.streak), []);
  assert.deepEqual(Object.keys(fr.copy).sort(), Object.keys(ja.copy).sort());
  const entries = Object.entries(fr.copy).flatMap(([section, values]) =>
    Object.entries(values).map(([id, source]) => ({ section, id, source })),
  );
  assert.ok(entries.length >= 30);
  for (const { section, id, source } of entries) {
    assert.equal(id, encodeURIComponent(source).replaceAll(".", "%2E"), source);
    assert.equal(translate(source), ja.copy[section][id], source);
    assert.equal(resolveStreakText(source, "fr", instance), source);
  }
});

test("Natural Japanese display for streaks, validation, records and earned badges", () => {
  for (const [source, expected] of [
    ["Série", "連続学習の記録"],
    ["HABITUDE QUOTIDIENNE", "毎日の学習習慣"],
    ["jour de suite", "日連続"],
    ["jours de suite", "日連続"],
    ["Jour valide. Ta série est conservée.", "今日の学習は完了。連続記録は維持されています。"],
    ["Une petite activité suffit pour conserver ta série.", "今日、学習を１つ完了すれば連続記録を維持できます。"],
    ["Record", "最長記録"],
    ["Aujourd'hui", "今日"],
    ["Valide", "達成"],
    ["À faire", "未完了"],
    ["Protection de série", "連続記録の保護"],
    ["Calendrier", "学習カレンダー"],
    ["Protection douce", "休んだ日も記録を守る"],
    ["Utiliser une protection", "保護アイテムを使う"],
    ["Badges", "達成バッジ"],
    ["Paliers non punitifs", "獲得したバッジは失われません"],
    ["Débloqué", "獲得済み"],
    ["Verrouillé", "未獲得"],
  ]) {
    assert.equal(translate(source), expected, source);
  }
});

test("Localized counters preserve raw numeric progress and French output", () => {
  assert.equal(display("{{count}} j", { count: 1 }), "1日");
  assert.equal(display("{{count}} j", { count: 365 }), "365日");
  assert.equal(display("Derniers {{count}} jours", { count: 35 }), "過去35日間");
  assert.equal(display("{{count}} j", { count: 14 }, "fr"), "14 j");
  assert.equal(display("Derniers {{count}} jours", { count: 35 }, "fr"), "Derniers 35 jours");
  assert.equal(translate("jours"), "日連続");
  assert.equal(translate("jour de suite"), "日連続");
});

test("Calendar accessible labels are localized, including today and freeze states", () => {
  const date = "2026-11-11";
  assert.equal(formatStreakCalendarDate(date, "fr"), "11/11/2026");
  assert.equal(formatStreakCalendarDate(date, "ja"), "2026年11月11日");
  assert.equal(formatStreakCalendarDate("invalid", "ja"), "invalid");
  assert.equal(
    display("{{date}} : {{status}}.", { date: formatStreakCalendarDate(date, "ja"), status: translate("Journée validée") }),
    "2026年11月11日：学習済み。",
  );
  assert.equal(
    display("Aujourd'hui ({{date}}) : {{status}}.", { date: formatStreakCalendarDate(date, "ja"), status: translate("Protection utilisée") }),
    "今日（2026年11月11日）：保護アイテム使用。",
  );
  assert.equal(translate("Aucune activité validée"), "学習記録なし");
});

test("Badges, statistics and protection controls give accurate accessible names", () => {
  assert.equal(
    display("Badge {{count}} jours : {{status}}.", { count: 30, status: translate("Débloqué") }),
    "30日連続のバッジ：獲得済み。",
  );
  assert.equal(
    display("{{label}} : {{value}}", { label: translate("Record"), value: display("{{count}} j", { count: 7 }) }),
    "最長記録：7日",
  );
  assert.equal(
    translate("Utilise une protection pour conserver la série après une journée manquée."),
    "学習を休んだ１日を補い、連続記録を維持します。",
  );
});

test("Streak page and all dynamic strings use the locale provider without changing actions", () => {
  const screen = read("../app/streak.tsx");
  const provider = read("../lib/i18n/StreakLocalizationProvider.tsx");
  assert.ok(screen.includes("<StreakLocalizationProvider>"));
  assert.ok(screen.includes('value={text("{{count}} j", { count: longestStreak })}'));
  assert.ok(screen.includes('text("Derniers {{count}} jours", { count: CALENDAR_DAYS })'));
  assert.ok(screen.includes('accessibilityLabel={dayAccessibilityLabel}'));
  assert.ok(screen.includes('accessibilityRole="text"'));
  assert.ok(screen.includes('accessibilityRole="button"'));
  assert.ok(screen.includes('accessibilityHint={text("Utilise une protection pour conserver la série après une journée manquée.")}'));
  assert.ok(screen.includes('accessibilityLabel={text("Badge {{count}} jours : {{status}}."'));
  assert.ok(screen.includes('accessibilityState={{ disabled: isLoading || (streak?.freezesAvailable ?? 0) <= 0 }}'));
  assert.ok(screen.includes('void applyFreeze()'));
  assert.ok(screen.includes('STREAK_BADGE_MILESTONES.map'));
  assert.ok(screen.includes('getStreakDateKey(date)'));
  assert.ok(provider.includes('useTranslation("streak")'));
  assert.ok(provider.includes("VocabularyTextContext.Provider"));
  const directText = [...screen.matchAll(/<AppText\b[^>]*>\s*([^<{][^<{}]*?)\s*<\/AppText>/gu)]
    .map((match) => match[1].replace(/\s+/gu, " ").trim())
    .filter((source) => /[a-zà-ÿ]/iu.test(source) && source.length > 3);
  assert.ok(directText.length >= 8);
  for (const source of directText) {
    assert.notEqual(translate(source), source, "Untranslated visible streak text: " + source);
  }
});

test("Streak TypeScript/JSX files parse without syntax errors", () => {
  for (const file of [
    "../app/streak.tsx",
    "../lib/i18n/StreakLocalizationProvider.tsx",
    "../lib/i18n/streakText.ts",
  ]) {
    const output = ts.transpileModule(read(file), {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    });
    const errors = (output.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.deepEqual(errors, [], "Syntax errors in " + file);
  }
});
