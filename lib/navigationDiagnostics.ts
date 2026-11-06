type NavigationStateSnapshot = Readonly<{
  key?: string;
  index?: number;
  routes: readonly Readonly<{
    key?: string;
    name: string;
    state?: NavigationStateSnapshot;
  }>[];
}>;

/** Only route identities: never include auth/search params in diagnostic logs. */
export function getActiveNavigationRouteChain(
  state: NavigationStateSnapshot | undefined,
) {
  const chain: {
    navigatorKey: string | null;
    routeIndex: number;
    routeName: string;
    routeKey: string | null;
  }[] = [];
  let current = state;
  while (current) {
    const routeIndex = current.index ?? 0;
    const route = current.routes[routeIndex];
    if (!route) break;
    chain.push({
      navigatorKey: current.key ?? null,
      routeIndex,
      routeName: route.name,
      routeKey: route.key ?? null,
    });
    current = route.state;
  }
  return chain;
}
