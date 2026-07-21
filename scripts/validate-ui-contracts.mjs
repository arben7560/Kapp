import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const errors = [];

const normalizePath = (filePath) => filePath.replaceAll("\\", "/");
const absolutePath = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(absolutePath(relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

/**
 * This catalogue is the production route contract. It is intentionally
 * exhaustive: adding a file below app/ requires choosing a lifecycle here.
 * `entry:/` distinguishes Expo Router's entry gate from the tabs index, which
 * both eventually resolve to `/` but are two independently rendered files.
 */
const activeRoutes = [
  ["entry:/", "app/index.tsx"],
  ["/", "app/(tabs)/index.tsx"],
  ["/onboarding", "app/onboarding.tsx"],
  ["/premium", "app/premium.tsx"],
  ["/streak", "app/streak.tsx"],
  ["/hangul", "app/(tabs)/hangul/index.tsx"],
  ["/hangul/vowels-basic", "app/(tabs)/hangul/vowels-basic.tsx"],
  ["/hangul/consonants-basic", "app/(tabs)/hangul/consonants-basic.tsx"],
  ["/hangul/vowels-compound", "app/(tabs)/hangul/vowels-compound.tsx"],
  ["/hangul/consonants-tense", "app/(tabs)/hangul/consonants-tense.tsx"],
  ["/hangul/batchim", "app/(tabs)/hangul/batchim.tsx"],
  ["/hangul/assessment", "app/(tabs)/hangul/assessment.tsx"],
  ["/hangul/bridge", "app/(tabs)/hangul/bridge.tsx"],
  ["/grammar", "app/(tabs)/grammar/index.tsx"],
  ["/grammar/[stageId]", "app/(tabs)/grammar/[stageId].tsx"],
  ["/voc", "app/(tabs)/voc/index.tsx"],
  ["/voc/gastronomie", "app/(tabs)/voc/gastronomie.tsx"],
  ["/voc/basics", "app/(tabs)/voc/basics.tsx"],
  ["/voc/transport", "app/(tabs)/voc/transport.tsx"],
  ["/voc/kdrama", "app/(tabs)/voc/kdrama.tsx"],
  ["/voc/romance", "app/(tabs)/voc/romance.tsx"],
  ["/voc/nuit", "app/(tabs)/voc/nuit.tsx"],
  ["/voc/sante", "app/(tabs)/voc/sante.tsx"],
  ["/voc/work", "app/(tabs)/voc/work.tsx"],
  ["/comptage", "app/(tabs)/comptage/index.tsx"],
  ["/comptage/base", "app/(tabs)/comptage/base.tsx"],
  ["/comptage/sino", "app/(tabs)/comptage/sino.tsx"],
  ["/comptage/heures", "app/(tabs)/comptage/heures.tsx"],
  ["/comptage/prix", "app/(tabs)/comptage/prix.tsx"],
  ["/comptage/phone", "app/(tabs)/comptage/phone.tsx"],
  ["/comptage/dates", "app/(tabs)/comptage/dates.tsx"],
  ["/comptage/age", "app/(tabs)/comptage/age.tsx"],
  ["/comptage/ordinals", "app/(tabs)/comptage/ordinals.tsx"],
  ["/speak", "app/(tabs)/speak.tsx"],
  ["/listen", "app/(tabs)/listen.tsx"],
  ["/lesson/cafe", "app/lesson/cafe.tsx"],
  ["/lesson/cafeMissions", "app/lesson/cafeMissions.tsx"],
  ["/lesson/cafeIA", "app/lesson/cafeIA.tsx"],
  ["/lesson/metro", "app/lesson/metro.tsx"],
  ["/lesson/metroMissions", "app/lesson/metroMissions.tsx"],
  ["/lesson/metroIA", "app/lesson/metroIA.tsx"],
  ["/lesson/restaurant", "app/lesson/restaurant.tsx"],
  ["/lesson/restaurantMissions", "app/lesson/restaurantMissions.tsx"],
  ["/lesson/restaurantIA", "app/lesson/restaurantIA.tsx"],
  ["/lesson/airport", "app/lesson/airport.tsx"],
  ["/lesson/aeroportMissions", "app/lesson/aeroportMissions.tsx"],
  ["/lesson/aeroportIA", "app/lesson/aeroportIA.tsx"],
  ["/lesson/magasin", "app/lesson/magasin.tsx"],
];

const compatibilityRoutes = [
  ["/lesson/airportIA", "app/lesson/airportIA.tsx"],
  ["/listen/teacherIA", "app/listen/teacherIA.tsx"],
  ["/listen/teacherIARealtime", "app/listen/teacherIARealtime.tsx"],
];

const prototypeRoutes = [
  ["/classificateur", "app/(tabs)/classificateur/index.tsx"],
  ["/classificateur/animals", "app/(tabs)/classificateur/animals.tsx"],
  ["/classificateur/drinks", "app/(tabs)/classificateur/drinks.tsx"],
  ["/classificateur/machines", "app/(tabs)/classificateur/machines.tsx"],
  ["/classificateur/objects", "app/(tabs)/classificateur/objects.tsx"],
  ["/classificateur/paper", "app/(tabs)/classificateur/paper.tsx"],
  ["/classificateur/people", "app/(tabs)/classificateur/people.tsx"],
  ["/immersion", "app/(tabs)/immersion.tsx"],
  ["/immersion/[id]", "app/immersion/[id].tsx"],
  ["/immersion/convenience-night", "app/immersion/convenience-night.tsx"],
  ["/immersion/gangnam", "app/immersion/gangnam.tsx"],
  ["/immersion/myeongdong", "app/immersion/myeongdong.tsx"],
  ["/immersion/seongsu", "app/immersion/seongsu.tsx"],
  ["/immersion/social", "app/immersion/social.tsx"],
  ["/profile", "app/(tabs)/profile.tsx"],
  ["/review", "app/(tabs)/review.tsx"],
  ["/assimilation", "app/assimilation.tsx"],
  ["/listen/CafeListen", "app/listen/CafeListen.tsx"],
  ["/listen/MetroListen", "app/listen/MetroListen.tsx"],
  ["/listen/RestaurantListen", "app/listen/RestaurantListen.tsx"],
  ["/listen/index-quiz", "app/listen/index-quiz.tsx"],
  ["/lesson/health", "app/lesson/health.tsx"],
  ["/lesson/help", "app/lesson/help.tsx"],
  ["/lesson/hotel", "app/lesson/hotel.tsx"],
  ["/lesson/late", "app/lesson/late.tsx"],
  ["/lesson/taxi", "app/lesson/taxi.tsx"],
  ["/voc/emotion", "app/(tabs)/voc/emotion.tsx"],
  ["/voc/famille", "app/(tabs)/voc/famille.tsx"],
  ["/voc/health", "app/(tabs)/voc/health.tsx"],
  ["/voc/lieux", "app/(tabs)/voc/lieux.tsx"],
  ["/voc/meteo", "app/(tabs)/voc/meteo.tsx"],
  ["/voc/objets", "app/(tabs)/voc/objets.tsx"],
  ["/voc/voyage", "app/(tabs)/voc/voyage.tsx"],
];

const routeGroups = {
  active: activeRoutes,
  compatibility: compatibilityRoutes,
  prototype: prototypeRoutes,
};

const infrastructureEntries = ["app/_layout.tsx", "app/(tabs)/_layout.tsx"];

// Native Text is an implementation detail of the central wrapper only. No
// route-specific waiver is accepted.
const nativeTextExceptions = new Map([
  [
    "components/app-text.tsx",
    "wrapper central AppText et runs internes accessibles par script",
  ],
]);

// Active routes must not reference prototype routes.
const prototypeReferenceExceptions = new Map();

const nonNavigationRouteReferenceFiles = new Map([
  [
    "app/_layout.tsx",
    "inventaire de routes masquées en release; la seule navigation va vers l'accueil",
  ],
  [
    "lib/paywall/config.ts",
    "inventaire d'accès Premium; ce Set ne déclenche aucune navigation",
  ],
  [
    "data/grammar/contentLinks.ts",
    "registre de contenus filtré par disponibilité avant toute navigation grammaticale",
  ],
]);

// Font declarations are owned by these infrastructure files. Active UI files
// and shared components reached from them must use semantic AppText tokens.
const directTypographyExceptions = new Map([
  ["components/app-text.tsx", "résolution centrale des tokens"],
  ["constants/theme.ts", "déclaration centrale des tokens et familles"],
  ["app/_layout.tsx", "enregistrement Expo des fontes"],
]);

function walkFiles(directory, predicate) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath, predicate));
    } else if (predicate(fullPath)) {
      result.push(normalizePath(path.relative(root, fullPath)));
    }
  }
  return result;
}

