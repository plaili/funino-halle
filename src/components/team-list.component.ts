import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';

@Component({
  imports: [MatList, MatListItem, MatIcon, MatMiniFabButton],
  selector: 'app-team-list',
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
      @for (team of teamList; track team.name) {
        <mat-list-item>
          <div class="container">
            <div class="left">
              {{ team.name }}
            </div>
            <button mat-mini-fab class="right" (click)="onAdd(team.name)">
              <mat-icon>add_circle</mat-icon>
            </button>
          </div>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class TeamListComponent {
  @Input() teamList = [{ name: '' }];
  @Output() addTeamEvent = new EventEmitter<string>();

  onAdd(name: string) {
    this.addTeamEvent.emit(name);
  }
}
