export type MetroPhase =
  | "Accueil"
  | "Ligne"
  | "Direction"
  | "Trajet"
  | "Sortie"
  | "Fin";

export type MetroChoice = {
  id: string;
  label: string;
  nextId: string;
  korean?: string;
  romanization?: string;
};

export type MetroStep = {
  id: string;
  speaker: "ai" | "user";
  text: string;
  korean?: string;
  french?: string;
  romanization?: string;
  narrator?: string;
  phase?: MetroPhase;
  choices?: MetroChoice[];
};

export type MetroLesson = {
  id: string;
  title: string;
  shortTitle: string;
  situation: string;
  objective: string;
  steps: MetroStep[];
};

export type MetroState = {
  lessonId: string;
  currentStepId: string;
  history: MetroStep[];
  finished: boolean;
};
