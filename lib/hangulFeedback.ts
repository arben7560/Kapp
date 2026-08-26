import type { HangulQuestionType } from "../data/hangul/types";

export function getHangulTeacherFeedback(
  type: HangulQuestionType,
  correct: boolean,
) {
  if (correct) {
    switch (type) {
      case "audio-to-character":
        return "Oui — tu l’as bien reconnu à l’oreille. C’est exactement le caractère attendu.";
      case "character-to-sound":
        return "Exact. Tu associes bien la forme au bon son, c’est le réflexe qu’on cherche à installer.";
      case "assemble":
        return "C’est ça. Les éléments tombent au bon endroit et le bloc est correctement construit.";
      case "layout":
        return "Bien vu. Tu as lu la géométrie du bloc correctement, sans te laisser distraire par les autres formes.";
      case "read":
        return "Oui. Ta lecture suit bien ce qui est écrit, sans avoir besoin de passer par la romanisation.";
      case "batchim":
        return "Bien vu. Tu as isolé la finale avant de lire le reste : c’est exactement le bon réflexe avec les batchim.";
      case "contrast":
        return "Oui. Tu as entendu la différence d’attaque, c’était le détail important à repérer ici.";
    }
  }

  switch (type) {
    case "audio-to-character":
      return "Pas encore. Réécoute une fois sans regarder les choix, puis demande-toi quel détail du son te ramène vers le bon caractère.";
    case "character-to-sound":
      return "Tu reconnais la forme, mais l’association avec le son n’est pas encore stable. Repars de la carte et écoute surtout le geste sonore qui la distingue.";
    case "assemble":
      return "Tu as les bons éléments, mais le bloc ne s’organise pas encore correctement. Reconstruis-le calmement : consonne, voyelle, puis finale seulement s’il y en a une.";
    case "layout":
      return "Regarde la direction de la voyelle avant tout. Elle te dit presque toujours où le reste du bloc doit venir se placer.";
    case "read":
      return "Tu n’es pas loin. Coupe le mot en blocs, lis-les un par un, puis seulement ensuite enchaîne toute la lecture.";
    case "batchim":
      return "Ici, tout se joue à la fin du bloc. Isole d’abord le batchim, identifie sa famille sonore, puis relis la syllabe entière.";
    case "contrast":
      return "Ces sons se ressemblent, donc ne cherche pas à aller vite. Réécoute le début de la syllabe et concentre-toi sur la tension ou le souffle qui change.";
  }
}
