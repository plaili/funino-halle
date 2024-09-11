import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { Participant } from '../interfaces/data-types';
import { MatFabButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [MatList, MatListItem, MatFabButton, MatIcon, MatMiniFabButton],
  selector: 'app-participant-list',
  standalone: true,
  template: `
    <mat-list>
      @for (
        participant of participantList;
        track participant.name + participant.index
      ) {
        <mat-list-item>
          {{ participant.name }} {{ participant.index }} -
          {{ participant.strength }}
          <button mat-mini-fab (click)="onIncStrength(participant)">
            <mat-icon>keyboard_double_arrow_up</mat-icon>
          </button>
          <button mat-mini-fab (click)="onDecStrength(participant)">
            <mat-icon>keyboard_double_arrow_down</mat-icon>
          </button>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class ParticipantListComponent {
  @Input() participantList = [] as Participant[];
  @Output() increaseStrength = new EventEmitter<Participant>();
  @Output() decreaseStrength = new EventEmitter<Participant>();

  onIncStrength(participant: Participant) {
    this.increaseStrength.emit(participant);
  }

  onDecStrength(participant: Participant) {
    this.decreaseStrength.emit(participant);
  }
}
