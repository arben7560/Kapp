import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import { transformSync } from "@babel/core";
import { patchAnimatedPropsSource } from "./patch-react-native-animated.cjs";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../node_modules/react-native/Libraries/Animated/nodes/AnimatedProps.js", import.meta.url), "utf8");
// Recreate the released 0.88.1 method if Metro/postinstall already applied the fix.
const released = source.replace(/    if \(this\.__isNative && this\._target != null\) \{\r?\n      this\.#disconnectAnimatedView\(this\._target\);\r?\n    \}\r?\n(?=    const target = \(this\._target =)/u, "");
const fixed = patchAnimatedPropsSource(released, "0.88.1");

function nativeProps(code) {
  const operations = [];
  const connections = new Map();
  class AnimatedNode {
    __getNativeTag() { return 42; }
    __getPlatformConfig() { return undefined; }
    __setPlatformConfig() {}
    __attach() {}
    __detach() {}
  }
  const mocks = {
    "../../../src/private/animated/NativeAnimatedHelper": { API: {
      connectAnimatedNodeToView(node, view) {
        assert.ok(!connections.has(node), `Animated node ${node} is already attached to a view: ${connections.get(node)}`);
        connections.set(node, view); operations.push(["connect", node, view]);
      },
      disconnectAnimatedNodeFromView(node, view) {
        assert.equal(connections.get(node), view);
        connections.delete(node); operations.push(["disconnect", node, view]);
      },
    } },
    "../../../src/private/featureflags/ReactNativeFeatureFlags": { cxxNativeAnimatedEnabled: () => false },
    "../../ReactNative/FabricUIManager": {},
    "../../ReactNative/RendererProxy": { findNodeHandle: (view) => view.tag },
    "../../ReactPrivate/ReactNativePrivateInterface": {},
    "../../StyleSheet/flattenStyle": (style) => style,
    "../AnimatedEvent": { AnimatedEvent: class {} },
    "./AnimatedNode": AnimatedNode,
    "./AnimatedObject": { from: () => null },
    "./AnimatedStyle": { from: () => null },
    invariant: require("invariant"),
  };
  const { code: compiled } = transformSync(code, {
    configFile: false, babelrc: false,
    plugins: ["babel-plugin-syntax-hermes-parser", ["@babel/plugin-transform-flow-strip-types", { all: true, allowDeclareFields: true }], "@babel/plugin-transform-modules-commonjs"],
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", compiled)((name) => {
    assert.ok(name in mocks, `Unexpected AnimatedProps import: ${name}`);
    return mocks[name];
  }, module, module.exports);
  return { props: new module.exports.default({}, () => {}), operations, connections };
}

test("released RN 0.88.1 reproduces Android's double attachment failure", () => {
  const { props } = nativeProps(released);
  props.setNativeView({ tag: 11 }); props.__makeNative();
  assert.throws(() => props.setNativeView({ tag: 22 }), /Animated node 42 is already attached to a view: 11/u);
});

test("real patched AnimatedProps disconnects before reconnecting and cleans up the final view", () => {
  const { props, operations, connections } = nativeProps(fixed);
  const replacement = { tag: 22 };
  props.setNativeView({ tag: 11 }); props.__makeNative();
  props.setNativeView(replacement); props.setNativeView(replacement);
  props.__detach(); props.__detach();
  assert.deepEqual(operations, [["connect", 42, 11], ["disconnect", 42, 11], ["connect", 42, 22], ["disconnect", 42, 22]]);
  assert.equal(connections.size, 0);
});

test("switching views before starting the native driver attaches only the latest view", () => {
  const { props, operations } = nativeProps(fixed);
  props.setNativeView({ tag: 11 }); props.setNativeView({ tag: 22 });
  assert.deepEqual(operations, []);
  props.__makeNative(); props.__detach();
  assert.deepEqual(operations, [["connect", 42, 22], ["disconnect", 42, 22]]);
});

test("the backport is idempotent, preserves line endings and rejects unreviewed dependency changes", () => {
  assert.equal(patchAnimatedPropsSource(fixed, "0.88.1"), fixed);
  const crlf = released.replace(/\r?\n/gu, "\r\n");
  assert.equal(patchAnimatedPropsSource(crlf, "0.88.1").replaceAll("\r\n", "\n"), fixed.replaceAll("\r\n", "\n"));
  assert.throws(() => patchAnimatedPropsSource(released, "0.89.0"), /Review/u);
  assert.throws(() => patchAnimatedPropsSource("unexpected source", "0.88.1"), /has changed/u);
});
