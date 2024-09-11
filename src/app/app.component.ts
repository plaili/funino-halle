import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ParticipantListComponent } from '../components/participant-list.component';
import { TeamListComponent } from '../components/team-list.component';
import { Participant, Team } from '../interfaces/data-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ParticipantListComponent, TeamListComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'funino-halle';
  participant = {} as Participant;
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

  addTeam($event: string) {
    const teamCount = this.participantList.filter(
      participant => participant.name === $event
    ).length;
    this.participantList.push({ name: $event, index: teamCount, strength: 0 });
  }

  incStrength($event: Participant) {
    const team = this.participantList.find(
      participant =>
        participant.name === $event.name && participant.index === $event.index
    );
    if (!team) {
      return;
    }
    team.strength = $event.strength + 1;
  }

  decStrength($event: Participant) {
    const team = this.participantList.find(
      participant =>
        participant.name === $event.name && participant.index === $event.index
    );
    if (!team) {
      console.log('not found', $event.name);
      return;
    }
    team.strength = $event.strength - 1;
  }
}
