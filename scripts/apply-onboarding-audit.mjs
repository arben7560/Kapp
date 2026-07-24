#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bundleRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(process.argv[2] ?? process.cwd());

const onboardingPath = path.join(projectRoot, "app", "onboarding.tsx");
const rootLayoutPath = path.join(projectRoot, "app", "_layout.tsx");
const indexPath = path.join(projectRoot, "app", "index.tsx");
const onboardingStatePath = path.join(
  projectRoot,
  "lib",
  "onboarding-state.ts",
);

function fail(message) {
  console.error(`\nErreur : ${message}\n`);
  process.exit(1);
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`fichier introuvable : ${filePath}`);
  }
}

function backup(filePath) {
  const backupPath = `${filePath}.before-onboarding-audit`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }
  return backupPath;
}

function replaceRequired(source, searchValue, replacement, label) {
  if (!source.includes(searchValue)) {
    fail(`remplacement impossible (${label}). Le code a peut-être changé.`);
  }
  return source.replace(searchValue, replacement);
}

assertFile(onboardingPath);
assertFile(rootLayoutPath);
assertFile(indexPath);

const backups = [
  backup(onboardingPath),
  backup(rootLayoutPath),
  backup(indexPath),
];

let onboarding = fs.readFileSync(onboardingPath, "utf8");

onboarding = onboarding.replace(
  /import AsyncStorage from "@react-native-async-storage\/async-storage";\r?\n\r?\n?/,
  "",
);

if (!onboarding.includes('from "../lib/onboarding-state"')) {
  onboarding = replaceRequired(
    onboarding,
    'import { AppText } from "../components/app-text";',
    'import { AppText } from "../components/app-text";\nimport { completeOnboarding } from "../lib/onboarding-state";',
    "import du gestionnaire d’onboarding",
  );
}

onboarding = onboarding.replace(
  /\r?\nconst ONBOARDING_KEY = "kapp_onboarding_completed";/,
  "",
);

onboarding = onboarding.replaceAll(
  'await AsyncStorage.setItem(ONBOARDING_KEY, "true");',
  "await completeOnboarding();",
);

onboarding = onboarding.replace(
  /\n\s*const openBasics = async \(\) => \{[\s\S]*?\n\s*\};/,
  "",
);

onboarding = replaceRequired(
  onboarding,
  "const openMoreScenes = async () => {",
  "const exploreHome = async () => {",
  "renommage de l’action d’accueil",
);

onboarding = replaceRequired(
  onboarding,
  'router.push("/(tabs)" as any);',
  'router.replace("/(tabs)" as any);',
  "navigation vers l’accueil sans retour à l’onboarding",
);

onboarding = replaceRequired(
  onboarding,
  "onPress={openMoreScenes}",
  "onPress={exploreHome}",
  "liaison du lien Explorer l’accueil",
);

const sceneStepIndex = onboarding.indexOf('{step === "scene"');
if (sceneStepIndex < 0) {
  fail('bloc step === "scene" introuvable');
}

const oldTitleIndex = onboarding.indexOf(
  "Où veux-tu commencer ?",
  sceneStepIndex,
);
if (oldTitleIndex < 0) {
  fail("ancien titre de l’écran scène introuvable");
}

const sceneIntroStart = onboarding.lastIndexOf("<View", oldTitleIndex);
const scenesMapIndex = onboarding.indexOf(
  "{SCENES.map((scene) => {",
  oldTitleIndex,
);
const sceneListStart = onboarding.lastIndexOf("<View", scenesMapIndex);

if (
  sceneIntroStart < sceneStepIndex ||
  scenesMapIndex < 0 ||
  sceneListStart <= sceneIntroStart
) {
  fail("limites du bloc de sélection de scène introuvables");
}

const simplifiedSceneHeader = `<View
                style={[
                  styles.sectionHead,
                  isCompactScreen && styles.sectionHeadCompact,
                ]}
              >
                <AppText variant="sectionLabel" style={styles.sectionEyebrow}>
                  POUR COMMENCER
                </AppText>
                <AppText
                  accessibilityRole="header"
                  variant="screenTitle"
                  style={[
                    styles.sectionTitle,
                    styles.sectionTitleScene,
                    isCompactScreen && styles.sectionTitleCompact,
                  ]}
                >
                  Choisis ta première scène
                </AppText>
                <AppText variant="body" style={styles.sectionText}>
                  Sélectionne la situation que tu veux découvrir en premier.
                </AppText>
              </View>
              `;

onboarding =
  onboarding.slice(0, sceneIntroStart) +
  simplifiedSceneHeader +
  onboarding.slice(sceneListStart);

onboarding = onboarding.replaceAll("Ouvrir l’accueil", "Explorer l’accueil");

onboarding = replaceRequired(
  onboarding,
  "accessibilityLabel={`Choisir ${selectedSceneData.title.toLowerCase()}`}",
  "accessibilityLabel={`Continuer avec ${selectedSceneData.title.toLowerCase()}`}",
  "libellé accessible du bouton scène",
);

onboarding = replaceRequired(
  onboarding,
  "Choisir {selectedSceneData.title.toLowerCase()}",
  "Continuer avec {selectedSceneData.title.toLowerCase()}",
  "texte du bouton scène",
);

onboarding = replaceRequired(
  onboarding,
  "Choisis ton approche.",
  "Comment veux-tu commencer ?",
  "question de sélection du mode",
);

onboarding = replaceRequired(
  onboarding,
  ">SIGNATURE</AppText>",
  ">RECOMMANDÉ</AppText>",
  "badge du mode recommandé",
);

const forbiddenFragments = [
  "Où veux-tu commencer ?",
  "Choisis ton parcours",
  ">SIGNATURE</AppText>",
  "onPress={openMoreScenes}",
  "const openBasics = async",
];

for (const fragment of forbiddenFragments) {
  if (onboarding.includes(fragment)) {
    fail(`ancien fragment encore présent : ${fragment}`);
  }
}

if (!onboarding.includes("Choisis ta première scène")) {
  fail("le nouveau titre de sélection de scène n’a pas été inséré");
}
if (!onboarding.includes("Explorer l’accueil")) {
  fail("le lien secondaire vers l’accueil n’a pas été inséré");
}
if (!onboarding.includes("RECOMMANDÉ")) {
  fail("le badge RECOMMANDÉ n’a pas été inséré");
}

fs.writeFileSync(onboardingPath, onboarding, "utf8");

fs.mkdirSync(path.dirname(onboardingStatePath), { recursive: true });
fs.copyFileSync(path.join(bundleRoot, "app", "_layout.tsx"), rootLayoutPath);
fs.copyFileSync(path.join(bundleRoot, "app", "index.tsx"), indexPath);
fs.copyFileSync(
  path.join(bundleRoot, "lib", "onboarding-state.ts"),
  onboardingStatePath,
);

console.log("\nCorrections d’onboarding appliquées avec succès.\n");
console.log("Fichiers modifiés :");
console.log(`- ${onboardingPath}`);
console.log(`- ${rootLayoutPath}`);
console.log(`- ${indexPath}`);
console.log(`- ${onboardingStatePath}`);
console.log("\nSauvegardes :");
backups.forEach((filePath) => console.log(`- ${filePath}`));
console.log("\nÀ exécuter ensuite :");
console.log("- npx tsc --noEmit");
console.log("- npx expo start --clear");
