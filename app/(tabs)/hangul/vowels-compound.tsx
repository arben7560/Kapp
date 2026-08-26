import React from "react";

import { HangulLessonScreen } from "../../../components/hangul/HangulLessonScreen";
import { applyHangulEditorialOverrides } from "../../../data/hangul/editorialOverrides";

applyHangulEditorialOverrides();

export default function VowelsCompoundScreen() {
  return <HangulLessonScreen moduleId="hangul_vowels_compound" />;
}
