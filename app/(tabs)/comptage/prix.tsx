import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — NEON MARKETPLACE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  wonGold: "#FDE047",
  neonAmber: "#F59E0B",
  marketRed: "#EF4444",
  luxuryCyan: "#22D3EE",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

type CountingAudioSet = {
  messages: number[];
  toolbox: (number | undefined)[];
};

const withSceneAudio = (scenes: any[], audioSets: CountingAudioSet[]) =>
  scenes.map((scene, sceneIndex) => {
    const audioSet = audioSets[sceneIndex];

    if (!audioSet) return scene;

    return {
      ...scene,
      dialogue: scene.dialogue.map((line: any, index: number) => ({
        ...line,
        ...(audioSet.messages[index] ? { audio: audioSet.messages[index] } : {}),
      })),
      expressions: scene.expressions.map((expression: any, index: number) => ({
        ...expression,
        ...(audioSet.toolbox[index] ? { audio: audioSet.toolbox[index] } : {}),
      })),
    };
  });

const STORE_SHOPPING_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/store-shopping-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/store-shopping/toolbox/store-shopping-toolbox-6.mp3"),
  ],
};

const MARKET_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/market-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/market/toolbox/market-toolbox-6.mp3"),
  ],
};

const CONVENIENCE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/convenience-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toobox-1.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/shopping-prix/convenience/toolbox/convenience-toolbox-6.mp3"),
  ],
};

