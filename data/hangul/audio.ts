export type HangulAudioSource = number;

const SHARED_AE_E_SOUND = require("../../assets/audio/hangul/애.mp3");

export const HANGUL_AUDIO_BY_TEXT: Readonly<Record<string, HangulAudioSource>> = {
  가: require("../../assets/audio/hangul/가.mp3"),
  가요: require("../../assets/audio/hangul/가요.mp3"),
  각: require("../../assets/audio/hangul/각.mp3"),
  간: require("../../assets/audio/hangul/간.mp3"),
  갇: require("../../assets/audio/hangul/갇.mp3"),
  갈: require("../../assets/audio/hangul/갈.mp3"),
  감: require("../../assets/audio/hangul/감.mp3"),
  갑: require("../../assets/audio/hangul/갑.mp3"),
  강: require("../../assets/audio/hangul/강.mp3"),
  기차: require("../../assets/audio/hangul/기차.mp3"),
  까: require("../../assets/audio/hangul/까.mp3"),
  꼬리: require("../../assets/audio/hangul/꼬리.mp3"),
  나: require("../../assets/audio/hangul/나.mp3"),
  나비: require("../../assets/audio/hangul/나비.mp3"),
  뇌: require("../../assets/audio/hangul/뇌.mp3"),
  다: require("../../assets/audio/hangul/다.mp3"),
  달: require("../../assets/audio/hangul/달.mp3"),
  따: require("../../assets/audio/hangul/따.mp3"),
  따다: require("../../assets/audio/hangul/따다.mp3"),
  라: require("../../assets/audio/hangul/라.mp3"),
  마: require("../../assets/audio/hangul/마.mp3"),
  먹어: require("../../assets/audio/hangul/먹어.mp3"),
  모자: require("../../assets/audio/hangul/모자.mp3"),
  문: require("../../assets/audio/hangul/문.mp3"),
  물: require("../../assets/audio/hangul/물.mp3"),
  바: require("../../assets/audio/hangul/바.mp3"),
  바다: require("../../assets/audio/hangul/바다.mp3"),
  밤: require("../../assets/audio/hangul/밤.mp3"),
  밥: require("../../assets/audio/hangul/밥.mp3"),
  빠: require("../../assets/audio/hangul/빠.mp3"),
  사: require("../../assets/audio/hangul/사.mp3"),
  사과: require("../../assets/audio/hangul/사과.mp3"),
  "사과와 우유": require("../../assets/audio/hangul/사과와 우유.mp3"),
  세계: require("../../assets/audio/hangul/세계.mp3"),
  싸: require("../../assets/audio/hangul/싸.mp3"),
  싸다: require("../../assets/audio/hangul/싸다.mp3"),
  아: require("../../assets/audio/hangul/아.mp3"),
  아빠: require("../../assets/audio/hangul/아빠.mp3"),
  아이: require("../../assets/audio/hangul/아이.mp3"),
  "아이와 여우": require("../../assets/audio/hangul/아이와 여우.mp3"),
  앙: require("../../assets/audio/hangul/앙.mp3"),
  앞: require("../../assets/audio/hangul/앞.mp3"),
  애: SHARED_AE_E_SOUND,
  에: SHARED_AE_E_SOUND,
  야: require("../../assets/audio/hangul/야.mp3"),
  얘: require("../../assets/audio/hangul/얘.mp3"),
  어: require("../../assets/audio/hangul/어.mp3"),
  여: require("../../assets/audio/hangul/여.mp3"),
  여우: require("../../assets/audio/hangul/여우.mp3"),
  예: require("../../assets/audio/hangul/예.mp3"),
  오: require("../../assets/audio/hangul/오.mp3"),
  오이: require("../../assets/audio/hangul/오이.mp3"),
  옷: require("../../assets/audio/hangul/옷.mp3"),
  옷이: require("../../assets/audio/hangul/옷이.mp3"),
  와: require("../../assets/audio/hangul/와.mp3"),
  왜: require("../../assets/audio/hangul/왜.mp3"),
  외: require("../../assets/audio/hangul/외.mp3"),
  외교: require("../../assets/audio/hangul/외교.mp3"),
  요: require("../../assets/audio/hangul/요.mp3"),
  우: require("../../assets/audio/hangul/우.mp3"),
  우유: require("../../assets/audio/hangul/우유.mp3"),
  워: require("../../assets/audio/hangul/워.mp3"),
  웨: require("../../assets/audio/hangul/웨.mp3"),
  위: require("../../assets/audio/hangul/위.mp3"),
  유: require("../../assets/audio/hangul/유.mp3"),
  으: require("../../assets/audio/hangul/으.mp3"),
  의: require("../../assets/audio/hangul/의.mp3"),
  의사: require("../../assets/audio/hangul/의사.mp3"),
  이: require("../../assets/audio/hangul/이.mp3"),
  자: require("../../assets/audio/hangul/자.mp3"),
  집: require("../../assets/audio/hangul/집.mp3"),
  집에: require("../../assets/audio/hangul/집에.mp3"),
  "집에 가요": require("../../assets/audio/hangul/집에 가요.mp3"),
  짜: require("../../assets/audio/hangul/짜.mp3"),
  짜다: require("../../assets/audio/hangul/짜다.mp3"),
  차: require("../../assets/audio/hangul/차.mp3"),
  카: require("../../assets/audio/hangul/카.mp3"),
  타: require("../../assets/audio/hangul/타.mp3"),
  파: require("../../assets/audio/hangul/파.mp3"),
  포도: require("../../assets/audio/hangul/포도.mp3"),
  하: require("../../assets/audio/hangul/하.mp3"),
  하루: require("../../assets/audio/hangul/하루.mp3"),
  한국어: require("../../assets/audio/hangul/한국어.mp3"),
};

export function getHangulAudioSequence(value: string): HangulAudioSource[] | null {
  const segments = value
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return null;

  const sources = segments.map((segment) => HANGUL_AUDIO_BY_TEXT[segment]);
  return sources.every((source): source is HangulAudioSource => source !== undefined)
    ? sources
    : null;
}

export function hasHangulAudio(value: string) {
  return getHangulAudioSequence(value) !== null;
}