function discoverRouteFiles() {
  return walkFiles(absolutePath("app"), (filePath) => {
    if (!/\.(?:tsx|jsx)$/.test(filePath)) return false;
    return !/^_layout\.(?:tsx|jsx)$/.test(path.basename(filePath));
  }).sort();
}

function validateRouteCatalogue() {
  const catalogueFiles = new Map();
  const cataloguePaths = new Map();

  for (const [lifecycle, routes] of Object.entries(routeGroups)) {
    for (const [route, file] of routes) {
      assert(fs.existsSync(absolutePath(file)), `${lifecycle} ${route} -> ${file} est absent`);

      const previousFile = catalogueFiles.get(file);
      assert(
        !previousFile,
        `${file} est classé deux fois (${previousFile ?? "?"} et ${lifecycle})`,
      );
      catalogueFiles.set(file, lifecycle);

      assert(
        !cataloguePaths.has(route),
        `${route} est dupliquée entre ${cataloguePaths.get(route) ?? "?"} et ${lifecycle}`,
      );
      cataloguePaths.set(route, lifecycle);
    }
  }

  const discovered = discoverRouteFiles();
  for (const file of discovered) {
    assert(
      catalogueFiles.has(file),
      `${file} n'a aucun statut explicite (active, prototype ou compatibilité)`,
    );
  }
  for (const file of catalogueFiles.keys()) {
    assert(discovered.includes(file), `${file} est catalogué mais n'est pas un fichier-route`);
  }
}

