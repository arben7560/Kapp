import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const comptageAppDirectory = join(root, "app", "(tabs)", "comptage");
const comptageComponent = join(
  root,
  "components",
  "comptage",
  "CountingImmersionScreen.tsx",
);
const audioDirectory = join(root, "assets", "audio", "comptage");
const lessonFiles = [
  "age.tsx",
  "base.tsx",
  "dates.tsx",
  "heures.tsx",
  "ordinals.tsx",
  "phone.tsx",
  "prix.tsx",
  "sino.tsx",
].map((fileName) => join(comptageAppDirectory, fileName));

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function normalize(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function getRequiredAudioPaths(source, sourceFile) {
  return [...source.matchAll(/require\("([^"]+\.mp3)"\)/gu)].map(
    ([, requestedPath]) => normalize(resolve(dirname(sourceFile), requestedPath)),
  );
}

test("Comptage n’utilise aucune synthèse expo-speech", () => {
  const sources = [comptageComponent, ...lessonFiles]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  for (const forbidden of [
    /expo-speech/u,
    /speechPlayback/u,
    /useSpeechLifecycle/u,
    /Speech\./u,
    /fallbackToSpeech/u,
    /speakFallback/u,
    /playOrSpeak/u,
  ]) {
    assert.doesNotMatch(sources, forbidden);
  }

  assert.match(readFileSync(comptageComponent, "utf8"), /playRecordedAudio/u);
});

test("chaque dialogue et chaque carte Comptage référence son MP3 intégré", () => {
  const assets = listFiles(audioDirectory)
    .filter((path) => path.endsWith(".mp3"))
    .map(normalize)
    .sort();
  const requiredAssets = lessonFiles
    .flatMap((file) => getRequiredAudioPaths(readFileSync(file, "utf8"), file))
    .sort();

  assert.equal(assets.length, 240);
  assert.equal(requiredAssets.length, 240);
  assert.deepEqual(requiredAssets, assets);
  assert.equal(new Set(requiredAssets).size, requiredAssets.length);
});

test("les chemins audio Comptage sont des fichiers MP3 valides et non vides", () => {
  for (const lessonFile of lessonFiles) {
    const source = readFileSync(lessonFile, "utf8");
    assert.doesNotMatch(source, /audio\w*:\s*undefined/u, basename(lessonFile));

    for (const audioPath of getRequiredAudioPaths(source, lessonFile)) {
      const absolutePath = join(root, audioPath);
      assert.ok(statSync(absolutePath).isFile(), audioPath);
      assert.ok(statSync(absolutePath).size > 0, audioPath);
    }
  }
});
