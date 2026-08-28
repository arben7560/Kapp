import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const isLocalExtensionlessImport =
        error?.code === "ERR_MODULE_NOT_FOUND" &&
        /^\.{1,2}\//.test(specifier) &&
        !/\.[a-z]+$/i.test(specifier);
      if (isLocalExtensionlessImport) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

const { matchAeroportSpeechIntent } = await import(
  "../lib/aeroportSpeechIntents.ts"
);

const route = {
  id: "choice_ask_seoul_station",
  label: "Demander le trajet vers Seoul Station",
  korean: "서울역까지 어떻게 가요?",
  nextNodeId: "ia_transport",
};
const trainChoice = {
  id: "choice_which_train",
  label: "Demander quel train choisir",
  korean: "어느 열차를 타는 게 좋을까요?",
  nextNodeId: "ia_recommend",
};
const platform = {
  id: "choice_platform",
  label: "Demander où prendre le train",
  korean: "플랫폼은 어디예요?",
  nextNodeId: "ia_platform",
};
const repeat = {
  id: "repeat_recommend",
  label: "Demander de répéter",
  korean: "다시 한번 말씀해 주세요.",
  nextNodeId: "ia_recommend_repeat",
};

test("l’intention trajet accepte les formulations méthode/chemin sans exiger la phrase modèle", () => {
  for (const transcript of [
    "서울역 가는 방법이 뭐예요?",
    "서울역 가는 방법 좀 알려 주세요.",
    "서울역 가는 법이 뭐예요?",
    "서울역 가는 법 좀 알려 주세요.",
  ]) {
    const result = matchAeroportSpeechIntent(transcript, [route]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, route.id, transcript);
    assert.equal(result.interpretedIntent, "route", transcript);
    assert.equal(result.understoodWithCorrection, false, transcript);
  }
});

test("la recherche de l’AREX accepte plusieurs demandes de localisation ancrées", () => {
  for (const transcript of [
    "안녕하세요. 공항철도는 어디예요?",
    "AREX 어디 있어요?",
    "공항철도 타려면 어디로 가야 해요?",
    "공항철도 위치 좀 알려 주세요.",
  ]) {
    const result = matchAeroportSpeechIntent(transcript, [route]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "contextual-interpretation", transcript);
    assert.equal(result.choice?.id, route.id, transcript);
  }
});

test("le mot 공항철도 seul ne suffit plus à fabriquer une demande de trajet", () => {
  for (const transcript of [
    "공항철도가 좋아요?",
    "공항철도 맞아요?",
    "공항철도요.",
  ]) {
    const result = matchAeroportSpeechIntent(transcript, [route]);
    assert.notEqual(result.reason, "matched", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("une simple localisation de Seoul Station reste distincte d’une demande de trajet", () => {
  for (const transcript of [
    "서울역 어디예요?",
    "서울역 위치 알려 주세요.",
  ]) {
    const result = matchAeroportSpeechIntent(transcript, [route]);
    assert.equal(result.reason, "needs-help", transcript);
    assert.equal(result.category, "incomplete", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("les fins déclaratives ne sont plus prises pour une question de quai", () => {
  for (const transcript of [
    "플랫폼 좋아요.",
    "승강장 맞아요.",
  ]) {
    const result = matchAeroportSpeechIntent(transcript, [platform, repeat]);
    assert.notEqual(result.reason, "matched", transcript);
    assert.equal(result.choice, null, transcript);
  }
});

test("les intentions voisines restent séparées après l’élargissement du trajet", () => {
  const train = matchAeroportSpeechIntent("어떤 열차가 좋아요?", [trainChoice, repeat]);
  assert.equal(train.reason, "matched");
  assert.equal(train.choice?.id, trainChoice.id);

  const quay = matchAeroportSpeechIntent("어디서 타요?", [platform, repeat]);
  assert.equal(quay.reason, "matched");
  assert.equal(quay.choice?.id, platform.id);

  const wrongTurn = matchAeroportSpeechIntent("플랫폼은 어디예요?", [route]);
  assert.equal(wrongTurn.reason, "needs-help");
  assert.equal(wrongTurn.category, "out-of-scope");
  assert.equal(wrongTurn.choice, null);
});