const sourceFileCache = new Map();

function parseSource(relativePath) {
  if (sourceFileCache.has(relativePath)) return sourceFileCache.get(relativePath);
  const source = read(relativePath);
  const scriptKind = relativePath.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : relativePath.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : relativePath.endsWith(".js") || relativePath.endsWith(".mjs")
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  const parsed = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  sourceFileCache.set(relativePath, parsed);
  return parsed;
}

function localModuleSpecifiers(relativePath) {
  const parsed = parseSource(relativePath);
  const specifiers = [];

  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]) &&
      ((ts.isIdentifier(node.expression) && node.expression.text === "require") ||
        node.expression.kind === ts.SyntaxKind.ImportKeyword)
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return specifiers.filter(
    (specifier) => specifier.startsWith(".") || specifier.startsWith("@/"),
  );
}

const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function resolveLocalModule(fromFile, specifier) {
  const base = specifier.startsWith("@/")
    ? absolutePath(specifier.slice(2))
    : path.resolve(path.dirname(absolutePath(fromFile)), specifier);
  const candidates = [base];
  for (const extension of codeExtensions) candidates.push(`${base}${extension}`);
  for (const extension of codeExtensions) candidates.push(path.join(base, `index${extension}`));

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    if (!codeExtensions.includes(path.extname(candidate))) continue;
    return normalizePath(path.relative(root, candidate));
  }
  return null;
}

function collectLocalDependencyGraph(entryFiles) {
  const visited = new Set();
  const pending = [...entryFiles];

  while (pending.length) {
    const file = pending.pop();
    if (!file || visited.has(file) || !fs.existsSync(absolutePath(file))) continue;
    visited.add(file);
    for (const specifier of localModuleSpecifiers(file)) {
      const dependency = resolveLocalModule(file, specifier);
      if (dependency && !visited.has(dependency)) pending.push(dependency);
    }
  }
  return visited;
}

function lineNumber(parsed, node) {
  return parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1;
}

function propertyNameText(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  if (
    ts.isComputedPropertyName(name) &&
    (ts.isStringLiteral(name.expression) ||
      ts.isNoSubstitutionTemplateLiteral(name.expression))
  ) {
    return name.expression.text;
  }
  return null;
}

function importedNativeTextNames(parsed) {
  const names = new Set();
  const animatedNames = new Set();
  const namespaces = new Set();

  for (const statement of parsed.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "react-native" ||
      !statement.importClause ||
      statement.importClause.isTypeOnly
    ) {
      continue;
    }

    const bindings = statement.importClause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue;
        const importedName = (element.propertyName ?? element.name).text;
        if (importedName === "Text") {
          names.add(element.name.text);
        }
        if (importedName === "Animated") animatedNames.add(element.name.text);
      }
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      namespaces.add(bindings.name.text);
    }
  }

  const visitRequire = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "require" &&
      node.initializer.arguments.length === 1 &&
      ts.isStringLiteral(node.initializer.arguments[0]) &&
      node.initializer.arguments[0].text === "react-native"
    ) {
      if (ts.isIdentifier(node.name)) {
        namespaces.add(node.name.text);
      } else if (ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          const importedName = (element.propertyName ?? element.name).getText(parsed);
          const localName = element.name.getText(parsed);
          if (importedName === "Text") names.add(localName);
          if (importedName === "Animated") animatedNames.add(localName);
        }
      }
    }
    ts.forEachChild(node, visitRequire);
  };
  visitRequire(parsed);

  return { animatedNames, names, namespaces };
}

