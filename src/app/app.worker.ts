/// <reference lib="webworker" />
import {
  CalculationData,
  Game,
  MatchList,
  Participant,
  TournamentSchedule,
} from '../types/data-types';
import { DateTime } from 'ts-luxon';

function getName(participant: Participant) {
  return `${participant.name} ${participant.index + 1}`;
}

function shuffle(array: never[]) {
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

function stripTeamNumberSuffix(name: string): string {
  let result = name;
  if (name.endsWith('III')) {
    result = name.substring(0, name.length - 4);
  } else if (
    name.endsWith('II') ||
    name.endsWith('VI') ||
    name.endsWith('IV')
  ) {
    result = name.substring(0, name.length - 3);
  } else if (name.endsWith('I') || name.endsWith('V')) {
    result = name.substring(0, name.length - 2);
  }
  return result;
}

function rate(game: Game): number {
  let score = 0;
  score -= Math.abs(game.teamA.strength - game.teamB.strength) * 2;
  if (game.teamA.name === game.teamB.name) {
    score -= 2;
  } else if (
    stripTeamNumberSuffix(game.teamA.name) ===
    stripTeamNumberSuffix(game.teamB.name)
  ) {
    score -= 1;
  }
  return score;
}

function createTrimmedMatchList(
  participants: Participant[],
  gamesPerTeam: number
): MatchList {
  const gameCountMap = new Map<string, number>();
  const games = [] as Game[];
  let score = 0;
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
    shuffle(possibleShuffledIndices as never[]);

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
          score += rate(game);
        }
      }
      possibleGameIndex += 1;
    }
  }
  return {
    participants,
    games,
    gameCountMap,
    score,
    gamesPerParticipant: gamesPerTeam,
  };
}
/**
 * @param possibleGames - The array of games of which to choose one randomly
 * @param remainingGames - The array of games in which to look for the index of the randomly chosen game
 * @returns {number} The index of the randomly chosen game in `remainingGames`
 */
function findRandomPossibleInRemaining(
  possibleGames: Game[],
  remainingGames: Game[]
): number {
  let gameIndex = -1;
  if (possibleGames.length > 0) {
    shuffle(possibleGames as never[]);
    gameIndex = remainingGames.findIndex(
      game =>
        game.teamA.name === possibleGames[0].teamA.name &&
        game.teamA.index === possibleGames[0].teamA.index &&
        game.teamB.name === possibleGames[0].teamB.name &&
        game.teamB.index === possibleGames[0].teamB.index
    );
  }
  return gameIndex;
}

function calculateSchedule(matchList: MatchList): TournamentSchedule {
  const schedule = {
    games: [],
    start: '',
    csv: '',
  } as TournamentSchedule;
  // the games to be scheduled
  const remainingGames = [...matchList.games];
  // count the number of teams that have fewer games scheduled than other teams
  let teamCountLower = matchList.participants.length;
  // save the last slot in which a team has been scheduled
  // in each time slot two games can be scheduled
  const lastScheduledSlotMap = new Map<string, number>();
  // saves the number of scheduled games for every team
  const scheduledGamesMap = new Map<string, number>();
  for (const participant of matchList.participants) {
    lastScheduledSlotMap.set(getName(participant), -2);
    scheduledGamesMap.set(getName(participant), 0);
  }
  // true if a team has had games in two consecutive slots
  const noPauseMap = new Map<string, boolean>();
  let scheduledGames = 0;
  while (remainingGames.length > 0) {
    let foundIndex = -1;
    const currentSlot = Math.floor(scheduledGames / 2);
    const minGameCountOfATeam = Math.floor(
      scheduledGames / (matchList.participants.length / 2)
    );
    // rule 1: no team has two pairs of games in consecutive slots
    // rule 2: no team has ever two fewer games than any other team
    // rule 3: a team can only be scheduled in a slot once
    if (teamCountLower >= 2) {
      // we have at least two teams whose games need to be scheduled next
      const possibleGames = remainingGames.filter(game => {
        const teamAName = getName(game.teamA);
        const teamBName = getName(game.teamB);
        return (
          // we only match if no team has to play two consecutive games
          scheduledGamesMap.get(teamAName) === minGameCountOfATeam &&
          scheduledGamesMap.get(teamBName) === minGameCountOfATeam &&
          currentSlot - 2 >= lastScheduledSlotMap.get(teamAName)! &&
          currentSlot - 2 >= lastScheduledSlotMap.get(teamBName)!
        );
      });
      const gameIndex = findRandomPossibleInRemaining(
        possibleGames,
        remainingGames
      );
      if (gameIndex >= 0) {
        foundIndex = gameIndex;
      } else {
        // we did not find a possibility to have no consecutive games
        const possibleGames = remainingGames.filter(game => {
          const teamAName = getName(game.teamA);
          const teamBName = getName(game.teamB);
          const teamANoConsecutivePossible =
            currentSlot - 2 < lastScheduledSlotMap.get(teamAName)!;
          const teamBNoConsecutivePossible =
            currentSlot - 2 < lastScheduledSlotMap.get(teamBName)!;
          if (
            scheduledGamesMap.get(teamAName) === minGameCountOfATeam &&
            scheduledGamesMap.get(teamBName) === minGameCountOfATeam &&
            // not || because we do not want to choose two teams that have to play consecutive games
            teamANoConsecutivePossible !== teamBNoConsecutivePossible
          ) {
            // for one of the two teams the slot rule can't be held
            return (
              (teamANoConsecutivePossible &&
                // no team should have two pairs of games without a break
                !noPauseMap.has(teamAName) &&
                // no team can play in the same slot twice
                currentSlot !== lastScheduledSlotMap.get(teamAName)!) ||
              (teamBNoConsecutivePossible &&
                // no team should have two pairs of games without a break
                !noPauseMap.has(teamBName) &&
                // no team can play in the same slot twice
                currentSlot !== lastScheduledSlotMap.get(teamBName)!)
            );
          }
          return false;
        });
        const gameIndex = findRandomPossibleInRemaining(
          possibleGames,
          remainingGames
        );
        if (gameIndex >= 0) {
          foundIndex = gameIndex;
        }
      }
    } else {
      // there is only one team left with fewer games than all others
      const possibleGames = remainingGames.filter(game => {
        const teamAName = getName(game.teamA);
        const teamBName = getName(game.teamB);
        return (
          (scheduledGamesMap.get(teamAName) === minGameCountOfATeam ||
            scheduledGamesMap.get(teamBName) === minGameCountOfATeam) &&
          currentSlot - 2 >= lastScheduledSlotMap.get(teamAName)! &&
          currentSlot - 2 >= lastScheduledSlotMap.get(teamBName)!
        );
      });
      const gameIndex = findRandomPossibleInRemaining(
        possibleGames,
        remainingGames
      );
      if (gameIndex >= 0) {
        foundIndex = gameIndex;
      }
    }
    if (foundIndex >= 0) {
      const teamAName = getName(remainingGames[foundIndex].teamA);
      scheduledGamesMap.set(teamAName, scheduledGamesMap.get(teamAName)! + 1);
      if (currentSlot - 2 < lastScheduledSlotMap.get(teamAName)!) {
        noPauseMap.set(teamAName, true);
      }
      lastScheduledSlotMap.set(teamAName, currentSlot);

      const teamBName = getName(remainingGames[foundIndex].teamB);
      if (currentSlot - 2 < lastScheduledSlotMap.get(teamBName)!) {
        noPauseMap.set(teamBName, true);
      }
      scheduledGamesMap.set(teamBName, scheduledGamesMap.get(teamBName)! + 1);
      lastScheduledSlotMap.set(teamBName, currentSlot);

      schedule.games.push(remainingGames[foundIndex]);
      remainingGames.splice(foundIndex, 1);
      scheduledGames++;
      teamCountLower = [...scheduledGamesMap.values()].filter(
        value => value === minGameCountOfATeam
      ).length;
      if (teamCountLower === 0) {
        teamCountLower = matchList.participants.length;
      }
    } else {
      // we could not find a suitable match to schedule -> try again
      break;
    }
  }
  return schedule;
}

