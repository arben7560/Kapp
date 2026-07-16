import type { DialogueChoice } from "./cafe";

export const CAFE_PILOT_PRODUCT_CHOICES = [
  {
    id: "ped_order_americano",
    label: "Un americano.",
    korean: "아메리카노 주세요.",
    romanization: "Amerikano juseyo.",
    nextNodeId: "ped_confirm",
    orderProduct: "americano",
  },
  {
    id: "ped_order_orange_juice",
    label: "Un jus d’orange.",
    korean: "오렌지 주스 주세요.",
    romanization: "Orenji juseu juseyo.",
    nextNodeId: "ped_confirm",
    orderProduct: "orange-juice",
  },
  {
    id: "ped_order_latte",
    label: "Un latte.",
    korean: "라떼 주세요.",
    romanization: "Ratte juseyo.",
    nextNodeId: "ped_confirm",
    orderProduct: "latte",
  },
  {
    id: "ped_order_cheesecake",
    label: "Une part de cheesecake.",
    korean: "치즈케이크 주세요.",
    romanization: "Chijeu keikeu juseyo.",
    nextNodeId: "ped_confirm",
    orderProduct: "cheesecake",
  },
] as const satisfies readonly DialogueChoice[];
