import argparse
import json
import re
import sqlite3
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path


PACKAGE = "com.arben60.kapp"
STORE_KEY = "@k_app/pedagogical_progress_v1"
ROOT = Path(__file__).resolve().parent
DEVICE_XML = "/sdcard/kapp-hangul-window.xml"
PIXEL6 = (1080, 2400, 420)
COMPACT = (720, 1280, 320)  # 360 x 640 dp
S23_ULTRA = (1440, 3088, 600)  # 384 x 824 dp
SCREEN_WIDTH, SCREEN_HEIGHT = PIXEL6[:2]

sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def log(message):
    print(time.strftime("%H:%M:%S"), message, flush=True)


def adb(*args, timeout=40, check=True, input_bytes=None):
    return subprocess.run(
        ["adb", *map(str, args)],
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        input=input_bytes,
    )


def shell(*args, timeout=40, check=True):
    return adb("shell", *args, timeout=timeout, check=check)


def tap(x, y):
    shell("input", "tap", int(x), int(y), timeout=10)
    time.sleep(0.35)


def swipe_up():
    x = SCREEN_WIDTH // 2
    shell("input", "swipe", x, int(SCREEN_HEIGHT * 0.84), x, int(SCREEN_HEIGHT * 0.22), 220, timeout=10)
    time.sleep(0.25)


def swipe_up_small():
    x = SCREEN_WIDTH // 2
    shell("input", "swipe", x, int(SCREEN_HEIGHT * 0.81), x, int(SCREEN_HEIGHT * 0.47), 220, timeout=10)
    time.sleep(0.25)


def swipe_down():
    x = SCREEN_WIDTH // 2
    shell("input", "swipe", x, int(SCREEN_HEIGHT * 0.22), x, int(SCREEN_HEIGHT * 0.86), 180, timeout=10)
    time.sleep(0.2)


def scroll_top(count=4):
    for _ in range(count):
        swipe_down()


def bounds(node):
    values = [int(value) for value in re.findall(r"\d+", node.attrib.get("bounds", ""))]
    if len(values) != 4:
        return None
    x1, y1, x2, y2 = values
    if x2 <= x1 or y2 <= y1:
        return None
    return x1, y1, x2, y2


def center(node):
    x1, y1, x2, y2 = bounds(node)
    return (x1 + x2) // 2, (y1 + y2) // 2


def visible(node, width=None, height=None):
    width = width or SCREEN_WIDTH
    height = height or SCREEN_HEIGHT
    value = bounds(node)
    if not value:
        return False
    x1, y1, x2, y2 = value
    return x2 > 0 and y2 > 70 and x1 < width and y1 < height - 40


def dump_ui():
    last_output = ""
    for _ in range(4):
        shell("rm", "-f", DEVICE_XML, timeout=10, check=False)
        result = shell(
            "uiautomator",
            "dump",
            "--compressed",
            DEVICE_XML,
            timeout=35,
            check=False,
        )
        last_output = result.stdout.decode("utf-8", "replace")
        raw = adb("exec-out", "cat", DEVICE_XML, timeout=10, check=False).stdout
        if raw.lstrip().startswith(b"<?xml"):
            return ET.fromstring(raw.decode("utf-8"))
        time.sleep(0.8)
    raise RuntimeError(last_output or "UI hierarchy unavailable")


def nodes(root):
    return list(root.iter("node"))


def node_label(node):
    return node.attrib.get("content-desc") or node.attrib.get("text") or ""


def find_nodes(root, *, exact=None, contains=None, clickable=None, enabled=None, only_visible=True):
    matches = []
    for node in nodes(root):
        label = node_label(node)
        if exact is not None and label != exact:
            continue
        if contains is not None and contains not in label:
            continue
        if clickable is not None and (node.attrib.get("clickable") == "true") != clickable:
            continue
        if enabled is not None and (node.attrib.get("enabled") == "true") != enabled:
            continue
        if only_visible and not visible(node):
            continue
        matches.append(node)
    return matches


def click_desc(label, scroll=True, attempts=7):
    for attempt in range(attempts):
        root = dump_ui()
        matches = find_nodes(root, exact=label, clickable=True, enabled=True)
        if matches:
            tap(*center(matches[0]))
            return root
        text_matches = find_nodes(root, exact=label)
        if text_matches:
            tap(*center(text_matches[0]))
            return root
        if not scroll:
            break
        swipe_up_small()
    raise RuntimeError(f"Clickable label not found: {label!r}")


