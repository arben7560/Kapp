import React from "react";

import { HangulLessonScreen } from "../../../components/hangul/HangulLessonScreen";
import { applyHangulEditorialOverrides } from "../../../data/hangul/editorialOverrides";

applyHangulEditorialOverrides();

export default function ConsonantsBasicScreen() {
  return <HangulLessonScreen moduleId="hangul_consonants_basic" />;
}
