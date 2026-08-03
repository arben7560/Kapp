export type HangulAudioSource = number;

const SHARED_AE_E_SOUND = require("../../assets/audio/hangul/ae.mp3");

export const HANGUL_AUDIO_BY_TEXT: Readonly<Record<string, HangulAudioSource>> = {
  가: require("../../assets/audio/hangul/ga.mp3"),
  가요: require("../../assets/audio/hangul/gayo.mp3"),
  각: require("../../assets/audio/hangul/gak.mp3"),
  간: require("../../assets/audio/hangul/gan.mp3"),
  갇: require("../../assets/audio/hangul/gat.mp3"),
  갈: require("../../assets/audio/hangul/gal.mp3"),
  감: require("../../assets/audio/hangul/gam.mp3"),
  갑: require("../../assets/audio/hangul/gap.mp3"),
  강: require("../../assets/audio/hangul/gang.mp3"),
  기차: require("../../assets/audio/hangul/gicha.mp3"),
  까: require("../../assets/audio/hangul/kka.mp3"),
  꼬리: require("../../assets/audio/hangul/kkori.mp3"),
  나: require("../../assets/audio/hangul/na.mp3"),
  나비: require("../../assets/audio/hangul/nabi.mp3"),
  뇌: require("../../assets/audio/hangul/noe.mp3"),
  다: require("../../assets/audio/hangul/da.mp3"),
  달: require("../../assets/audio/hangul/dal.mp3"),
  따: require("../../assets/audio/hangul/tta.mp3"),
  따다: require("../../assets/audio/hangul/ttada.mp3"),
  라: require("../../assets/audio/hangul/ra.mp3"),
  마: require("../../assets/audio/hangul/ma.mp3"),
  먹어: require("../../assets/audio/hangul/meogeo.mp3"),
  모자: require("../../assets/audio/hangul/moja.mp3"),
  문: require("../../assets/audio/hangul/mun.mp3"),
  물: require("../../assets/audio/hangul/mul.mp3"),
  바: require("../../assets/audio/hangul/ba.mp3"),
  바다: require("../../assets/audio/hangul/bada.mp3"),
  밤: require("../../assets/audio/hangul/bam.mp3"),
  밥: require("../../assets/audio/hangul/bap.mp3"),
  빠: require("../../assets/audio/hangul/ppa.mp3"),
  사: require("../../assets/audio/hangul/sa.mp3"),
  사과: require("../../assets/audio/hangul/sagwa.mp3"),
  "사과와 우유": require("../../assets/audio/hangul/sagwawa-uyu.mp3"),
  세계: require("../../assets/audio/hangul/segye.mp3"),
  싸: require("../../assets/audio/hangul/ssa.mp3"),
  싸다: require("../../assets/audio/hangul/ssada.mp3"),
  아: require("../../assets/audio/hangul/a.mp3"),
  아빠: require("../../assets/audio/hangul/appa.mp3"),
  아이: require("../../assets/audio/hangul/ai.mp3"),
  "아이와 여우": require("../../assets/audio/hangul/aiwa-yeou.mp3"),
  앙: require("../../assets/audio/hangul/ang.mp3"),
  앞: require("../../assets/audio/hangul/ap.mp3"),
  애: SHARED_AE_E_SOUND,
  에: SHARED_AE_E_SOUND,
  야: require("../../assets/audio/hangul/ya.mp3"),
  얘: require("../../assets/audio/hangul/yae.mp3"),
  어: require("../../assets/audio/hangul/eo.mp3"),
  여: require("../../assets/audio/hangul/yeo.mp3"),
  여우: require("../../assets/audio/hangul/yeou.mp3"),
  예: require("../../assets/audio/hangul/ye.mp3"),
  오: require("../../assets/audio/hangul/o.mp3"),
  오이: require("../../assets/audio/hangul/oi.mp3"),
  옷: require("../../assets/audio/hangul/ot.mp3"),
  옷이: require("../../assets/audio/hangul/osi.mp3"),
  와: require("../../assets/audio/hangul/wa.mp3"),
  왜: require("../../assets/audio/hangul/wae.mp3"),
  외: require("../../assets/audio/hangul/oe.mp3"),
  외교: require("../../assets/audio/hangul/oegyo.mp3"),
  요: require("../../assets/audio/hangul/yo.mp3"),
  우: require("../../assets/audio/hangul/u.mp3"),
  우유: require("../../assets/audio/hangul/uyu.mp3"),
  워: require("../../assets/audio/hangul/wo.mp3"),
  웨: require("../../assets/audio/hangul/we.mp3"),
  위: require("../../assets/audio/hangul/wi.mp3"),
  유: require("../../assets/audio/hangul/yu.mp3"),
  으: require("../../assets/audio/hangul/eu.mp3"),
  의: require("../../assets/audio/hangul/ui.mp3"),
  의사: require("../../assets/audio/hangul/uisa.mp3"),
  이: require("../../assets/audio/hangul/i.mp3"),
  자: require("../../assets/audio/hangul/ja.mp3"),
  집: require("../../assets/audio/hangul/jip.mp3"),
  집에: require("../../assets/audio/hangul/jibe.mp3"),
  "집에 가요": require("../../assets/audio/hangul/jibe-gayo.mp3"),
  짜: require("../../assets/audio/hangul/jja.mp3"),
  짜다: require("../../assets/audio/hangul/jjada.mp3"),
  차: require("../../assets/audio/hangul/cha.mp3"),
  카: require("../../assets/audio/hangul/ka.mp3"),
  타: require("../../assets/audio/hangul/ta.mp3"),
  파: require("../../assets/audio/hangul/pa.mp3"),
  포도: require("../../assets/audio/hangul/podo.mp3"),
  하: require("../../assets/audio/hangul/ha.mp3"),
  하루: require("../../assets/audio/hangul/haru.mp3"),
  한국어: require("../../assets/audio/hangul/hangugeo.mp3"),
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
