"""ADB-driven responsive QA helpers for K-App.

This script intentionally drives the installed Android dev client instead of
rendering web snapshots. Generated evidence is written below
artifacts/responsive-v2 and is not used by the application at runtime.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


PACKAGE = "com.arben60.kapp"
ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "responsive-v2"
DEVICE_XML = "/sdcard/kapp-responsive-v2.xml"


@dataclass(frozen=True)
class Profile:
    width: int
    height: int
    density: int
    rotation: int = 0

    @property
    def logical_size(self) -> tuple[int, int]:
        width = round(self.width * 160 / self.density)
        height = round(self.height * 160 / self.density)
        return (height, width) if self.rotation % 2 else (width, height)


PROFILES = {
    "small-320x700": Profile(640, 1400, 320),
    "compact-360x800": Profile(720, 1600, 320),
    "reference-390x844": Profile(780, 1688, 320),
    "large-430x932": Profile(860, 1864, 320),
    "phone-landscape-844x390": Profile(390, 844, 160, rotation=1),
    "tablet-portrait-800x1280": Profile(800, 1280, 160),
    "tablet-landscape-1280x800": Profile(800, 1280, 160, rotation=1),
}

MATRIX_ROUTES = [
    # The tabs home is reached through the onboarding CTA and is captured
    # separately; the public root route intentionally redirects here.
    "/onboarding",
    "/hangul",
    "/hangul/vowels-basic",
    "/hangul/consonants-basic",
    "/hangul/vowels-compound",
    "/hangul/consonants-tense",
    "/hangul/batchim",
    "/hangul/assessment",
    "/hangul/bridge",
    "/grammar",
    "/grammar/sentence-structure",
    "/grammar/range-and-limit",
    "/grammar/a1-validation",
    "/voc",
    "/voc/gastronomie",
    "/voc/basics",
    "/voc/transport",
    "/voc/kdrama",
    "/voc/romance",
    "/voc/nuit",
    "/voc/sante",
    "/voc/work",
    "/voc/emotion",
    "/voc/famille",
    "/voc/health",
    "/voc/lieux",
    "/voc/meteo",
    "/voc/objets",
    "/voc/voyage",
    "/comptage",
    "/comptage/base",
    "/comptage/sino",
    "/comptage/heures",
    "/comptage/prix",
    "/comptage/phone",
    "/comptage/dates",
    "/comptage/age",
    "/comptage/ordinals",
    "/listen",
    "/speak",
    "/lesson/cafe",
    "/lesson/metro",
    "/lesson/restaurant",
    "/lesson/airport",
    "/lesson/magasin",
    "/review",
    "/profile",
    "/streak",
    "/premium",
    "/assimilation",
    "/classificateur",
    "/classificateur/animals",
    "/classificateur/drinks",
    "/classificateur/machines",
    "/classificateur/objects",
    "/classificateur/paper",
    "/classificateur/people",
    "/listen/CafeListen",
    "/listen/MetroListen",
    "/listen/RestaurantListen",
    "/listen/index-quiz",
    "/lesson/health",
    "/lesson/help",
    "/lesson/hotel",
    "/lesson/late",
    "/lesson/taxi",
]

GRAMMAR_STAGE_ROUTES = [
    f"/grammar/{stage_id}"
    for stage_id in (
        "sentence-structure", "identify-with-copula", "polite-register",
        "introduce-topic", "demonstratives", "nominal-questions", "existence",
        "locate-thing", "present-actions", "object-actions", "action-location",
        "destination-and-time", "possession", "information-questions",
        "simple-negation", "request-item", "request-quantity",
        "sino-number-contexts", "coordinate-items", "choose-alternative",
        "request-action", "polite-instructions", "direction-and-means",
        "express-desire", "express-ability", "ask-permission",
        "express-inability", "add-item", "limit-request", "range-and-limit",
        "past-event", "future-plan", "decision-and-promise", "link-actions",
        "give-reason", "mark-contrast", "simple-condition",
        "necessity-and-obligation", "simple-comparison", "make-suggestion",
        "a1-validation",
    )
]


def log(message: str) -> None:
    print(time.strftime("%H:%M:%S"), message, flush=True)


def adb(*args: object, timeout: int = 40, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        ["adb", *map(str, args)],
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
    )


def shell(*args: object, timeout: int = 40, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return adb("shell", *args, timeout=timeout, check=check)


def safe_name(value: str) -> str:
    normalized = value.strip("/") or "home"
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", normalized)


def set_profile(profile_name: str) -> Profile:
    profile = PROFILES[profile_name]
    # Return to the device's natural orientation before changing the override.
    shell("settings", "put", "system", "accelerometer_rotation", 0)
    shell("settings", "put", "system", "user_rotation", 0)
    shell("wm", "size", f"{profile.width}x{profile.height}")
    shell("wm", "density", profile.density)
    if profile.rotation:
        shell("settings", "put", "system", "user_rotation", profile.rotation)
    time.sleep(5)
    log(f"profile {profile_name}: {profile.logical_size[0]}x{profile.logical_size[1]} dp")
    return profile


def open_route(route: str, wait: float = 5.0) -> None:
    path = route if route.startswith("/") else f"/{route}"
    uri = f"kapp://{path}"
    result = shell(
        "am",
        "start",
        "-W",
        "-a",
        "android.intent.action.VIEW",
        "-d",
        uri,
        PACKAGE,
        timeout=45,
        check=False,
    )
    if result.returncode:
        raise RuntimeError(result.stdout.decode("utf-8", "replace"))
    time.sleep(wait)
    log(f"opened {route}")


def screenshot(name: str) -> Path:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    path = ARTIFACTS / f"{name}.png"
    path.write_bytes(adb("exec-out", "screencap", "-p", timeout=25).stdout)
    log(f"screenshot {path.name}")
    return path


def dump_ui(name: str | None = None) -> tuple[ET.Element, Path | None]:
    raw = b""
    last_output = ""
    for _ in range(2):
        shell("rm", "-f", DEVICE_XML, timeout=10, check=False)
        result = shell("uiautomator", "dump", "--compressed", DEVICE_XML, timeout=35, check=False)
        last_output = result.stdout.decode("utf-8", "replace")
        if result.returncode == 0:
            raw = adb("exec-out", "cat", DEVICE_XML, timeout=15, check=False).stdout
            if raw.lstrip().startswith(b"<?xml"):
                break
        time.sleep(1)
    if not raw.lstrip().startswith(b"<?xml"):
        raise RuntimeError(last_output or "UI hierarchy unavailable")
    saved = None
    if name:
        ARTIFACTS.mkdir(parents=True, exist_ok=True)
        saved = ARTIFACTS / f"{name}.xml"
        saved.write_bytes(raw)
    return ET.fromstring(raw.decode("utf-8")), saved


def bounds(node: ET.Element) -> tuple[int, int, int, int] | None:
    values = [int(value) for value in re.findall(r"-?\d+", node.attrib.get("bounds", ""))]
    if len(values) != 4:
        return None
    x1, y1, x2, y2 = values
    return (x1, y1, x2, y2) if x2 > x1 and y2 > y1 else None


def node_label(node: ET.Element) -> str:
    return node.attrib.get("content-desc") or node.attrib.get("text") or ""


def tap_label(label: str, contains: bool = False, attempts: int = 5) -> None:
    for _ in range(attempts):
        root, _ = dump_ui()
        matches = []
        for node in root.iter("node"):
            value = node_label(node)
            if (contains and label in value) or (not contains and label == value):
                value_bounds = bounds(node)
                if value_bounds:
                    matches.append((node, value_bounds))
        if matches:
            clickable = [match for match in matches if match[0].attrib.get("clickable") == "true"]
            _, (x1, y1, x2, y2) = (clickable or matches)[0]
            shell("input", "tap", (x1 + x2) // 2, (y1 + y2) // 2, timeout=10)
            time.sleep(2)
            log(f"tapped {label!r}")
            return
        swipe_up()
    raise RuntimeError(f"label not reachable: {label!r}")


def swipe_up(duration: int = 450) -> None:
    size = shell("wm", "size", timeout=10).stdout.decode("utf-8", "replace")
    matches = re.findall(r"(\d+)x(\d+)", size)
    width, height = map(int, matches[-1])
    # wm reports the natural override; swap when the surface is rotated.
    rotation = shell("dumpsys", "input", timeout=15).stdout.decode("utf-8", "replace")
    if "SurfaceOrientation: 1" in rotation or "SurfaceOrientation: 3" in rotation:
        width, height = height, width
    shell(
        "input",
        "swipe",
        width // 2,
        int(height * 0.78),
        width // 2,
        int(height * 0.28),
        duration,
        timeout=12,
    )
    time.sleep(1)


def analyze_tree(root: ET.Element, density: int, screen_width: int, screen_height: int) -> dict[str, object]:
    overflow = []
    small_targets = []
    visible_text = []
    for node in root.iter("node"):
        value_bounds = bounds(node)
        if not value_bounds:
            continue
        x1, y1, x2, y2 = value_bounds
        label = node_label(node)
        intersects = x2 > 0 and y2 > 0 and x1 < screen_width and y1 < screen_height
        if label and intersects:
            visible_text.append(label)
        if label and (x1 < 0 or x2 > screen_width or y1 < 0 or y2 > screen_height):
            overflow.append({"label": label, "bounds": value_bounds})
        if node.attrib.get("clickable") == "true" and intersects:
            width_dp = (x2 - x1) * 160 / density
            height_dp = (y2 - y1) * 160 / density
            if width_dp < 44 or height_dp < 44:
                small_targets.append(
                    {
                        "label": label,
                        "bounds": value_bounds,
                        "sizeDp": [round(width_dp, 1), round(height_dp, 1)],
                    }
                )
    return {
        "visibleLabels": visible_text,
        "overflow": overflow,
        "smallTouchTargets": small_targets,
    }


def capture_state(prefix: str, profile: Profile, with_tree: bool = True) -> dict[str, object]:
    path = screenshot(prefix)
    result: dict[str, object] = {"screenshot": str(path.relative_to(ROOT))}
    if not with_tree:
        return result
    try:
        root, xml_path = dump_ui(prefix)
    except (RuntimeError, ET.ParseError) as error:
        result["treeError"] = str(error)
        return result
    screen_width, screen_height = profile.width, profile.height
    if profile.rotation % 2:
        screen_width, screen_height = screen_height, screen_width
    result["tree"] = str(xml_path.relative_to(ROOT)) if xml_path else None
    result.update(analyze_tree(root, profile.density, screen_width, screen_height))
    return result


def audit_route(profile_name: str, route: str, swipes: int = 3) -> dict[str, object]:
    profile = set_profile(profile_name)
    open_route(route)
    # A deep link to the current Expo Router screen may reuse its ScrollView.
    # Normalize the starting position so "top" evidence is never stale.
    for _ in range(4):
        fast_swipe_down(profile)
    prefix = f"{profile_name}__{safe_name(route)}"
    record: dict[str, object] = {
        "profile": profile_name,
        "logicalSize": profile.logical_size,
        "route": route,
        "top": capture_state(f"{prefix}__top", profile),
    }
    for _ in range(swipes):
        swipe_up()
    record["bottom"] = capture_state(f"{prefix}__bottom", profile)
    report_path = ARTIFACTS / f"{prefix}.json"
    report_path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"record {report_path.name}")
    return record


def fast_swipe_up(profile: Profile) -> None:
    width, height = profile.width, profile.height
    if profile.rotation % 2:
        width, height = height, width
    shell(
        "input",
        "swipe",
        width // 2,
        int(height * 0.80),
        width // 2,
        int(height * 0.24),
        260,
        timeout=10,
    )
    time.sleep(0.2)


def fast_swipe_down(profile: Profile) -> None:
    width, height = profile.width, profile.height
    if profile.rotation % 2:
        width, height = height, width
    shell(
        "input",
        "swipe",
        width // 2,
        int(height * 0.24),
        width // 2,
        int(height * 0.80),
        180,
        timeout=10,
    )
    time.sleep(0.15)


def audit_matrix(profile_name: str, start: int, count: int) -> None:
    profile = set_profile(profile_name)
    selected_routes = MATRIX_ROUTES[start : start + count]
    records = []
    for index, route in enumerate(selected_routes, start=start):
        try:
            open_route(route, wait=2.5)
            # Expo Router can reuse a mounted screen from its native stack.
            # Always return its primary scroller to the beginning before the
            # top-state proof, then traverse toward the last item.
            for _ in range(4):
                fast_swipe_down(profile)
            prefix = f"matrix__{profile_name}__{index:02d}__{safe_name(route)}"
            top = screenshot(f"{prefix}__top")
            for _ in range(3):
                fast_swipe_up(profile)
            bottom = screenshot(f"{prefix}__bottom")
            record = {
                "index": index,
                "profile": profile_name,
                "logicalSize": profile.logical_size,
                "route": route,
                "top": str(top.relative_to(ROOT)),
                "bottom": str(bottom.relative_to(ROOT)),
            }
        except Exception as error:  # Keep the rest of a batch auditable.
            record = {
                "index": index,
                "profile": profile_name,
                "logicalSize": profile.logical_size,
                "route": route,
                "error": repr(error),
            }
        records.append(record)
        log(json.dumps(record, ensure_ascii=False))
    batch_path = ARTIFACTS / f"matrix__{profile_name}__{start:02d}-{start + len(selected_routes) - 1:02d}.json"
    batch_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


def audit_grammar_matrix(profile_name: str) -> None:
    profile = set_profile(profile_name)
    records = []
    for index, route in enumerate(GRAMMAR_STAGE_ROUTES, start=1):
        try:
            open_route(route, wait=1.5)
            for _ in range(4):
                fast_swipe_down(profile)
            prefix = f"grammar-sweep__{profile_name}__{index:02d}__{safe_name(route)}"
            top = screenshot(f"{prefix}__top")
            for _ in range(3):
                fast_swipe_up(profile)
            bottom = screenshot(f"{prefix}__bottom")
            record = {
                "index": index,
                "profile": profile_name,
                "logicalSize": profile.logical_size,
                "route": route,
                "top": str(top.relative_to(ROOT)),
                "bottom": str(bottom.relative_to(ROOT)),
            }
        except Exception as error:
            record = {
                "index": index,
                "profile": profile_name,
                "logicalSize": profile.logical_size,
                "route": route,
                "error": repr(error),
            }
        records.append(record)
        log(json.dumps(record, ensure_ascii=False))
    batch_path = ARTIFACTS / f"grammar-sweep__{profile_name}.json"
    batch_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    profile_parser = subparsers.add_parser("profile")
    profile_parser.add_argument("name", choices=PROFILES)

    route_parser = subparsers.add_parser("route")
    route_parser.add_argument("profile", choices=PROFILES)
    route_parser.add_argument("route")
    route_parser.add_argument("--swipes", type=int, default=3)

    open_parser = subparsers.add_parser("open")
    open_parser.add_argument("route")

    click_parser = subparsers.add_parser("click")
    click_parser.add_argument("label")
    click_parser.add_argument("--contains", action="store_true")

    capture_parser = subparsers.add_parser("capture")
    capture_parser.add_argument("profile", choices=PROFILES)
    capture_parser.add_argument("name")

    matrix_parser = subparsers.add_parser("matrix")
    matrix_parser.add_argument("profile", choices=PROFILES)
    matrix_parser.add_argument("--start", type=int, default=0)
    matrix_parser.add_argument("--count", type=int, default=len(MATRIX_ROUTES))

    grammar_matrix_parser = subparsers.add_parser("grammar-matrix")
    grammar_matrix_parser.add_argument("profile", choices=PROFILES)

    args = parser.parse_args()
    if args.command == "profile":
        set_profile(args.name)
    elif args.command == "route":
        audit_route(args.profile, args.route, args.swipes)
    elif args.command == "open":
        open_route(args.route)
    elif args.command == "click":
        tap_label(args.label, args.contains)
    elif args.command == "capture":
        profile = PROFILES[args.profile]
        record = capture_state(args.name, profile)
        print(json.dumps(record, ensure_ascii=False, indent=2))
    elif args.command == "matrix":
        audit_matrix(args.profile, args.start, args.count)
    elif args.command == "grammar-matrix":
        audit_grammar_matrix(args.profile)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.stderr.write(error.stdout.decode("utf-8", "replace"))
        raise
