const fs = require('fs');
const path = require('path');

const root = process.cwd();
const vocDir = path.join(root, 'app', '(tabs)', 'voc');
const TARGET = 'rgba(2,3,6,0.56)';

const simpleOverlayFiles = ['basics.tsx', 'nuit.tsx', 'romance.tsx', 'sante.tsx'];
const legacyBackgroundFiles = [
  'emotion.tsx',
  'famille.tsx',
  'health.tsx',
  'meteo.tsx',
  'objets.tsx',
  'voyage.tsx',
  'lieux.tsx',
];

function read(file) {
  const full = path.join(vocDir, file);
  if (!fs.existsSync(full)) throw new Error(`Fichier introuvable: ${full}`);
  return { full, text: fs.readFileSync(full, 'utf8') };
}

function writeIfChanged(full, before, after, label) {
  if (before === after) {
    console.log(`= ${label}: déjà conforme / aucune modification nécessaire`);
    return false;
  }
  fs.writeFileSync(full, after, 'utf8');
  console.log(`✓ ${label}: harmonisé`);
  return true;
}

function ensureOverlayStyle(text, nl, file) {
  const overlayBlock = /overlay\s*:\s*\{[\s\S]*?\.\.\.ABSOLUTE_FILL,[\s\S]*?backgroundColor\s*:\s*["']rgba\(2,3,6,[^)]+\)["'][\s\S]*?\},/m;
  if (overlayBlock.test(text)) {
    return text.replace(
      /(overlay\s*:\s*\{[\s\S]*?\.\.\.ABSOLUTE_FILL,[\s\S]*?backgroundColor\s*:\s*)["']rgba\(2,3,6,[^)]+\)["']/m,
      `$1"${TARGET}"`,
    );
  }

  const containerLine = /(const styles = StyleSheet\.create\(\{\s*\r?\n\s*container\s*:\s*\{[^\r\n]*\},)/m;
  if (!containerLine.test(text)) {
    throw new Error(`${file}: impossible de trouver styles.container pour ajouter styles.overlay`);
  }

  return text.replace(
    containerLine,
    `$1${nl}  overlay: {${nl}    ...ABSOLUTE_FILL,${nl}    backgroundColor: "${TARGET}",${nl}  },`,
  );
}

let changed = 0;

for (const file of simpleOverlayFiles) {
  const { full, text } = read(file);
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const next = ensureOverlayStyle(text, nl, file);
  if (writeIfChanged(full, text, next, file)) changed++;
}

// Transport : même overlay que Gastronomie + suppression du BlurView plein écran du background.
{
  const file = 'transport.tsx';
  const { full, text } = read(file);
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  let next = ensureOverlayStyle(text, nl, file);
  next = next.replace(
    /(<ImageBackground\s+source=\{activeScene\.image\}\s+style=\{styles\.bg\}>\s*)<BlurView\s+intensity=\{40\}\s+tint=["']dark["']\s+style=\{ABSOLUTE_FILL\}\s*\/>\s*/m,
    '$1',
  );
  if (writeIfChanged(full, text, next, file)) changed++;
}

// Anciennes pages : retire blurRadius du fond et remplace uniquement le gradient plein écran
// placé directement entre ImageBackground et SafeAreaView par l'overlay Gastronomie.
for (const file of legacyBackgroundFiles) {
  const { full, text } = read(file);
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  let next = text;

  const block = /(<ImageBackground\b[\s\S]*?source=\{BACKGROUND_SOURCE\}[\s\S]*?)(>)([\s\S]*?)(<SafeAreaView\b)/m;
  const match = next.match(block);
  if (!match) {
    throw new Error(`${file}: bloc ImageBackground principal introuvable`);
  }

  let opening = match[1];
  const middle = match[3];

  if (!middle.includes('LinearGradient') && !middle.includes('styles.overlay')) {
    throw new Error(`${file}: couche de fond inattendue; aucune modification appliquée`);
  }

  opening = opening.replace(/\r?\n\s*blurRadius=\{4\}/m, '');

  const replacementMiddle = middle.includes('styles.overlay')
    ? middle
    : `${nl}        <View style={styles.overlay} />${nl}        `;

  next = next.replace(block, `${opening}>${replacementMiddle}$4`);
  next = ensureOverlayStyle(next, nl, file);

  if (writeIfChanged(full, text, next, file)) changed++;
}

console.log(`\nTerminé : ${changed} fichier(s) modifié(s).`);
console.log('Lance maintenant : npx tsc --noEmit');
console.log('Puis vérifie : git diff -- app/(tabs)/voc');
