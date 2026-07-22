"""Drive real A1 grammar failure, resume, long review, and success states."""

from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HARNESS_PATH = ROOT / "artifacts" / "hangul-e2e" / "run_device_validation.py"
SPEC = importlib.util.spec_from_file_location("grammar_device_harness", HARNESS_PATH)
assert SPEC and SPEC.loader
harness = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(harness)

STAGE_ID = "a1-validation"


def open_stage() -> None:
    harness.shell(
        "am", "start", "-W", "-a", "android.intent.action.VIEW", "-d",
        f"kapp:///grammar/{STAGE_ID}", harness.PACKAGE, timeout=45,
    )
    time.sleep(5)


def active_session() -> dict:
    store = harness.read_store()
    return store["grammarProgress"]["stages"][STAGE_ID]["activeSession"]


def click_visible(label: str, attempts: int = 25) -> None:
    for _ in range(attempts):
        root = harness.dump_ui()
        matches = harness.find_nodes(root, exact=label, clickable=True, enabled=True)
        if matches:
            harness.tap(*harness.center(matches[0]))
            return
        harness.swipe_up_small()
    raise RuntimeError(f"Unable to reach {label!r}")


def capture_then_click(label: str, screenshot_name: str) -> None:
    for _ in range(12):
        root = harness.dump_ui()
        matches = harness.find_nodes(root, exact=label, clickable=True, enabled=True)
        if matches:
            harness.screenshot(screenshot_name)
            harness.tap(*harness.center(matches[0]))
            return
        harness.swipe_up_small()
    raise RuntimeError(f"Unable to capture and click {label!r}")


def answer_question(correct: bool) -> None:
    session = active_session()
    question = session["questions"][session["questionIndex"]]
    expected = question["answer"]
    if question["kind"] == "order":
        expected_tokens = list(expected)
        selected_tokens = expected_tokens if correct else list(reversed(expected_tokens))
        if selected_tokens == expected_tokens and len(selected_tokens) > 1:
            selected_tokens[0], selected_tokens[1] = selected_tokens[1], selected_tokens[0]
        for token in selected_tokens:
            click_visible(token)
        click_visible("VALIDER LA PHRASE")
    else:
        selected = expected if correct else next(
            option for option in question["options"] if option != expected
        )
        click_visible(selected)


def restart_and_resume() -> None:
    before = active_session()
    harness.shell("am", "force-stop", harness.PACKAGE, timeout=10)
    harness.shell(
        "am", "start", "-W", "-a", "android.intent.action.VIEW", "-d",
        "exp+k-app://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082",
        harness.PACKAGE, timeout=45,
    )
    time.sleep(11)
    open_stage()
    after = active_session()
    assert after["id"] == before["id"]
    assert after["questionIndex"] == before["questionIndex"]
    assert after["responses"] == before["responses"]
    harness.screenshot("grammar-a1-resumed-feedback")


def run_attempt(correct: bool, name: str) -> None:
    for index in range(5):
        answer_question(correct=correct)
        time.sleep(0.4)
        if name == "failure" and index == 0:
            harness.screenshot("grammar-a1-long-feedback")
            restart_and_resume()
        capture_then_click(
            "VOIR MON BILAN" if index == 4 else "CONTINUER",
            f"grammar-a1-{name}-feedback-{index + 1:02d}" if index in (0, 4) else f"grammar-a1-{name}-progress",
        )
        time.sleep(0.5)
    harness.scroll_top(5)
    harness.screenshot(f"grammar-a1-{name}-result-top")
    for _ in range(5):
        harness.swipe_up()
    harness.screenshot(f"grammar-a1-{name}-result-bottom")


def main() -> None:
    open_stage()
    harness.sync_screen_profile()
    harness.scroll_top(5)
    click_visible("COMMENCER LES EXERCICES")
    time.sleep(0.8)
    run_attempt(correct=False, name="failure")
    click_visible("RÉESSAYER")
    time.sleep(0.8)
    run_attempt(correct=True, name="success")
    session = active_session()
    assert session["completedAt"]
    assert session["score"] == 5
    assert len(session["responses"]) == 5
    print(
        f"GRAMMAR PERSISTED: id={session['id']} score={session['score']}/5 "
        f"responses={len(session['responses'])}",
        flush=True,
    )


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
