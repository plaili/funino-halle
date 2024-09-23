type Team = {
  name: string;
};

type Participant = {
  name: string;
  index: number;
  strength: number;
};

type Game = {
  teamA: Participant;
  teamB: Participant;
};

type MatchList = {
  participants: Participant[];
  gamesPerParticipant: number;
  games: Game[];
  gameCountMap: Map<string, number>;
  score: number;
};

type TournamentSchedule = {
  start: string;
  games: Game[];
  csv: string;
};

type CalculationSettings = {
  iterations: number;
  gamesPerParticipant: number;
  start: string;
  gameDuration: number;
};

type CalculationData = {
  participants: Participant[];
  settings: CalculationSettings;
  currentIteration: number;
  calculations: number;
  matchList: MatchList;
  tournamentSchedule: TournamentSchedule;
  bestScore: number;
  done: boolean;
};

export type {
  CalculationSettings,
  CalculationData,
  Game,
  MatchList,
  TournamentSchedule,
  Team,
  Participant,
};
