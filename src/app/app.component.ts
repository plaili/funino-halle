import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ParticipantListComponent } from '../components/participant-list.component';
import { TeamListComponent } from '../components/team-list.component';
import {
  CalculationData,
  CalculationSettings,
  Participant,
  Team,
} from '../types/data-types';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HeaderComponent } from '../components/header-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ParticipantListComponent,
    TeamListComponent,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatLabel,
    MatMiniFabButton,
    MatFormField,
    MatInput,
    HeaderComponent,
  ],
  template: ` <mat-grid-list cols="2" rowHeight="10vh">
    <mat-grid-tile [colspan]="2" [rowspan]="1">
      <app-header-component (calculate)="calculate($event)" />
    </mat-grid-tile>
    <mat-grid-tile [colspan]="1" [rowspan]="9">
      <app-team-list
        [teamList]="teamList"
        (addTeamEvent)="addTeam($event)"
        (removeTeamEvent)="removeTeam($event)">
      </app-team-list>
    </mat-grid-tile>
    <mat-grid-tile [colspan]="1" [rowspan]="9"
      ><app-participant-list
        [participantList]="participantList"
        (increaseStrength)="incStrength($event)"
        (decreaseStrength)="decStrength($event)">
      </app-participant-list>
    </mat-grid-tile>
  </mat-grid-list>`,
  styles: `
    app-team-list,
    app-participant-list {
      align-self: flex-start;
      overflow: auto;
    }
    mat-grid-tile {
      overflow: auto;
    }
  `,
})
export class AppComponent {
  title = 'funino-halle';
  participantList = [] as Participant[];
  teamList = [
    { name: 'MTV Braunschweig' },
    { name: 'BSC Acosta' },
    { name: 'Eintracht Braunschweig' },
    { name: 'JSG Wenden/Veltenhof' },
    { name: 'JSG Wenden/Veltenhof II' },
    { name: 'JSG FreieTurner/Polizei' },
    { name: 'JSG FreieTurner/Polizei II' },
    { name: 'HSC Leu' },
    { name: 'JFV Kickers Braunschweig' },
    { name: 'JFV Kickers Braunschweig II' },
    { name: 'Lehndorfer TSV' },
    { name: 'JSG Gliesmarode/Querum' },
    { name: 'SC Victoria' },
    { name: 'SV Rühme' },
    { name: 'SV Broitzem' },
    { name: 'SV Gartenstadt' },
    { name: 'SV Melverode-Heidberg' },
    { name: 'SV Stöckheim' },
    { name: 'TSV Eintracht Völkenrode' },
    { name: 'TSV Timmerlah' },
    { name: 'TSV Germania Lamme' },
    { name: 'TSV Germania Lamme II' },
    { name: 'TSV Rüningen' },
    { name: 'TSC Vahdet' },
    { name: 'TV Mascherode' },
    { name: '1. JFV Braunschweig' },
    { name: 'JSG Cremlingen/Destedt' },
    { name: 'VfR Weddel' },
  ] as Team[];

  calculate($event: CalculationSettings) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        const calcData = data as CalculationData;
        console.log(
          `calc status: done=${calcData.done} tries=${calcData.calculations} (${calcData.currentIteration} valid, best score=${calcData.bestScore}, ${calcData.tournamentSchedule.games.length} of ${calcData.matchList.games.length} scheduled`
        );
        console.log(calcData);
      };
      const data = {
        participants: this.participantList,
        settings: $event,
      } as CalculationData;
      worker.postMessage(data);
    } else {
      console.error('no web workers');
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  addTeam($event: string) {
    const teamCount = this.participantList.filter(
      participant => participant.name === $event
    ).length;
    this.participantList.push({ name: $event, index: teamCount, strength: 0 });
  }

  removeTeam($event: string) {
    console.log(this.participantList);
    const teamCount = this.participantList.filter(
      participant => participant.name === $event
    ).length;
    if (teamCount === 0) {
      return;
    }
    const removeIndex = this.participantList.findIndex(
      participant =>
        participant.name === $event && participant.index === teamCount - 1
    );
    this.participantList.splice(removeIndex, 1);
  }

  incStrength($event: Participant) {
    const team = this.participantList.find(
      participant =>
        participant.name === $event.name && participant.index === $event.index
    );
    if (!team || team.strength === 2) {
      return;
    }
    team.strength = $event.strength + 1;
  }

  decStrength($event: Participant) {
    const team = this.participantList.find(
      participant =>
        participant.name === $event.name && participant.index === $event.index
    );
    if (!team || team.strength === 0) {
      return;
    }
    team.strength = $event.strength - 1;
  }
}
