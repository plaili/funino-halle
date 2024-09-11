import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';

@Component({
  imports: [MatList, MatListItem, MatIcon, MatMiniFabButton],
  selector: 'app-team-list',
  standalone: true,
  template: `
    <mat-list>
      @for (team of teamList; track team.name) {
        <mat-list-item>
          {{ team.name }}
          <button mat-mini-fab (click)="onAdd(team.name)">
            <mat-icon>add_circle</mat-icon>
          </button>
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