function jsxTagText(tagName) {
  if (ts.isIdentifier(tagName)) return tagName.text;
  if (ts.isPropertyAccessExpression(tagName)) return tagName.getText();
  return tagName.getText();
}

function validateNoNativeText(relativePath) {
  if (!relativePath.endsWith(".tsx") && !relativePath.endsWith(".jsx")) return;
  const isCentralWrapper = nativeTextExceptions.has(relativePath);

  const parsed = parseSource(relativePath);
  const { animatedNames, names, namespaces } = importedNativeTextNames(parsed);
  const violations = [];
  const directNativeTextLines = [];

  if (!isCentralWrapper) {
    for (const name of names) {
      violations.push(`import ${name}`);
    }
  }

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = jsxTagText(node.tagName);
      if (names.has(tag)) directNativeTextLines.push(lineNumber(parsed, node));
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "Text" &&
      ts.isIdentifier(node.expression) &&
      (animatedNames.has(node.expression.text) || namespaces.has(node.expression.text))
    ) {
      violations.push(`${node.getText(parsed)} ligne ${lineNumber(parsed, node)}`);
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "Text" &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "require" &&
      node.expression.arguments.length === 1 &&
      ts.isStringLiteral(node.expression.arguments[0]) &&
      node.expression.arguments[0].text === "react-native"
    ) {
      violations.push(`require("react-native").Text ligne ${lineNumber(parsed, node)}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);

  if (isCentralWrapper) {
    assert(
      names.size === 1 && names.has("Text") && namespaces.size === 0,
      `${relativePath} doit importer uniquement Text comme primitive textuelle native`,
    );
    assert(
      directNativeTextLines.length === 3,
      `${relativePath} doit limiter Text natif au wrapper AppText, aux runs Hangul dynamiques et aux runs AppMixedText ` +
        `(trouvé lignes ${directNativeTextLines.join(", ") || "aucune"})`,
    );
  }

  assert(
    violations.length === 0,
    `${relativePath} utilise Text natif (${[...new Set(violations)].join(", ")})`,
  );
}

const protectedTypographyKeys = [
  "fontFamily",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "fontWeight",
  "textTransform",
];

function validateNoDirectTypography(relativePath) {
  if (directTypographyExceptions.has(relativePath)) return;
  if (!relativePath.startsWith("app/") && !relativePath.startsWith("components/")) return;

  const parsed = parseSource(relativePath);
  const forbiddenKeys = new Map(
    protectedTypographyKeys.map((key) => [key, []]),
  );
  const hardCodedFonts = [];

  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isShorthandPropertyAssignment(node)
    ) {
      const key = propertyNameText(node.name);
      if (forbiddenKeys.has(key)) forbiddenKeys.get(key).push(lineNumber(parsed, node));
    }
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      /^(?:Outfit|NotoSansKR)_\d/.test(node.text)
    ) {
      hardCodedFonts.push(lineNumber(parsed, node));
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);

  for (const [key, lines] of forbiddenKeys) {
    assert(
      lines.length === 0,
      `${relativePath} contourne les tokens avec ${key} (lignes ${lines.join(", ")})`,
    );
  }
  assert(
    hardCodedFonts.length === 0,
    `${relativePath} référence une fonte applicative en dur (lignes ${hardCodedFonts.join(", ")})`,
  );
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function findVariableInitializer(parsed, variableName) {
  let found = null;
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer
    ) {
      found = unwrapExpression(node.initializer);
      return;
    }
    if (!found) ts.forEachChild(node, visit);
  };
  visit(parsed);
  return found;
}

function objectPropertyMap(objectLiteral) {
  const result = new Map();
  if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) return result;
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
    const name = propertyNameText(property.name);
    if (name) result.set(name, property);
  }
  return result;
}

function numericValue(node) {
  const expression = unwrapExpression(node);
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (
    ts.isPrefixUnaryExpression(expression) &&
    (expression.operator === ts.SyntaxKind.MinusToken ||
      expression.operator === ts.SyntaxKind.PlusToken) &&
    ts.isNumericLiteral(expression.operand)
  ) {
    const value = Number(expression.operand.text);
    return expression.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }
  return null;
}

function validateTypographyTokens() {
  const themePath = "constants/theme.ts";
  const parsed = parseSource(themePath);
  const typography = findVariableInitializer(parsed, "AppTypography");
  assert(ts.isObjectLiteralExpression(typography), "AppTypography doit rester un objet de tokens statique");
  if (!typography || !ts.isObjectLiteralExpression(typography)) return;

  const tokens = objectPropertyMap(typography);
  const requiredVariants = [
    "display",
    "screenTitle",
    "featureTitle",
    "sectionTitle",
    "body",
    "button",
    "caption",
    "symbol",
    "koreanPrimary",
    "koreanSecondary",
  ];
  for (const variant of requiredVariants) {
    assert(tokens.has(variant), `AppTypography.${variant} est requis`);
  }

  const requiredFields = [
    "fontRole",
    "script",
    "fontSize",
    "lineHeight",
    "letterSpacing",
    "textTransform",
  ];
  for (const [variant, property] of tokens) {
    if (!ts.isPropertyAssignment(property)) continue;
    const token = objectPropertyMap(unwrapExpression(property.initializer));
    for (const field of requiredFields) {
      assert(token.has(field), `AppTypography.${variant}.${field} est absent`);
    }
    const fontSizeProperty = token.get("fontSize");
    const lineHeightProperty = token.get("lineHeight");
    if (
      fontSizeProperty &&
      lineHeightProperty &&
      ts.isPropertyAssignment(fontSizeProperty) &&
      ts.isPropertyAssignment(lineHeightProperty)
    ) {
      const fontSize = numericValue(fontSizeProperty.initializer);
      const lineHeight = numericValue(lineHeightProperty.initializer);
      assert(fontSize !== null && fontSize > 0, `AppTypography.${variant}.fontSize doit être positif`);
      assert(
        lineHeight !== null && fontSize !== null && lineHeight >= fontSize,
        `AppTypography.${variant}.lineHeight doit être explicite et >= fontSize`,
      );
    }
  }

  const contracts = findVariableInitializer(parsed, "AppTextLineContracts");
  const contractMap = objectPropertyMap(contracts);
  for (const contract of ["fluid", "singleLine", "twoLines", "threeLines"]) {
    assert(contractMap.has(contract), `AppTextLineContracts.${contract} est requis`);
  }
  return new Set(contractMap.keys());
}

function jsxAttribute(openingElement, attributeName) {
  return openingElement.attributes.properties.find(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === attributeName,
  );
}

function staticJsxAttributeValue(attribute) {
  if (!attribute?.initializer) return true;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer.expression &&
    (ts.isStringLiteral(attribute.initializer.expression) ||
      ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression))
  ) {
    return attribute.initializer.expression.text;
  }
  return null;
}

const hangulPattern = /[\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff]/u;
const latinPattern = /[A-Za-zÀ-ÖØ-öø-ÿ]/u;
const koreanExpressionPattern = /(?:^|[._])(?:kr|ko|korean|hangul)(?:$|[A-Z_]|\b)/u;
const latinExpressionPattern =
  /(?:^|[._])(?:fr|french|roman|romanization|meaning|translation)(?:$|[A-Z_]|\b)/u;

function contentChildren(node) {
  return ts.isJsxElement(node) ? node.children : [];
}

function literalTextWithin(node) {
  let text = "";

  const collectExpressionLiterals = (expression) => {
    if (
      ts.isStringLiteral(expression) ||
      ts.isNoSubstitutionTemplateLiteral(expression) ||
      ts.isTemplateHead(expression) ||
      ts.isTemplateMiddle(expression) ||
      ts.isTemplateTail(expression)
    ) {
      text += expression.text;
    }
    ts.forEachChild(expression, collectExpressionLiterals);
  };

  const collectChildren = (children) => {
    for (const child of children) {
      if (ts.isJsxText(child)) {
        text += child.text;
      } else if (ts.isJsxExpression(child) && child.expression) {
        collectExpressionLiterals(child.expression);
      } else if (ts.isJsxElement(child)) {
        collectChildren(child.children);
      }
    }
  };

  collectChildren(contentChildren(node));
  return text;
}

function expressionTextWithin(node, parsed) {
  const parts = [];

  const collectChildren = (children) => {
    for (const child of children) {
      if (ts.isJsxExpression(child) && child.expression) {
        parts.push(child.expression.getText(parsed));
      } else if (ts.isJsxElement(child)) {
        collectChildren(child.children);
      }
    }
  };

  collectChildren(contentChildren(node));
  return parts.join(" ");
}

function validateAppTextUsage(relativePath, knownLineContracts, counters) {
  if (!relativePath.endsWith(".tsx") && !relativePath.endsWith(".jsx")) return;
  const parsed = parseSource(relativePath);

  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const tag = jsxTagText(opening.tagName);
      if (
        tag === "AppText" ||
        tag === "AnimatedAppText" ||
        tag === "AppMixedText"
      ) {
        counters.appTextElements += 1;
        if (tag === "AppMixedText") counters.mixedTextElements += 1;

        for (const legacyProp of ["numberOfLines", "ellipsizeMode"]) {
          const legacyAttribute = jsxAttribute(opening, legacyProp);
          assert(
            !legacyAttribute,
            `${relativePath}:${lineNumber(parsed, legacyAttribute ?? opening)} utilise ${legacyProp}; employer lineContract`,
          );
        }

        const contractAttribute = jsxAttribute(opening, "lineContract");
        if (contractAttribute) {
          counters.lineContracts += 1;
          const value = staticJsxAttributeValue(contractAttribute);
          assert(
            typeof value === "string" && knownLineContracts.has(value),
            `${relativePath}:${lineNumber(parsed, contractAttribute)} a un lineContract non statique ou inconnu`,
          );
        }

        if ((tag === "AppText" || tag === "AnimatedAppText") && ts.isJsxElement(node)) {
          const literal = literalTextWithin(node);
          const expressions = expressionTextWithin(node, parsed);
          const hasKorean = hangulPattern.test(literal) || koreanExpressionPattern.test(expressions);
          const hasLatin = latinPattern.test(literal) || latinExpressionPattern.test(expressions);
          assert(
            !(hasKorean && hasLatin),
            `${relativePath}:${lineNumber(parsed, opening)} mélange latin/coréen dans AppText; employer AppMixedText`,
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
}

function routeUsesAppText(routeFile) {
  const dependencies = collectLocalDependencyGraph([routeFile]);
  return dependencies.has("components/app-text.tsx");
}

function normalizeRouteReference(route) {
  if (route === "/(tabs)") return "/";
  return route.replace(/^\/\(tabs\)(?=\/)/, "");
}

function validateRouteReferences(activeFiles) {
  const activePaths = new Set(activeRoutes.map(([route]) => route));
  activePaths.delete("entry:/");
  const prototypePaths = new Set(prototypeRoutes.map(([route]) => route));
  const compatibilityPaths = new Set(compatibilityRoutes.map(([route]) => route));
  const allPaths = new Set([...activePaths, ...prototypePaths, ...compatibilityPaths]);
  const referencesToActive = new Map([...activePaths].map((route) => [route, []]));
  const usedPrototypeExceptions = new Set();

  for (const relativePath of activeFiles) {
    const isNonNavigationMetadata = nonNavigationRouteReferenceFiles.has(relativePath);
    const parsed = parseSource(relativePath);
    const visit = (node) => {
      if (
        (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        /^\/(?:\([^/]+\)(?:\/|$)|[A-Za-z])/.test(node.text)
      ) {
        const route = normalizeRouteReference(node.text);
        assert(
          allPaths.has(route),
          `${relativePath}:${lineNumber(parsed, node)} référence une route non cataloguée ${node.text}`,
        );

        if (!isNonNavigationMetadata && activePaths.has(route)) {
          referencesToActive.get(route).push(relativePath);
        }

        if (!isNonNavigationMetadata && prototypePaths.has(route)) {
          const exceptionKey = `${relativePath}::${route}`;
          const exceptionReason = prototypeReferenceExceptions.get(exceptionKey);
          assert(
            Boolean(exceptionReason),
            `${relativePath}:${lineNumber(parsed, node)} relie le graphe actif au prototype ${route}`,
          );
          if (exceptionReason) usedPrototypeExceptions.add(exceptionKey);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(parsed);
  }

  for (const [route, references] of referencesToActive) {
    if (route === "/") continue;
    assert(references.length > 0, `${route} est déclarée active mais n'a aucune référence entrante`);
  }
  for (const exceptionKey of prototypeReferenceExceptions.keys()) {
    assert(
      usedPrototypeExceptions.has(exceptionKey),
      `L'exception de référence prototype ${exceptionKey} est devenue inutile`,
    );
  }
}

