import type { HangulQuestionType } from "../data/hangul/types";

export function getHangulTeacherFeedback(
  type: HangulQuestionType,
  correct: boolean,
) {
  if (correct) {
    switch (type) {
      case "audio-to-character":
        return "Tu as bien reconnu le caractère à l’oreille.";
      case "character-to-sound":
        return "Tu as associé le caractère au bon son.";
      case "assemble":
        return "Le bloc est correctement construit.";
      case "layout":
        return "Tu as bien placé les éléments du bloc.";
      case "read":
        return "La lecture est correcte.";
      case "batchim":
        return "Tu as bien identifié la finale.";
      case "contrast":
        return "Tu as bien distingué les sons.";
    }
  }

  switch (type) {
    case "audio-to-character":
      return "Réécoute le son et compare-le au caractère attendu.";
    case "character-to-sound":
      return "Repars du caractère et vérifie son son de référence.";
    case "assemble":
      return "Reconstruis le bloc dans l’ordre : consonne, voyelle, puis finale.";
    case "layout":
      return "Regarde d’abord la direction de la voyelle.";
    case "read":
      return "Relis le mot bloc par bloc.";
    case "batchim":
      return "Isole la consonne finale avant de relire la syllabe.";
    case "contrast":
      return "Réécoute surtout l’attaque, la tension et le souffle.";
  }
}
