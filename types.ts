export interface Choice {
  id: string;
  text: string;
  destinationId: string;
  requiresItem?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  choices: Choice[];
  isStart: boolean;
  isFinish?: boolean;
  finishMessage?: string;
  addsItem?: string;
}

export type GameData = Record<string, Location>;

export interface Adventure {
  id: string;
  title: string;
  gameData: GameData;
}