function validateAppTextImplementation() {
  const appTextPath = "components/app-text.tsx";
  assert(fs.existsSync(absolutePath(appTextPath)), `${appTextPath} est absent`);
  if (!fs.existsSync(absolutePath(appTextPath))) return;
  const source = read(appTextPath);

  assert(
    /includeFontPadding:\s*false/.test(source),
    "AppText doit neutraliser includeFontPadding sur ses lignes tokenisées",
  );
  assert(source.includes("AppTypography"), "AppText doit résoudre ses métriques via AppTypography");
  assert(source.includes("AppTextLineContracts"), "AppText doit résoudre les contrats lineContract");
  assert(
    !source.includes("typographyOverride"),
    "AppText ne doit plus exposer de contournement des tokens typographiques",
  );
  const parsed = parseSource(appTextPath);
  const protectedKeysNode = findVariableInitializer(
    parsed,
    "PROTECTED_TYPOGRAPHY_STYLE_KEYS",
  );
  const declaredProtectedKeys = new Set(
    protectedKeysNode && ts.isArrayLiteralExpression(protectedKeysNode)
      ? protectedKeysNode.elements
          .filter((element) => ts.isStringLiteral(element))
          .map((element) => element.text)
      : [],
  );
  for (const key of protectedTypographyKeys) {
    assert(
      declaredProtectedKeys.has(key),
      `AppText ne protège pas ${key} contre les overrides accidentels`,
    );
  }
  for (const key of declaredProtectedKeys) {
    assert(
      protectedTypographyKeys.includes(key),
      `AppText protège la clé inattendue ${key}; mettre à jour le contrat validate:ui`,
    );
  }
  assert(
    /delete\s+sanitizedStyle\[key\]/.test(source),
    "sanitizeTextStyle doit retirer chaque clé typographique protégée",
  );
  assert(
    /safeStyle\s*=\s*sanitizeTextStyle\(style\)/.test(source),
    "AppText doit assainir style avant de le transmettre au Text natif",
  );
  assert(
    /safeSegmentStyle\s*=\s*sanitizeTextStyle\(segment\.style\)/.test(source),
    "AppMixedText doit assainir les styles de ses segments",
  );
  assert(
    source.includes("renderScriptAwareChildren") &&
      source.includes("KOREAN_CHARACTER_PATTERN"),
    "AppText doit conserver Noto Sans KR pour les runs Hangul dynamiques",
  );

  let implementationStyle = null;
  let restSpreadIndex = -1;
  let linePropsSpreadIndex = -1;
  const visit = (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      jsxTagText(node.tagName) === "Text"
    ) {
      const style = jsxAttribute(node, "style");
      if (style?.initializer && ts.isJsxExpression(style.initializer)) {
        const styleText = style.initializer.expression?.getText(parsed) ?? "";
        if (styleText.includes("baseStyle") && styleText.includes("safeStyle")) {
          implementationStyle = styleText;
          node.attributes.properties.forEach((attribute, index) => {
            if (!ts.isJsxSpreadAttribute(attribute)) return;
            const spreadText = attribute.expression.getText(parsed);
            if (spreadText === "rest") restSpreadIndex = index;
            if (spreadText === "lineProps") linePropsSpreadIndex = index;
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  assert(
    implementationStyle !== null,
    "AppText doit appliquer son style sûr après son style tokenisé",
  );
  assert(
    restSpreadIndex >= 0 && linePropsSpreadIndex > restSpreadIndex,
    "AppText doit appliquer lineContract après les props résiduelles",
  );
}

function validateRegisteredFonts() {
  const rootLayoutSource = read("app/_layout.tsx");
  const themeSource = read("constants/theme.ts");
  const requiredFonts = [
    "Outfit_300Light",
    "Outfit_400Regular",
    "Outfit_500Medium",
    "Outfit_600SemiBold",
    "Outfit_700Bold",
    "Outfit_900Black",
    "NotoSansKR_400Regular",
    "NotoSansKR_700Bold",
  ];
  for (const font of requiredFonts) {
    assert(rootLayoutSource.includes(font), `app/_layout.tsx n'enregistre pas ${font}`);
  }
  assert(
    rootLayoutSource.includes("EXPO_PUBLIC_FORCE_FONT_FALLBACK"),
    "Le scénario de repli de fontes doit rester simulable",
  );
  assert(
    /<AppTextProvider\s+customFontsAvailable=/.test(rootLayoutSource),
    "Le layout racine doit transmettre l'état réel des fontes à AppTextProvider",
  );
  assert(
    themeSource.includes("AppFontFamily.fallback.korean") &&
      themeSource.includes("AppFontFamily.fallback.sans"),
    "resolveAppFontFamily doit distinguer les fallbacks latin et coréen",
  );
}

validateRouteCatalogue();

const appConfig = JSON.parse(read("app.json"));
assert(
  appConfig.expo?.orientation === "default",
  'app.json doit autoriser portrait et paysage avec orientation="default"',
);

validateAppTextImplementation();
validateRegisteredFonts();
const knownLineContracts = validateTypographyTokens() ?? new Set();

const activeEntryFiles = [
  ...activeRoutes.map(([, file]) => file),
  ...infrastructureEntries,
];
const activeDependencyGraph = collectLocalDependencyGraph(activeEntryFiles);
const allRouteFiles = Object.values(routeGroups).flatMap((routes) =>
  routes.map(([, file]) => file),
);
const completeUiDependencyGraph = collectLocalDependencyGraph([
  ...allRouteFiles,
  ...infrastructureEntries,
]);

const typographyRouteExceptions = new Map([
  [
    "app/listen/teacherIA.tsx",
    "alias de redirection pur sans interface rendue",
  ],
]);

validateRouteReferences(activeDependencyGraph);

for (const [lifecycle, routes] of Object.entries(routeGroups)) {
  for (const [route, file] of routes) {
    assert(
      typographyRouteExceptions.has(file) || routeUsesAppText(file),
      `${lifecycle} ${route} -> ${file} ne passe pas par AppText`,
    );
  }
}

const counters = {
  appTextElements: 0,
  lineContracts: 0,
  mixedTextElements: 0,
};
for (const file of [...completeUiDependencyGraph].sort()) {
  validateNoNativeText(file);
  validateNoDirectTypography(file);
  validateAppTextUsage(file, knownLineContracts, counters);
}

assert(counters.appTextElements > 0, "Le graphe UI actif n'utilise aucun AppText");
assert(
  counters.lineContracts > 0,
  "lineContract est défini mais jamais utilisé explicitement dans le graphe UI actif",
);
assert(
  counters.mixedTextElements > 0,
  "AppMixedText est défini mais jamais utilisé dans le graphe UI actif",
);

const speakSource = read("app/(tabs)/speak.tsx");
assert(
  !/["']\/lesson\/shopping(?:IA)?["']/.test(speakSource),
  "Le hub Speak contient encore une route Shopping inexistante",
);
assert(
  /textRoute:\s*["']\/lesson\/magasin["']/.test(speakSource),
  "Le mémo Shopping doit pointer vers /lesson/magasin",
);

const rootLayoutSource = read("app/_layout.tsx");
for (const [prototypeRoute] of prototypeRoutes) {
  const coveredByPrefix =
    (prototypeRoute.startsWith("/classificateur/") &&
      rootLayoutSource.includes('"/classificateur"')) ||
    (prototypeRoute.startsWith("/immersion/") &&
      rootLayoutSource.includes('"/immersion"'));
  assert(
    coveredByPrefix || rootLayoutSource.includes(JSON.stringify(prototypeRoute)),
    `${prototypeRoute} n'est pas masquée par le garde de release`,
  );
}

for (const removedRoute of ["app/(tabs)/explore.tsx", "app/modal.tsx"]) {
  assert(
    !fs.existsSync(absolutePath(removedRoute)),
    `${removedRoute} est une route de démonstration qui doit rester supprimée`,
  );
}

if (errors.length) {
  console.error("Contrats UI invalides:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(
    `\nPérimètre contrôlé: ${activeRoutes.length} routes actives, ` +
      `${prototypeRoutes.length} prototypes, ${compatibilityRoutes.length} alias, ` +
      `${completeUiDependencyGraph.size} fichiers dans le graphe UI complet.`,
  );
  process.exit(1);
}

console.log(
  `Contrats UI valides: ${activeRoutes.length} routes actives, ` +
    `${prototypeRoutes.length} prototypes, ${compatibilityRoutes.length} alias, ` +
    `${completeUiDependencyGraph.size} fichiers UI/dépendances, ` +
    `${counters.lineContracts} lineContract et ${counters.mixedTextElements} AppMixedText.`,
);