def screenshot(name):
    remote = f"/sdcard/{name}.png"
    local = ROOT / f"{name}.png"
    shell("screencap", "-p", remote, timeout=15)
    adb("pull", remote, str(local), timeout=20)
    log(f"screenshot {local.name}")


def read_db_bytes():
    return adb("exec-out", "run-as", PACKAGE, "cat", "databases/RKStorage", timeout=15).stdout


def read_store():
    raw = read_db_bytes()
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as handle:
        path = Path(handle.name)
        handle.write(raw)
    try:
        connection = sqlite3.connect(path)
        row = connection.execute(
            "select value from catalystLocalStorage where key = ?", (STORE_KEY,)
        ).fetchone()
        connection.close()
        return json.loads(row[0])
    finally:
        path.unlink(missing_ok=True)


def write_store(updated):
    raw = read_db_bytes()
    backup = ROOT / f"before-hangul-only-reset-{time.strftime('%H%M%S')}.db"
    backup.write_bytes(raw)
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as handle:
        path = Path(handle.name)
        handle.write(raw)
    try:
        connection = sqlite3.connect(path)
        connection.execute(
            "update catalystLocalStorage set value = ? where key = ?",
            (json.dumps(updated, ensure_ascii=False, separators=(",", ":")), STORE_KEY),
        )
        connection.commit()
        connection.close()
        replacement = path.read_bytes()
        command = f"run-as {PACKAGE} sh -c 'cat > databases/RKStorage'"
        adb("shell", command, timeout=20, input_bytes=replacement)
        log(f"base backed up as {backup.name}; Hangul-only state reset")
    finally:
        path.unlink(missing_ok=True)


def reset_hangul_only():
    shell("am", "force-stop", PACKAGE, timeout=10)
    store = read_store()
    before_completed = len(store.get("completed", {}))
    store["completed"] = {
        key: value for key, value in store.get("completed", {}).items()
        if not key.startswith("hangul_")
    }
    store["hangulLevel"] = 1
    store["hangulProgress"] = {"lessons": {}, "masteredCharacters": {}}
    write_store(store)
    verify = read_store()
    assert not any(key.startswith("hangul_") for key in verify.get("completed", {}))
    assert verify["hangulProgress"] == {"lessons": {}, "masteredCharacters": {}}
    assert len(verify.get("completed", {})) <= before_completed
    shell("am", "start", "-W", "-a", "android.intent.action.VIEW", "-d",
          "kapp://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082", PACKAGE,
          timeout=45)
    time.sleep(12)
    shell("settings", "put", "global", "window_animation_scale", 0)
    shell("settings", "put", "global", "transition_animation_scale", 0)
    shell("settings", "put", "global", "animator_duration_scale", 0)
    screenshot("fresh-hangul-after-metro-restart")


def lesson_state(store):
    lessons = store.get("hangulProgress", {}).get("lessons", {})
    for module_id, lesson in lessons.items():
        if module_id.startswith("hangul_") and lesson.get("currentSceneId"):
            return module_id, lesson
    return None, None


def active_lesson():
    store = read_store()
    active = []
    for module_id, lesson in store.get("hangulProgress", {}).get("lessons", {}).items():
        if lesson.get("activeQuiz"):
            active.append((module_id, lesson))
    if active:
        return store, active[0][0], active[0][1]
    # The last updated module is the one whose current scene is on screen.
    lessons = store.get("hangulProgress", {}).get("lessons", {})
    if lessons:
        module_id = list(lessons)[-1]
        return store, module_id, lessons[module_id]
    return store, "hangul_vowels_basic", {
        "currentSceneId": "blocks", "discovered": {}, "completedScenes": {},
        "masteredScenes": {}, "scores": {}, "errorsByCharacter": {}
    }


