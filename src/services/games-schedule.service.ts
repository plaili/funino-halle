import { Injectable } from '@angular/core';
import { Game, MatchList, Participant } from '../interfaces/data-types';

function getName(participant: Participant) {
  return `${participant.name} ${participant.index + 1}`;
}

@Injectable({
  providedIn: 'root',
})
export class GamesScheduleService {
  shuffle(array: number[]) {
    let m = array.length;
    let t,
      i = 0;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  }

  createTrimmedMatchList(
    participants: Participant[],
    gamesPerTeam: number
  ): MatchList {
    const gameCountMap = new Map<string, number>();
    const games = [] as Game[];
    let neededGames = participants.length * gamesPerTeam;
    if (neededGames % 2 === 1) {
      neededGames += 1;
    }
    neededGames /= 2;
    let possibleGameIndex = 0;
    const fullMatchCount = participants.length - 1;

    for (
      let participantIndex = 0;
      participantIndex < participants.length;
      participantIndex++
    ) {
      const possibleGameCount = fullMatchCount - participantIndex;
      const possibleShuffledIndices = Array.from(
        { length: possibleGameCount },
        (e, i) => i + possibleGameIndex
      );
      this.shuffle(possibleShuffledIndices);

      let missingGames = gamesPerTeam;
      const teamAName = getName(participants[participantIndex]);
      if (gameCountMap.has(teamAName)) {
        missingGames -= gameCountMap.get(teamAName)!;
      }
      if (
        participantIndex === 0 &&
        (participants.length * gamesPerTeam) % 2 === 1
      ) {
        // if we have an uneven number of games one team has to have one game more than the others
        // we choose the first
        missingGames++;
      }
      if (games.length + missingGames > neededGames) {
        missingGames = neededGames - games.length;
      }
      const missingShuffledIndices = possibleShuffledIndices.slice(
        0,
        missingGames
      );
      missingShuffledIndices.sort((a, b) => a - b);
      let missingShuffledIndicesIndex = 0;
      for (
        let opponentIndex = participantIndex + 1;
        opponentIndex < participants.length;
        opponentIndex++
      ) {
        if (
          missingShuffledIndices[missingShuffledIndicesIndex] ===
            possibleGameIndex &&
          missingShuffledIndicesIndex < missingGames
        ) {
          missingShuffledIndicesIndex++;
          const game = {
            teamA: participants[participantIndex],
            teamB: participants[opponentIndex],
          };
          const teamBName = getName(game.teamB);
          if (!gameCountMap.has(teamAName)) {
            gameCountMap.set(teamAName, 0);
          }
          if (!gameCountMap.has(teamBName)) {
            gameCountMap.set(teamBName, 0);
          }
          if (gameCountMap.get(teamBName)! < gamesPerTeam) {
            gameCountMap.set(teamAName, gameCountMap.get(teamAName)! + 1);
            gameCountMap.set(teamBName, gameCountMap.get(teamBName)! + 1);
            games.push(game);
          }
        }
        possibleGameIndex += 1;
      }
    }

    return {
      participants,
      games,
      gameCountMap,
      score: -1,
      gamesPerParticipant: gamesPerTeam,
    };
  }

  isValid(matchList: MatchList): boolean {
    if (!matchList.gameCountMap || matchList.gameCountMap.size === 0) {
      return false;
    }
    if (
      matchList.games.length * 2 <
      matchList.participants.length * matchList.gamesPerParticipant
    ) {
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
    return (
      maxGames - minGames <=
      (matchList.participants.length * matchList.gamesPerParticipant) % 2
    );
  }
}
