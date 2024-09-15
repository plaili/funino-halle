import { Injectable } from '@angular/core';
import { Game, MatchList, Participant } from '../interfaces/data-types';

function getName(participant: Participant) {
  return `${participant.name} ${participant.index + 1}`;
}

@Injectable({
  providedIn: 'root',
})
export class GamesScheduleService {
  getFullSchedule(participants: Participant[]): MatchList {
    const games = [] as Game[];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        games.push({
          teamA: participants[i],
          teamB: participants[j],
        });
      }
    }
    return {
      participants,
      games,
      gameCountMap: new Map<string, number>(),
      score: -1,
    };
  }

  enrichMatchList(matchList: MatchList): void {
    const gameCountMap = new Map<string, number>();
    matchList.games.forEach((game: Game) => {
      const teamAName = getName(game.teamA);
      const teamBName = getName(game.teamB);
      if (!gameCountMap.has(teamAName)) {
        gameCountMap.set(teamAName, 0);
      }
      if (!gameCountMap.has(teamBName)) {
        gameCountMap.set(teamBName, 0);
      }
      gameCountMap.set(teamAName, gameCountMap.get(teamAName)! + 1);
      gameCountMap.set(teamBName, gameCountMap.get(teamBName)! + 1);
    });
    matchList.gameCountMap = gameCountMap;
  }

  trimMatchList(matchList: MatchList, gamesPerTeam: number): MatchList {
    let indices2BeDeleted = [] as number[];
    let limit = matchList.participants.length * gamesPerTeam;
    if (limit % 2 === 1) {
      limit++;
    }
    limit /= 2;
    for (let i = 0; i < matchList.games.length - limit; i++) {
      indices2BeDeleted.push(
        Math.round(Math.random() * matchList.games.length - 1)
      );
    }
    indices2BeDeleted = indices2BeDeleted.sort((a, b) => b - a);
    const trimmedGames = [...matchList.games];
    for (const index2BeDeleted of indices2BeDeleted) {
      trimmedGames.splice(index2BeDeleted, 1);
    }
    return {
      participants: matchList.participants!,
      games: trimmedGames,
      gameCountMap: new Map<string, number>(),
      score: -1,
    };
  }

  isValid(matchList: MatchList): boolean {
    if (!matchList.gameCountMap || matchList.gameCountMap.size === 0) {
      return false;
    }
    // no participant has more than 1 game more than any other participant
    const maxGames = Array.from(matchList.gameCountMap.values()).reduce(
      (previousValue, currentValue) => {
        if (!previousValue || currentValue > previousValue) {
          return currentValue;
        }
        return previousValue;
      }
    );
    const minGames = Array.from(matchList.gameCountMap.values()).reduce(
      (previousValue, currentValue) => {
        if (!previousValue || currentValue < previousValue) {
          return currentValue;
        }
        return previousValue;
      }
    );
    return maxGames - minGames <= 1;
  }
}
