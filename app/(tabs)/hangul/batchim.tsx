import React from "react";

import { HangulLessonScreen } from "../../../components/hangul/HangulLessonScreen";
import { getHangulModule } from "../../../data/hangul/curriculum";
import { applyHangulEditorialOverrides } from "../../../data/hangul/editorialOverrides";

applyHangulEditorialOverrides();

// Keep the quiz audio aligned with the displayed target: 갑, not the visible 감 card behind the quiz sheet.
const cvcPQuestion = getHangulModule("hangul_batchim")
  .scenes.flatMap((scene) => scene.questions)
  .find((question) => question.id === "cvc-p");

if (cvcPQuestion) cvcPQuestion.audio = "갑";

export default function BatchimScreen() {
  return <HangulLessonScreen moduleId="hangul_batchim" />;
}
