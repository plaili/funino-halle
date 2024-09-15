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
  games: Game[];
  gameCountMap: Map<string, number>;
  score: number;
};

type MatchSchedule = {
  games: Game[];
};

export type { Game, MatchList, MatchSchedule, Team, Participant };
