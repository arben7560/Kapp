export const CAFE_ORDER_PRODUCTS = [
  "americano",
  "orange-juice",
  "latte",
  "cheesecake",
] as const;

export type CafeOrderProduct = (typeof CAFE_ORDER_PRODUCTS)[number];

export type CafeOrderState = Readonly<{
  product: CafeOrderProduct | null;
}>;

export type CafeOrderProductSelection = Readonly<{
  orderProduct?: CafeOrderProduct;
}>;

export const EMPTY_CAFE_ORDER_STATE: CafeOrderState = {
  product: null,
};

export function applyCafeOrderProductSelection(
  state: CafeOrderState,
  selection: CafeOrderProductSelection,
): CafeOrderState {
  if (!selection.orderProduct) return state;

  return { product: selection.orderProduct };
}
