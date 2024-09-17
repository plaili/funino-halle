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

type MatchSchedule = {
  games: Game[];
};

type CalculationSettings = {
  iterations: number;
  gamesPerParticipant: number;
  gameDuration: number;
};

export type {
  CalculationSettings,
  Game,
  MatchList,
  MatchSchedule,
  Team,
  Participant,
};
