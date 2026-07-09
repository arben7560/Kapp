import {
  Dimensions,
  StyleSheet
} from "react-native";
import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — TEMPORAL SKY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  deepIndigo: "#4338CA",
  twilight: "#6366F1",
  softLilac: "#A78BFA",
  starWhite: "#F8FAFC",
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
        ...(audioSet.messages[index]
          ? { audio: audioSet.messages[index] }
          : {}),
      })),
      expressions: scene.expressions.map((expression: any, index: number) => ({
        ...expression,
        ...(audioSet.toolbox[index] ? { audio: audioSet.toolbox[index] } : {}),
      })),
    };
  });

const DATE_ANNIVERSAIRE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/date-anniversaire-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/date-anniversaire/toolbox/date-anniversaire-toolbox-6.mp3"),
  ],
};

const VOYAGE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/voyage-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/voyage/toolbox/voyage-toolbox-6.mp3"),
  ],
};

const SEMAINE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/semaine-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/date-calendrier/semaine/toolbox/semaine-toolbox-5.mp3"),
  ],
};

const SCENES = withSceneAudio(
  [
    {
      id: "birthday",
      title: "L'Anniversaire",
      koreanTitle: "생일 날짜 (Saeng-il Nal-jja)",
      description:
        "Donner sa date de naissance complète (Année / Mois / Jour).",
      accent: COLORS.softLilac,
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
      dialogue: [
        {
          char: "Ami",
          kr: "생일이 언제예요?",
          fr: "C'est quand ton anniversaire ?",
        },
        {
          char: "Moi",
          kr: "제 생일은 이천육년 사월 이십사일이에요.",
          fr: "Mon anniversaire est le 24 avril 2026 (I-cheon-yuk-nyeon Sa-wol I-sip-sa-il).",
        },
        {
          char: "Ami",
          kr: "그럼 금요일에 파티해요?",
          fr: "Alors, on fait la fête vendredi ?",
        },
        {
          char: "Moi",
          kr: "네, 사월 이십사일 금요일에 만나요.",
          fr: "Oui, retrouvons-nous le vendredi 24 avril.",
        },
      ],
      expressions: [
        {
          word: "년 / 월 / 일",
          rom: "Nyeon / Wol / Il",
          mean: "Année / Mois / Jour",
          context: "L'ordre coréen est toujours du plus grand au plus petit.",
        },
        {
          word: "언제예요?",
          rom: "Eon-je-ye-yo?",
          mean: "C'est quand ?",
          context: "La question temporelle de base pour toute date.",
        },
        {
          word: "사월",
          rom: "Sa-wol",
          mean: "Avril",
          context:
            "Les mois sont simplement le chiffre + 'Wol'. (Janvier = Il-wol, etc.).",
        },
        {
          word: "이십사일",
          rom: "I-sip-sa-il",
          mean: "Le 24",
          context: "Les jours du mois utilisent le système sino-coréen.",
        },
        {
          word: "금요일",
          rom: "Geum-yo-il",
          mean: "Vendredi",
          context: "Jour de la semaine associé à l'élément métal/or.",
        },
        {
          word: "만나요",
          rom: "Mannayo",
          mean: "Retrouvons-nous",
          context: "Forme douce pour fixer un rendez-vous.",
        },
      ],
    },
    {
      id: "travel",
      title: "Le Voyage",
      koreanTitle: "여행 계획 (Travel Plan)",
      description: "Planifier les dates d'arrivée et de départ d'un séjour.",
      accent: COLORS.twilight,
      image:
        "https://images.unsplash.com/photo-1501503060477-724b392ac520?auto=format&fit=crop&w=800&q=80",
      dialogue: [
        {
          char: "Hôtel",
          kr: "언제 체크인 하시나요?",
          fr: "Quand faites-vous votre check-in ?",
        },
        {
          char: "Moi",
          kr: "다음 주 수요일부터 금요일까지요.",
          fr: "Du mercredi au vendredi de la semaine prochaine.",
        },
        {
          char: "Hôtel",
          kr: "체크아웃은 금요일 오전 열한 시 맞으세요?",
          fr: "Le check-out est bien vendredi à 11h du matin ?",
        },
        {
          char: "Moi",
          kr: "네, 수요일 체크인, 금요일 체크아웃이에요.",
          fr: "Oui, check-in mercredi, check-out vendredi.",
        },
      ],
      expressions: [
        {
          word: "다음 주",
          rom: "Da-eum ju",
          mean: "La semaine prochaine",
          context: "Utilisé pour projeter des plans dans le futur proche.",
        },
        {
          word: "~부터 ~까지",
          rom: "~bu-teo ~kka-ji",
          mean: "De... à...",
          context: "Structure essentielle pour exprimer une durée de dates.",
        },
        {
          word: "평일 / 주말",
          rom: "Pyeong-il / Ju-mal",
          mean: "Semaine / Week-end",
          context: "Pour distinguer les jours travaillés du repos.",
        },
        {
          word: "체크인",
          rom: "Chekeu-in",
          mean: "Check-in",
          context: "Mot anglais coréanisé très courant à l'hôtel.",
        },
        {
          word: "체크아웃",
          rom: "Chekeu-aut",
          mean: "Check-out",
          context: "S'utilise avec une date et une heure de départ.",
        },
        {
          word: "오전 열한 시",
          rom: "Ojeon yeolhan si",
          mean: "11h du matin",
          context: "Ojeon précise le matin avant l'heure native.",
        },
      ],
    },
    {
      id: "weekly",
      title: "La Semaine",
      koreanTitle: "요일 (Days of the week)",
      description: "Maîtriser les 7 jours de la semaine et leurs éléments.",
      accent: COLORS.deepIndigo,
      image:
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
      dialogue: [
        {
          char: "Manager",
          kr: "오늘 무슨 요일이에요?",
          fr: "On est quel jour de la semaine aujourd'hui ?",
        },
        {
          char: "Moi",
          kr: "오늘은 월요일이에요. 회의가 있어요.",
          fr: "Aujourd'hui, on est lundi. Il y a une réunion.",
        },
        {
          char: "Manager",
          kr: "그럼 금요일까지 자료를 보내 주세요.",
          fr: "Alors envoyez les documents d'ici vendredi.",
        },
        {
          char: "Moi",
          kr: "네, 목요일 저녁까지 준비할게요.",
          fr: "Oui, je préparerai tout d'ici jeudi soir.",
        },
      ],
      expressions: [
        {
          word: "월요일",
          rom: "Wol-yo-il",
          mean: "Lundi (Lune)",
          context: "Chaque jour commence par un élément (Feu, Eau, Bois...).",
        },
        {
          word: "오늘 / 내일",
          rom: "O-neul / Nae-il",
          mean: "Aujourd'hui / Demain",
          context: "Les ancres temporelles quotidiennes.",
        },
        {
          word: "무슨 요일?",
          rom: "Mu-seun yo-il?",
          mean: "Quel jour (semaine) ?",
          context: "À ne pas confondre avec 'Myeot il' (Quel jour du mois).",
        },
        {
          word: "목요일",
          rom: "Mog-yo-il",
          mean: "Jeudi",
          context: "Jour associé au bois, souvent raccourci à l'oral.",
        },
        {
          word: "금요일까지",
          rom: "Geum-yo-il-kkaji",
          mean: "Jusqu'à vendredi",
          context: "Kkaji marque une limite temporelle.",
        },
        {
          word: "자료",
          rom: "Jaryo",
          mean: "Documents / données",
          context: "Mot pratique pour parler de fichiers à envoyer.",
        },
      ],
    },
  ],
  [DATE_ANNIVERSAIRE_AUDIO, VOYAGE_AUDIO, SEMAINE_AUDIO],
);

export default function DatesCalendarImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SÉOUL TEMPOREL"
      badgeLabel="APRIL 2026"
      toolboxTitle="CALENDAR TOOLBOX"
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
  calendarBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  calendarText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

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
