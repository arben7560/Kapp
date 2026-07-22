"""Drive real Hangul assessment failure and success states on Android.

The first Hangul lesson is completed through the UI before this helper runs.
For this isolated responsive QA pass, the remaining module completion flags are
seeded in AsyncStorage so the final assessment can be exercised without
altering application logic or curriculum content.
"""

from __future__ import annotations

import importlib.util
import re
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HARNESS_PATH = ROOT / "artifacts" / "hangul-e2e" / "run_device_validation.py"
SPEC = importlib.util.spec_from_file_location("hangul_device_harness", HARNESS_PATH)
assert SPEC and SPEC.loader
harness = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(harness)

MODULE_IDS = (
    "hangul_vowels_basic",
    "hangul_consonants_basic",
    "hangul_consonants_tense",
    "hangul_vowels_compound",
    "hangul_batchim",
)


def assessment_choices() -> list[tuple[str, list[str]]]:
    source = (ROOT / "data" / "hangul" / "assessment.ts").read_text(encoding="utf-8")
    choices: list[tuple[str, list[str]]] = []
    for block in re.findall(r"\{\s*id: \"assessment-.*?\n\s*\},", source, re.S):
        answer = re.search(r'answer: "([^"]+)"', block)
        option_section = re.search(r"options: \[(.*?)\],\s*answer:", block, re.S)
        if not answer or not option_section:
            raise RuntimeError("Unable to parse assessment question")
        options = re.findall(r'o\("([^"]+)"', option_section.group(1))
        choices.append((answer.group(1), options))
    if len(choices) != 12:
        raise RuntimeError(f"Expected 12 assessment questions, found {len(choices)}")
    return choices


def seed_prerequisites() -> None:
    harness.shell("am", "force-stop", harness.PACKAGE, timeout=10)
    store = harness.read_store()
    completed = dict(store.get("completed", {}))
    for module_id in MODULE_IDS:
        completed[module_id] = True
    store["completed"] = completed
    store["hangulLevel"] = 5
    harness.write_store(store)
    verified = harness.read_store()
    assert all(verified["completed"].get(module_id) for module_id in MODULE_IDS)

    harness.shell(
        "am", "start", "-W", "-a", "android.intent.action.VIEW", "-d",
        "exp+k-app://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082",
        harness.PACKAGE,
        timeout=45,
    )
    time.sleep(12)
    harness.shell(
        "am", "start", "-W", "-a", "android.intent.action.VIEW", "-d",
        "kapp:///hangul/assessment", harness.PACKAGE, timeout=45,
    )
    time.sleep(6)


def run_attempt(correct: bool, attempt_name: str) -> None:
    harness.click_desc(
        "Commencer sans aide latine" if attempt_name == "failure" else "RECOMMENCER L’ÉVALUATION",
        scroll=True,
    )
    time.sleep(1)
    for index, (answer, options) in enumerate(assessment_choices(), start=1):
        selected = answer if correct else next(option for option in options if option != answer)
        harness.click_desc(selected, scroll=True)
        time.sleep(0.3)
        if index in (1, 12):
            harness.screenshot(f"assessment-{attempt_name}-feedback-{index:02d}")
        harness.click_desc("SUIVANT" if index < 12 else "TERMINER", scroll=True)
        time.sleep(0.45)
    harness.scroll_top(4)
    harness.screenshot(f"assessment-{attempt_name}-result")


def main() -> None:
    seed_prerequisites()
    harness.sync_screen_profile()
    run_attempt(correct=False, attempt_name="failure")
    run_attempt(correct=True, attempt_name="success")
    store = harness.read_store()
    assessment = store["hangulProgress"].get("assessment")
    assert assessment and assessment["attempts"] >= 2
    assert assessment["passed"] is True
    assert assessment["bestScore"] == 12
    print(f"ASSESSMENT PERSISTED: {assessment}", flush=True)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
