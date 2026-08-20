import type { HangulQuestionType } from "../data/hangul/types";

export function getHangulTeacherFeedback(
  type: HangulQuestionType,
  correct: boolean,
) {
  if (correct) {
    switch (type) {
      case "audio-to-character":
        return "Oui, tu as bien reconnu le caractère à l’oreille.";
      case "character-to-sound":
        return "Oui, c’est bien le son associé à ce caractère.";
      case "assemble":
        return "Oui, le bloc syllabique est bien construit.";
      case "layout":
        return "Oui, tu as bien placé les éléments dans la syllabe.";
      case "read":
        return "Oui, ta lecture correspond bien à ce qui est écrit.";
      case "batchim":
        return "Oui, tu as bien repéré le son final de la syllabe.";
      case "contrast":
        return "Oui, tu as bien distingué les deux sons.";
    }
  }

  switch (type) {
    case "audio-to-character":
      return "Pas tout à fait. Réécoute sans regarder les choix et concentre-toi sur le son qui distingue les caractères.";
    case "character-to-sound":
      return "Ici, le caractère est bon à reconnaître, mais le son associé n’est pas encore le bon. Repars de sa prononciation de base.";
    case "assemble":
      return "Tu as les bons éléments en tête, mais pas encore le bon bloc. Repars de l’ordre consonne + voyelle, puis ajoute le son final s’il y en a un.";
    case "layout":
      return "Regarde surtout la forme du bloc : la position de la voyelle détermine où les éléments se placent.";
    case "read":
      return "Tu es proche. Lis la syllabe morceau par morceau avant de la prononcer d’un seul mouvement.";
    case "batchim":
      return "Ici, c’est le son final qui fait la différence. Isole d’abord le batchim avant de relire toute la syllabe.";
    case "contrast":
      return "Ces deux sons sont proches. Réécoute-les l’un après l’autre et cherche le détail qui les différencie avant de choisir.";
  }
}
