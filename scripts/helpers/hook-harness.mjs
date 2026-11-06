/** Hook adapter for provider control-flow tests. Effects run with their real
 * dependency/cleanup semantics; tests explicitly render at state transitions.
 * This does not simulate React reconciliation or native view lifecycles. */
export function createHookHarness() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const changed = (previous, next) => !previous || !next || previous.length !== next.length || previous.some((value, index) => !Object.is(value, next[index]));
  const memo = (fn, deps) => {
    const index = cursor++;
    if (!slots[index] || changed(slots[index].deps, deps)) slots[index] = { deps, value: fn() };
    return slots[index].value;
  };
  const react = {
    createContext: () => ({ Provider: "Provider" }),
    createElement: (_type, props) => props.value,
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, (value) => { slots[index].value = typeof value === "function" ? value(slots[index].value) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useMemo: memo,
    useCallback: (fn, deps) => memo(() => fn, deps),
    useEffect(fn, deps) {
      const index = cursor++;
      if (slots[index] && !changed(slots[index].deps, deps)) return;
      effects.push(() => {
        slots[index]?.cleanup?.();
        slots[index] = { deps, cleanup: fn() };
      });
    },
  };
  return {
    react,
    render(Component, props = { children: null }) {
      cursor = 0;
      effects = [];
      const output = Component(props);
      effects.forEach((effect) => effect());
      return output;
    },
    cleanup() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}
