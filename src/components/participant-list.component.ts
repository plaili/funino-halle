import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { Participant } from '../interfaces/data-types';
import { MatFabButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { StrengthService } from '../services/strength.service';

@Component({
  imports: [MatList, MatListItem, MatFabButton, MatIcon, MatMiniFabButton],
  selector: 'app-participant-list',
  standalone: true,
  template: `
    <style>
      .container {
        display: flex; /* Verwende Flexbox für die Anordnung der Elemente */
        justify-content: space-between; /* Platz zwischen den Elementen */
        align-items: center; /* Vertikale Zentrierung, optional */
      }

      .left {
        flex-grow: 1; /* Nimmt so viel Platz wie möglich ein */
      }

      .right {
        margin-left: 20px; /* Optionaler Abstand zum linken Element */
      }
    </style>
    <mat-list>
      @for (
        participant of participantList;
        track participant.name + participant.index
      ) {
        <mat-list-item>
          <div class="container">
            <div class="left">
              {{ participant.name }} {{ participant.index + 1 }} -
              {{ strengthService.getName(participant.strength) }}
            </div>
            <div class="right">
              <button mat-mini-fab (click)="onDecStrength(participant)">
                <mat-icon>keyboard_double_arrow_up</mat-icon>
              </button>
              <button mat-mini-fab (click)="onIncStrength(participant)">
                <mat-icon>keyboard_double_arrow_down</mat-icon>
              </button>
            </div>
          </div>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class ParticipantListComponent {
  @Input() participantList = [] as Participant[];
  @Output() increaseStrength = new EventEmitter<Participant>();
  @Output() decreaseStrength = new EventEmitter<Participant>();

  protected strengthService = inject(StrengthService);

  onIncStrength(participant: Participant) {
    this.increaseStrength.emit(participant);
  }

  onDecStrength(participant: Participant) {
    this.decreaseStrength.emit(participant);
  }
}
