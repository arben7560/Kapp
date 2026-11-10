import "./i18n-node-loader.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { createAppI18n } = await import("../lib/i18n/instance.ts");
const { resolveAccountText, resolveAccountError } = await import("../lib/i18n/accountText.ts");
const { validateCataloguePair } = await import("../lib/i18n/catalogValidation.ts");
const { resources } = await import("../locales/index.ts");
const { toKappAuthError, validateEmail, validatePassword } = await import("../lib/authErrors.ts");

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const frenchAccount = JSON.parse(read("../locales/fr/account.json"));
const japaneseAccount = JSON.parse(read("../locales/ja/account.json"));
const instance = createAppI18n("ja");
const translate = (source) => resolveAccountText(source, "ja", instance);

test("Account keeps the pre-existing semantic language settings and aligned FR/JA catalogues", () => {
  assert.equal(japaneseAccount.language.title, "アプリの言語");
  assert.equal(japaneseAccount.language.saveError, "言語設定を保存できませんでした。もう一度お試しください。");
  assert.deepEqual(Object.keys(japaneseAccount.copy).sort(), Object.keys(frenchAccount.copy).sort());
  assert.deepEqual(validateCataloguePair(resources.fr.account, resources.ja.account), []);
  assert.ok(Object.values(frenchAccount.copy).reduce((sum, section) => sum + Object.keys(section).length, 0) >= 150);
  for (const [sectionName, values] of Object.entries(frenchAccount.copy)) {
    assert.deepEqual(Object.keys(values).sort(), Object.keys(japaneseAccount.copy[sectionName]).sort());
    for (const [id, french] of Object.entries(values)) {
      assert.equal(id, encodeURIComponent(french).replaceAll(".", "%2E"), "Malformed copy ID for " + french);
      assert.equal(translate(french), japaneseAccount.copy[sectionName][id], sectionName + ": " + french);
      assert.equal(resolveAccountText(french, "fr", instance), french, "French changed: " + french);
      assert.ok(japaneseAccount.copy[sectionName][id].trim(), "Empty Japanese copy: " + french);
    }
  }
});

test("Account page, callback and auth prompt are attached to Japanese display localization", () => {
  const account = read("../app/account/index.tsx");
  const callback = read("../app/account/callback.tsx");
  const home = read("../app/(tabs)/index.tsx");
  assert.match(account, /<AccountLocalizationProvider>/u);
  assert.match(callback, /<AccountLocalizationProvider>/u);
  assert.match(account, /AccountActionButton as ActionButton/u);
  assert.match(callback, /AccountActionButton as ActionButton/u);
  assert.match(account, /formatSyncDate\(sync\.lastSyncedAt, locale\)/u);
  assert.match(account, /locale === "ja" \? "ja-JP" : "fr-FR"/u);
  assert.match(account, /accessibilityLabel=\{translate\(dialogTitle\)\}/u);
  assert.match(account, /accessibilityLabel=\{translate\("Tester l'écran de sélection de langue"\)\}/u);
  assert.match(home, /translate\("Protégez votre progression"\)/u);
  assert.match(home, /translate\("Protéger maintenant"\)/u);
  assert.match(home, /translate\("Me le rappeler plus tard"\)/u);
  assert.equal(JSON.parse(read("../locales/ja/common.json")).language.title, "表示言語を選択");
});

test("Every plain French AppText and input label on Account has a Japanese entry", () => {
  const account = read("../app/account/index.tsx");
  const literal = /<AppText\b[^>]*>\s*([^<{][^<{}]*?)\s*<\/AppText>/gu;
  const candidates = [...account.matchAll(literal)]
    .map((match) => match[1].replace(/\s+/gu, " ").trim())
    .filter((value) => value.length > 3 && /[A-Za-zÀ-ÿ]/u.test(value));
  for (const source of candidates) {
    assert.notEqual(translate(source), source, "Untranslated account body: " + source);
  }
  assert.ok(candidates.length >= 20, "Account content extraction changed");
  const props = /(?:placeholder|label|accessibilityLabel)="([^"]+)"/gu;
  const labels = [...account.matchAll(props)]
    .map((match) => match[1])
    .filter((value) => /[A-Za-zÀ-ÿ]/u.test(value) && value !== "email");
  for (const label of labels) {
    assert.notEqual(translate(label), label, "Untranslated account input/label: " + label);
  }
  assert.ok(labels.length >= 12, "Form label extraction changed");
});