function isValid(matchList: MatchList): boolean {
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

addEventListener('message', ({ data }) => {
  const calculationData = data as CalculationData;
  console.time('match list calculation');
  let valid = 0;
  let tries = 0;
  let bestMatchList = undefined as unknown as MatchList;
  const response = { ...calculationData };
  response.done = false;
  while (
    valid < calculationData.settings.iterations &&
    calculationData.participants.length >
      calculationData.settings.gamesPerParticipant + 1
  ) {
    const schedule = createTrimmedMatchList(
      calculationData.participants,
      calculationData.settings.gamesPerParticipant
    );
    if (isValid(schedule)) {
      if (!bestMatchList || bestMatchList.score < schedule.score) {
        bestMatchList = schedule;
        response.matchList = bestMatchList;
        response.bestScore = bestMatchList.score;
      }
      valid++;
      response.currentIteration = valid;
    }
    tries++;
    response.calculations = tries;
    if (tries % 1000 === 0) {
      postMessage(response);
    }
  }
  if (bestMatchList) {
    let bestSchedule = {
      games: [],
      start: '',
      csv: '',
    } as TournamentSchedule;
    const maxTries = 10000000;
    let tries = 0;
    while (
      tries < maxTries &&
      bestSchedule.games.length < bestMatchList.games.length
    ) {
      const schedule = calculateSchedule(bestMatchList);
      if (schedule.games.length > bestSchedule.games.length) {
        bestSchedule = schedule;
      }
      tries++;
    }
    console.log(`schedule tries: ${tries}`);
    response.tournamentSchedule = bestSchedule;
    const csvHeader = `,1,2,,1,2,,1,2`;
    const csvLinesArray = Array.from(
      { length: Math.ceil(bestSchedule.games.length / 6) * 4 },
      () => ''
    );
    let nextStartTime = DateTime.fromISO(calculationData.settings.start);
    for (
      let gameIndex = 0;
      gameIndex < bestSchedule.games.length;
      gameIndex++
    ) {
      const line1Index = Math.floor(gameIndex / 6) * 4;
      if (gameIndex % 6 === 0) {
        csvLinesArray[line1Index] =
          nextStartTime.toLocaleString(DateTime.TIME_24_SIMPLE) + csvHeader;
      }
      if (gameIndex > 0 && gameIndex % 2 === 0 && gameIndex % 6 !== 0) {
        csvLinesArray[line1Index + 1] += ',';
        csvLinesArray[line1Index + 2] += ',';
      }
      csvLinesArray[line1Index + 1] +=
        `,${getName(bestSchedule.games[gameIndex].teamA)}`;

      csvLinesArray[line1Index + 2] +=
        `,${getName(bestSchedule.games[gameIndex].teamB)}`;

      csvLinesArray[line1Index + 3] += ',,';
      nextStartTime = nextStartTime.plus({
        minutes: calculationData.settings.gameDuration + 2,
      });
    }
    csvLinesArray.forEach(line => {
      response.tournamentSchedule.csv += line + '\n';
    });
  }

  console.timeEnd('match list calculation');
  response.done = true;
  postMessage(response);
});
