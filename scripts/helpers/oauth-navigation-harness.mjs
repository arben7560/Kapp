import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { StackRouter } = require("../../node_modules/expo-router/build/react-navigation/routers/StackRouter.js");
const { createInitialState } = require("../../node_modules/expo-router/build/react-navigation/core/createInitialState.js");
const { resolveNavigationDestination } = require("../../node_modules/expo-router/build/global-state/resolveNavigationDestination.js");
const { getChainFromRouteKey } = require("../../node_modules/expo-router/build/react-navigation/routers/stateKeys.js");
const { getRoutes } = require("../../node_modules/expo-router/build/getRoutes.js");
const { getReactNavigationConfig } = require("../../node_modules/expo-router/build/getReactNavigationConfig.js");
const { getStateFromPath } = require("../../node_modules/expo-router/build/fork/getStateFromPath.js");

const appDirectory = new URL("../../app/", import.meta.url);
const keys = readdirSync(appDirectory, { recursive: true }).filter((file) => /\.[tj]sx?$/u.test(file)).map((file) => `./${file.replaceAll("\\", "/")}`);
const rootSource = readFileSync(new URL("_layout.tsx", appDirectory), "utf8");
const anchor = rootSource.match(/export const unstable_settings = \{ anchor: "([^"]+)" \}/u)?.[1];
assert.ok(anchor, "The real root layout must supply its navigation anchor");
const context = Object.assign((key) => ({ default: () => null, ...(key === "./_layout.tsx" ? { unstable_settings: { anchor } } : {}) }), { keys: () => keys });
// Discover the real filesystem tree without loading native screen components.
const routeTree = getRoutes(context, { platform: "android", importMode: "sync", skipGenerated: true });
const linkingConfig = getReactNavigationConfig(routeTree);

// Installed Expo Router reducers and destination resolver; native views and
// React mounting are deliberately outside this adapter's coverage.
export function createNavigationHarness() {
  const root = routeTree;
  const tabs = root.children.find(({ route }) => route === "(tabs)");
  const router = StackRouter({});
  const config = { routeGetIdList: {}, routeParamList: {}, routeNames: [] };
  let state = createInitialState({ routeNames: root.children.map(({ route }) => route), initialRouteName: "(tabs)", parentChain: "root" });
  state.routes[0].state = createInitialState({ routeNames: tabs.children.map(({ route }) => route), initialRouteName: "index", parentChain: getChainFromRouteKey(state.routes[0].key) });
  const registry = new Map();
  const register = (current) => {
    registry.set(current.key, { reduce: (next, action) => router.getStateForAction(next, action, config) });
    current.routes.forEach((route) => { if (route.state) register(route.state); });
  };
  const target = (path) => getStateFromPath(path, linkingConfig);
  const pathname = () => {
    const names = [];
    let current = state;
    while (current) {
      const route = current.routes[current.index];
      if (!route) break;
      if (route.name === "account/index") names.push("account");
      else if (route.name !== "(tabs)" && route.name !== "index") names.push(route.name);
      current = route.state;
    }
    return `/${names.join("/")}`;
  };
  return {
    get state() { return state; }, pathname,
    push(path) {
      register(state);
      const action = resolveNavigationDestination({ targetState: target(path), navigationState: state, routeNode: root, registry, action: { type: "PUSH", payload: {} } });
      const update = (current) => {
        if (current.key === action.target) {
          const result = router.getStateForAction(current, action, config);
          assert.ok(result?.state, "Expo Router must handle the requested route");
          return result.state;
        }
        return { ...current, routes: current.routes.map((route) => route.state ? { ...route, state: update(route.state) } : route) };
      };
      state = update(state);
      assert.equal(pathname(), path === "/(tabs)" ? "/" : path);
    },
    assertModulesRemainAccessible() {
      for (const path of ["/voc", "/voc/basics", "/(tabs)", "/comptage", "/comptage/base", "/(tabs)"]) this.push(path);
    },
  };
}
