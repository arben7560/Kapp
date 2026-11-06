import assert from "node:assert/strict";
import test from "node:test";
import { getActiveNavigationRouteChain } from "../lib/navigationDiagnostics.ts";

test("diagnostics follow every active navigator even when the root index stays zero", () => {
  const module = (name) => ({
    key: "root", index: 0, routes: [{ name: "(tabs)", key: "tabs-route", state: {
      key: "tabs", index: 1, routes: [{ name: "index" }, { name, key: `${name}-route`, state: {
        key: name, index: 0, routes: [{ name: "index", key: `${name}-hub` }],
      } }],
    } }],
  });
  assert.deepEqual(getActiveNavigationRouteChain(module("voc")), [
    { navigatorKey: "root", routeIndex: 0, routeName: "(tabs)", routeKey: "tabs-route" },
    { navigatorKey: "tabs", routeIndex: 1, routeName: "voc", routeKey: "voc-route" },
    { navigatorKey: "voc", routeIndex: 0, routeName: "index", routeKey: "voc-hub" },
  ]);
  assert.equal(getActiveNavigationRouteChain(module("comptage"))[1].routeName, "comptage");
});

test("diagnostics omit params, auth credentials and inactive routes", () => {
  const snapshot = getActiveNavigationRouteChain({
    routes: [{ name: "account", params: { code: "SECRET_CODE", access_token: "SECRET_TOKEN" } }, { name: "inactive" }],
  });
  assert.deepEqual(snapshot, [{ navigatorKey: null, routeIndex: 0, routeName: "account", routeKey: null }]);
  assert.doesNotMatch(JSON.stringify(snapshot), /SECRET|inactive/u);
  assert.deepEqual(getActiveNavigationRouteChain(undefined), []);
  assert.deepEqual(getActiveNavigationRouteChain({ index: 3, routes: [] }), []);
});
