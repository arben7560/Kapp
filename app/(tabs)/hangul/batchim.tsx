import React from "react";

import { HangulLessonScreen } from "../../../components/hangul/HangulLessonScreen";
import { applyHangulEditorialOverrides } from "../../../data/hangul/editorialOverrides";

applyHangulEditorialOverrides();

export default function BatchimScreen() {
  return <HangulLessonScreen moduleId="hangul_batchim" />;
}