def discover_scene():
    scroll_top(5)
    root = dump_ui()
    count_nodes = [node_label(node) for node in nodes(root) if re.fullmatch(r"\d+/\d+", node_label(node))]
    if not count_nodes:
        raise RuntimeError("Discovery counter not found")
    discovered_count, expected_count = map(int, count_nodes[-1].split("/"))
    _, _, initial_lesson = active_lesson()
    baseline_total = len(initial_lesson.get("discovered", {}))
    target_total = baseline_total + (expected_count - discovered_count)
    seen = set()
    log(f"discovery begins {discovered_count}/{expected_count}")
    for _ in range(14):
        root = dump_ui()
        cards = []
        for node in find_nodes(root, contains="🔊", clickable=True, enabled=True):
            label = node_label(node)
            if "RÉÉCOUTER" in label:
                continue
            identity = label.split(", 🔊", 1)[0]
            if identity not in seen:
                cards.append((node, identity))
        # Bottom-to-top avoids shifting untouched cards when explanations appear.
        for node, identity in sorted(cards, key=lambda item: center(item[0])[1], reverse=True):
            tap(*center(node))
            seen.add(identity)
            log(f"audio/card opened: {identity}")
        store, module_id, lesson = active_lesson()
        scene_id = lesson.get("currentSceneId")
        actual_total = len(lesson.get("discovered", {}))
        # Card IDs are lesson-global; reaching the total delta proves every card in
        # this fresh scene was actually pressed, including already-opened resume state.
        if actual_total >= target_total:
            break
        swipe_up_small()
    for _ in range(8):
        root = dump_ui()
        starts = [node for node in nodes(root)
                  if node.attrib.get("clickable") == "true"
                  and node.attrib.get("enabled") == "true"
                  and any(label in node_label(node) for label in (
                      "COMMENCER L’ÉTAPE",
                      "RECOMMENCER L’ÉTAPE",
                  ))
                  and visible(node)]
        if starts:
            tap(*center(starts[0]))
            time.sleep(1)
            return expected_count
        swipe_up()
    raise RuntimeError("Quiz start button not reached")


def set_profile(profile):
    global SCREEN_WIDTH, SCREEN_HEIGHT
    width, height, density = profile
    shell("wm", "size", f"{width}x{height}")
    shell("wm", "density", density)
    SCREEN_WIDTH, SCREEN_HEIGHT = width, height
    time.sleep(1.5)


def sync_screen_profile():
    global SCREEN_WIDTH, SCREEN_HEIGHT
    output = shell("wm", "size", timeout=10).stdout.decode("utf-8", "replace")
    sizes = re.findall(r"(\d+)x(\d+)", output)
    if sizes:
        SCREEN_WIDTH, SCREEN_HEIGHT = map(int, sizes[-1])
    log(f"active display pixels: {SCREEN_WIDTH}x{SCREEN_HEIGHT}")


def inspect_seven_choice_layout(question):
    log("seven-choice Batchim checkpoint: compact 360 x 640")
    set_profile(COMPACT)
    scroll_top(5)
    union = set()
    for index in range(5):
        root = dump_ui()
        for option in question["options"]:
            if find_nodes(root, exact=option["label"], clickable=True, enabled=True):
                union.add(option["value"])
        screenshot(f"batchim-7-compact-360x640-{index + 1}")
        if len(union) == 7:
            break
        swipe_up()
    if len(union) != 7:
        raise AssertionError(f"360x640 exposes only {len(union)}/7 choices")
    log("360x640: 7/7 choices reachable; panel scroll confirmed")

    for profile, name in [(PIXEL6, "pixel6"), (S23_ULTRA, "s23-ultra")]:
        set_profile(profile)
        scroll_top(5)
        union = set()
        for _ in range(4):
            root = dump_ui()
            for option in question["options"]:
                if find_nodes(root, exact=option["label"], clickable=True, enabled=True):
                    union.add(option["value"])
            if len(union) == 7:
                break
            swipe_up()
        screenshot(f"batchim-7-{name}")
        if len(union) != 7:
            raise AssertionError(f"{name} exposes only {len(union)}/7 choices")
        log(f"{name}: 7/7 choices reachable")
    set_profile(COMPACT)


def find_and_tap_option(question, selected):
    label = selected["label"]
    scroll_top(5)
    for _ in range(7):
        root = dump_ui()
        if selected.get("audio"):
            audio_nodes = find_nodes(root, exact=f"🔊 {label}", clickable=True, enabled=True)
            if not audio_nodes:
                audio_nodes = find_nodes(root, contains=label, clickable=True, enabled=True)
            if audio_nodes:
                audio_node = audio_nodes[0]
                tap(*center(audio_node))
                choose_nodes = find_nodes(root, exact="CHOISIR", clickable=True, enabled=True)
                if not choose_nodes:
                    choose_nodes = find_nodes(root, exact="CHOISIR", enabled=True)
                target_y = center(audio_node)[1]
                choose = min(choose_nodes, key=lambda node: abs(center(node)[1] - target_y))
                tap(*center(choose))
                return
        else:
            matches = find_nodes(root, exact=label, clickable=True, enabled=True)
            if matches:
                tap(*center(matches[0]))
                return
        swipe_up()
    raise RuntimeError(f"Option not reachable: {label!r} for {question['id']}")