test("Sign-in, recovery, OTP confirmation, statuses and account deletion use situational Japanese", () => {
  for (const [source, expected] of [
    ["Continuer avec Google", "Googleで続ける"],
    ["Créer un compte avec mon email", "メールアドレスでアカウントを作成"],
    ["J’ai déjà un compte", "すでにアカウントをお持ちの方"],
    ["Répétez le mot de passe", "パスワードをもう一度入力してください"],
    ["Afficher le mot de passe", "パスワードを表示する"],
    ["Confirmez votre email", "メールアドレスを確認してください"],
    ["Email envoyé. Ouvrez le lien sur cet appareil pour choisir un nouveau mot de passe.", "メールを送信しました。この端末でリンクを開き、新しいパスワードを設定してください。"],
    ["Se déconnecter ?", "ログアウトしますか？"],
    ["Supprimer définitivement le compte ?", "アカウントを完全に削除しますか？"],
    ["Supprimer le compte n’annule pas automatiquement un abonnement App Store ou Google Play.", "アカウントを削除しても、App StoreやGoogle Playのサブスクリプションは自動的には解約されません。"],
    ["La progression locale sera synchronisée au retour du réseau.", "ネットワーク接続が回復すると、端末内の学習進捗が同期されます。"],
    ["Lien non validé", "リンクを確認できませんでした"],
    ["K-App sécurise votre session puis ouvre Mon profil.", "K-Appがセッションを保護し、アカウント画面を開きます。"],
  ]) {
    assert.equal(translate(source), expected);
  }
  assert.equal(
    translate("Un lien a été envoyé à test@example.com."),
    "test@example.com に確認用リンクを送信しました。",
  );
  assert.equal(resolveAccountText("  Compte protégé  ", "ja", instance), "  保護されたアカウント  ");
  assert.equal(resolveAccountText("Google", "ja", instance), "Google", "Provider brand must stay unchanged");
});

test("Authentication and sync errors are localized without altering their canonical error codes", () => {
  const missing = toKappAuthError({ code: "invalid_credentials", message: "Invalid login credentials" });
  assert.equal(missing.code, "invalid-credentials");
  assert.equal(translate(missing.message), "メールアドレスまたはパスワードが正しくありません。");
  assert.throws(() => validateEmail("invalide"), { message: "Saisissez une adresse email valide." });
  assert.throws(() => validatePassword("abc"), { message: "Le mot de passe doit contenir au moins 8 caractères." });
  assert.equal(translate("Les deux mots de passe ne correspondent pas."), "入力されたパスワードが一致しません。");
  assert.equal(translate("Trop de tentatives rapprochées. Patientez quelques minutes avant de réessayer."), "短時間に操作が繰り返されました。数分待ってからもう一度お試しください。");
  assert.equal(translate("La sauvegarde cloud n’a pas abouti. Votre progression locale reste intacte."), "クラウドへの保存に失敗しました。端末内の学習進捗は保持されています。");
  assert.equal(
    resolveAccountError("Unmapped provider failure", "ja", instance),
    "操作を完了できませんでした。しばらくしてからもう一度お試しください。",
  );
  assert.equal(resolveAccountError("Une erreur étrangère", "fr", instance), "Une erreur étrangère");
});

test("Native confirmation alerts and raw service errors never bypass Japanese UI translation", () => {
  const account = read("../app/account/index.tsx");
  const callback = read("../app/account/callback.tsx");
  const expectedTranslatedAlertCopy = [
    "Se déconnecter ?",
    "K-App synchronisera d’abord les modifications en attente, puis créera une nouvelle session invitée sur cet appareil.",
    "Supprimer définitivement le compte ?",
    "La progression cloud et le compte seront supprimés. Cette action n’annule pas un abonnement App Store ou Google Play.",
    "Déconnexion effectuée",
    "Suppression impossible",
    "Annuler",
  ];
  for (const source of expectedTranslatedAlertCopy) {
    assert.ok(account.includes('translate("' + source + '")'), "Unlocalized native alert: " + source);
  }
  assert.match(account, /\{localizeError\(auth\.error\)\}/u);
  assert.match(account, /\{localizeError\(sync\.errorMessage\)\}/u);
  assert.match(account, /\{localizeError\(paywall\.error\.message\)\}/u);
  assert.match(account, /friendlyError\(caught\)/u);
  assert.match(callback, /resolveAccountError\(error, locale, i18n\)/u);
});