const SCENES = withSceneAudio([
  {
    id: "department-store",
    title: "Le Grand Magasin",
    koreanTitle: "백화점 (Baek-hwa-jeom)",
    description: "Gérer des montants élevés dans les boutiques de luxe.",
    accent: COLORS.luxuryCyan,
    image:
      "https://images.unsplash.com/photo-1562280963-8a5475740a10?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Client",
        kr: "이 가방은 얼마예요?",
        fr: "Combien coûte ce sac ?",
      },
      {
        char: "Vendeur",
        kr: "이십오만 팔천 원입니다. 할부로 하시겠어요?",
        fr: "C'est 258 000 won (I-sip-oh-man pal-cheon). Voulez-vous payer en plusieurs fois ?",
      },
      {
        char: "Client",
        kr: "삼 개월 할부도 가능해요?",
        fr: "Un paiement en trois mois est possible aussi ?",
      },
      {
        char: "Vendeur",
        kr: "네, 삼 개월 할부로 결제해 드릴게요.",
        fr: "Oui, je vais vous faire le paiement en trois fois.",
      },
    ],
    expressions: [
      {
        word: "만 (萬)",
        rom: "Man",
        mean: "10 000",
        context: "L'unité monétaire de base en Corée. 10 000 Won ≈ 7€.",
      },
      {
        word: "할부",
        rom: "Hal-bu",
        mean: "Paiement échelonné",
        context: "Très courant en Corée pour les achats de plus de 50 000W.",
      },
      {
        word: "면세",
        rom: "Myeon-se",
        mean: "Détaxé / Duty Free",
        context: "Mot clé pour récupérer la TVA à l'aéroport.",
      },
      {
        word: "이십오만 팔천 원",
        rom: "I-sip-oh-man pal-cheon won",
        mean: "258 000 won",
        context: "Exemple complet de prix avec dizaines de mille et milliers.",
      },
      {
        word: "삼 개월 할부",
        rom: "Sam gaewol halbu",
        mean: "Paiement en 3 mois",
        context: "Très fréquent aux caisses des grands magasins.",
      },
      {
        word: "결제하다",
        rom: "Gyeoljehada",
        mean: "Payer / régler",
        context: "Verbe standard pour finaliser un paiement.",
      },
    ],
  },
  {
    id: "market",
    title: "Marché Traditionnel",
    koreanTitle: "전통 시장 (Sijang)",
    description: "L'art de la négociation et du 'Service' (cadeau).",
    accent: COLORS.marketRed,
    image:
      "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "사장님, 너무 비싸요! 좀 깎아주세요.",
        fr: "Patron, c'est trop cher ! Faites-moi une petite réduction.",
      },
      {
        char: "Vendeuse",
        kr: "그래요, 만 원만 내요. 서비스로 양말도 줄게요!",
        fr: "D'accord, payez juste 10 000 won. Je vous offre des chaussettes en bonus !",
      },
      {
        char: "Moi",
        kr: "좋아요, 현금으로 만 원 드릴게요.",
        fr: "D'accord, je vous donne 10 000 won en espèces.",
      },
      {
        char: "Vendeuse",
        kr: "두 켤레 가져가세요. 서비스예요.",
        fr: "Prenez deux paires. C'est offert.",
      },
    ],
    expressions: [
      {
        word: "깎아주세요",
        rom: "Kkakka-juseyo",
        mean: "Baissez le prix",
        context: "La phrase magique des marchés de Namdaemun.",
      },
      {
        word: "서비스",
        rom: "Seo-bi-seu",
        mean: "Cadeau / Gratuit",
        context: "Un petit plus offert par le vendeur pour vous fidéliser.",
      },
      {
        word: "현금",
        rom: "Hyeon-geum",
        mean: "Espèces",
        context:
          "Préférable dans les petits marchés pour obtenir de meilleurs prix.",
      },
      {
        word: "만 원만",
        rom: "Man won-man",
        mean: "Seulement 10 000 won",
        context: "Le suffixe -man insiste sur 'juste / seulement'.",
      },
      {
        word: "두 켤레",
        rom: "Du kyeolle",
        mean: "Deux paires",
        context: "Kyeolle compte les chaussures, chaussettes et gants.",
      },
      {
        word: "사장님",
        rom: "Sajangnim",
        mean: "Patron / Madame-Monsieur",
        context: "Adresse conviviale très courante dans les marchés.",
      },
    ],
  },
  {
    id: "convenience",
    title: "La Supérette",
    koreanTitle: "편의점 (Pyeon-ui-jeom)",
    description: "Achats rapides, reçus et offres '1+1'.",
    accent: COLORS.wonGold,
    image:
      "https://images.unsplash.com/photo-1604719312563-861ac03ad51b?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이거 원 플러스 원 맞죠?",
        fr: "C'est bien une offre 1+1 (One plus One), n'est-ce pas ?",
      },
      {
        char: "Caissier",
        kr: "네, 맞아요. 영수증 필요하세요?",
        fr: "Oui, c'est ça. Avez-vous besoin du reçu ?",
      },
      {
        char: "Moi",
        kr: "네, 그리고 봉투 하나 주세요.",
        fr: "Oui, et donnez-moi un sac, s'il vous plaît.",
      },
      {
        char: "Caissier",
        kr: "봉투는 백 원 추가됩니다.",
        fr: "Le sac coûte 100 won en plus.",
      },
    ],
    expressions: [
      {
        word: "원 플러스 원",
        rom: "One plus One",
        mean: "Un acheté, un offert",
        context: "La promotion reine des GS25 et CU.",
      },
      {
        word: "영수증",
        rom: "Yeong-su-jeung",
        mean: "Reçu / Ticket",
        context: "Indispensable pour les remboursements d'impôts.",
      },
      {
        word: "봉투",
        rom: "Bong-tu",
        mean: "Sac",
        context: "Souvent facturé 100-200 Won séparément.",
      },
      {
        word: "백 원",
        rom: "Baek won",
        mean: "100 won",
        context: "Petit supplément typique pour un sac plastique.",
      },
      {
        word: "추가됩니다",
        rom: "Chugadoemnida",
        mean: "C'est ajouté",
        context: "Formule de caisse pour annoncer un coût supplémentaire.",
      },
      {
        word: "맞죠?",
        rom: "Matjyo?",
        mean: "C'est bien ça ?",
        context: "Demande de confirmation naturelle avant de payer.",
      },
    ],
  },
], [STORE_SHOPPING_AUDIO, MARKET_AUDIO, CONVENIENCE_AUDIO]);

export default function ShoppingImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SÉOUL SHOPPING"
      badgeLabel="₩ KRW"
      toolboxTitle="SHOPPING TOOLBOX"
    />
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.85)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  currencyText: { fontSize: 9, fontFamily: "Outfit_700Bold" },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 30 },
  mainDesc: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },

  toolbox: { marginTop: 40 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxTitle: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expBody: { padding: 20 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