def verify_feedback_and_continue(question, expected_correct, checkpoint=None):
    for _ in range(7):
        root = dump_ui()
        labels = [node_label(node) for node in nodes(root)]
        if expected_correct:
            feedback_ok = any(label == "Bonne lecture" for label in labels)
        else:
            correct_label = next(option["label"] for option in question["options"] if option["value"] == question["answer"])
            feedback_ok = any(label == f"Bonne réponse : {correct_label}" for label in labels)
        continues = [
            node
            for label in ("SUIVANT", "TERMINER")
            for node in find_nodes(root, exact=label, clickable=True, enabled=True)
        ]
        if feedback_ok and continues:
            if checkpoint:
                screenshot(checkpoint)
            tap(*center(continues[0]))
            time.sleep(0.5)
            return
        swipe_up()
    raise AssertionError(f"Feedback or Continue missing for {question['id']}")


def quiz_session():
    store, module_id, lesson = active_lesson()
    session = lesson.get("activeQuiz")
    if not session:
        return store, module_id, lesson, None
    return store, module_id, lesson, session


def complete_quiz(intentional_error=False, seen_types=None):
    seen_types = seen_types if seen_types is not None else set()
    store, module_id, lesson, session = quiz_session()
    if not session:
        raise RuntimeError("Persisted active quiz not found")
    scene_id = session["sceneId"]
    scene_types = {question["type"] for question in session["questions"][:session["originalQuestionCount"]]}
    new_types = scene_types - seen_types
    error_needed = intentional_error and bool(new_types)
    seven_error_planned = module_id == "hangul_batchim" and any(len(q["options"]) > 4 for q in session["questions"])
    current_saved = session["questions"][session["questionIndex"]]
    error_used = bool(session.get("retrySourceIds")) or (
        session.get("answered") is not None and session.get("answered") != current_saved["answer"]
    )
    feedback_checked = False
    index = session["questionIndex"]
    log(f"quiz {module_id}/{scene_id}: {session['originalQuestionCount']} original questions; new types={sorted(new_types)}")

    while True:
        store, current_module, lesson, current_session = quiz_session()
        if current_session is None:
            break
        index = current_session["questionIndex"]
        question = current_session["questions"][index]
        is_retry = question["id"].endswith("__retry")
        should_error = False
        if error_needed and not error_used and not is_retry:
            if seven_error_planned:
                should_error = len(question["options"]) > 4
            else:
                should_error = question["type"] in new_types

        if module_id == "hangul_batchim" and question["id"] == "cvc-t" and not is_retry and current_session.get("answered") is None:
            inspect_seven_choice_layout(question)

        if module_id == "hangul_batchim" and question["id"] == "cvc-t__retry":
            set_profile(COMPACT)

        resumed_answer = current_session.get("answered")
        if resumed_answer is None:
            if should_error:
                selected = next(option for option in question["options"] if option["value"] != question["answer"])
                error_used = True
            else:
                selected = next(option for option in question["options"] if option["value"] == question["answer"])
            find_and_tap_option(question, selected)
            answer_is_correct = not should_error
        else:
            answer_is_correct = resumed_answer == question["answer"]
            should_error = not answer_is_correct
            log(f"resuming persisted feedback for {question['id']}")
        checkpoint = None
        if should_error:
            checkpoint = f"{module_id}-{scene_id}-{question['id']}-wrong-feedback"
        elif not feedback_checked:
            checkpoint = f"{module_id}-{scene_id}-correct-feedback"
        if module_id == "hangul_batchim" and question["id"] == "cvc-t__retry":
            checkpoint = "batchim-7-compact-360x640-correct-retry-feedback"
        verify_feedback_and_continue(question, answer_is_correct, checkpoint)
        feedback_checked = True
        log(f"answered {index + 1}: {question['id']} ({'wrong by design' if should_error else 'correct'})")

    seen_types.update(scene_types)
    if module_id == "hangul_batchim":
        set_profile(PIXEL6)
    scroll_top(3)
    root = dump_ui()
    labels = [node_label(node) for node in nodes(root)]
    mastered = any("LECTURE RÉUSSIE" == label for label in labels)
    completed = any("ÉTAPE TERMINÉE" == label for label in labels)
    if not (mastered or completed):
        raise AssertionError(f"No result status visible for {module_id}/{scene_id}")
    score_labels = [label for label in labels if re.fullmatch(r"\d+/\d+", label)]
    screenshot(f"result-{module_id}-{scene_id}-{'mastered' if mastered else 'completed'}")
    log(f"result {module_id}/{scene_id}: {score_labels[-1] if score_labels else '?'} {'mastered' if mastered else 'completed'}")
    if mastered:
        click_desc("SUIVANT" if any(label == "SUIVANT" for label in labels) else "TERMINER", scroll=True)
    else:
        click_desc("REVOIR L’ÉTAPE", scroll=True)
    time.sleep(0.8)
    return mastered, scene_id


def start_existing_scene_quiz():
    for _ in range(8):
        root = dump_ui()
        starts = [node for node in nodes(root)
                  if node.attrib.get("clickable") == "true" and node.attrib.get("enabled") == "true"
                  and any(label in node_label(node) for label in (
                      "COMMENCER L’ÉTAPE",
                      "RECOMMENCER L’ÉTAPE",
                  ))
                  and visible(node)]
        if starts:
            tap(*center(starts[0]))
            time.sleep(1)
            return
        swipe_up()
    raise RuntimeError("Could not restart scene quiz")


def move_to_next_module():
    for _ in range(8):
        root = dump_ui()
        candidates = [node for node in nodes(root)
                      if node.attrib.get("clickable") == "true" and node.attrib.get("enabled") == "true"
                      and "Toutes les étapes sont terminées" in node_label(node)
                      and visible(node)]
        if candidates:
            log(f"module continuation: {node_label(candidates[0])}")
            tap(*center(candidates[0]))
            time.sleep(1.5)
            scroll_top(5)
            return
        swipe_up()
    raise RuntimeError("Next-module card not found")


def run_curriculum(max_scenes=None):
    # The first sequence is run separately as a harness check and already
    # validates these three exercise families before the remaining 16 scenes.
    seen_types = set()
    completed_scenes = 0
    modules_completed_before = set()
    while completed_scenes < (max_scenes or 17):
        store, module_id, lesson = active_lesson()
        scene_id = lesson.get("currentSceneId") or "blocks"
        log(f"BEGIN SCENE {completed_scenes + 1}: {module_id}/{scene_id}")
        screenshot(f"scene-{completed_scenes + 1:02d}-{module_id}-{scene_id}-top")

        _, _, _, existing_session = quiz_session()
        if existing_session:
            expected_cards = "resumed-all"
            log(f"resuming active quiz at question {existing_session['questionIndex'] + 1}")
        else:
            expected_cards = discover_scene()
            time.sleep(0.8)
        mastered, finished_scene = complete_quiz(intentional_error=True, seen_types=seen_types)
        if not mastered:
            log(f"{module_id}/{finished_scene}: completed but below mastery, replaying fully correct")
            start_existing_scene_quiz()
            mastered, _ = complete_quiz(intentional_error=False, seen_types=seen_types)
            if not mastered:
                raise AssertionError(f"Scene still not mastered after perfect replay: {module_id}/{finished_scene}")

        store = read_store()
        matching_lessons = [
            (saved_module_id, saved_lesson)
            for saved_module_id, saved_lesson in store["hangulProgress"]["lessons"].items()
            if finished_scene in saved_lesson.get("scores", {})
        ]
        if not matching_lessons:
            raise AssertionError(f"Persisted score missing for {finished_scene}")
        module_id, current_lesson = matching_lessons[-1]
        saved_score = current_lesson["scores"][finished_scene]
        assert current_lesson["completedScenes"].get(finished_scene)
        assert current_lesson["masteredScenes"].get(finished_scene)
        log(f"PERSISTED {module_id}/{finished_scene}: cards={expected_cards}, score={saved_score}")
        completed_scenes += 1

        module_now_completed = store.get("completed", {}).get(module_id, False)
        current_scene = current_lesson.get("currentSceneId")
        if module_now_completed and module_id not in modules_completed_before:
            modules_completed_before.add(module_id)
            log(f"MODULE UNLOCKED/COMPLETED: {module_id}")
            if completed_scenes < (max_scenes or 17):
                move_to_next_module()

    report = read_store()
    (ROOT / "real-17-sequence-progress.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log(f"CURRICULUM FINISHED: {completed_scenes} scenes")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["reset", "run"])
    parser.add_argument("--max-scenes", type=int)
    args = parser.parse_args()
    if args.command == "reset":
        reset_hangul_only()
    else:
        sync_screen_profile()
        run_curriculum(args.max_scenes)


if __name__ == "__main__":
    main()
