import { Component, EventEmitter, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CalculationSettings } from '../interfaces/data-types';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    MatLabel,
    MatList,
    MatListItem,
    MatIcon,
    MatMiniFabButton,
    MatFormField,
    MatInput,
    FormsModule,
  ],
  selector: 'app-header-component',
  standalone: true,
  template: `
    <form #settingsForm="ngForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Iterationen</mat-label>
        <input
          matInput
          [(ngModel)]="model.iterations"
          type="number"
          name="interations" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Spiele pro Team</mat-label>
        <input
          matInput
          [(ngModel)]="model.gamesPerParticipant"
          type="number"
          name="games-per-participant" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Spieldauer in Minuten</mat-label>
        <input
          matInput
          [(ngModel)]="model.gameDuration"
          type="number"
          name="game-duration" />
      </mat-form-field>
      <button mat-mini-fab type="submit">
        <mat-icon>calculate</mat-icon>
      </button>
    </form>
  `,
  styles: `
    .mdc-fab {
      margin: 5px;
    }
  `,
})
export class HeaderComponent {
  @Output() calculate = new EventEmitter<CalculationSettings>();

  model = {
    gameDuration: 7,
    gamesPerParticipant: 5,
    iterations: 50,
  } as CalculationSettings;

  onSubmit() {
    console.log(this.model);
    this.calculate.emit(this.model);
  }
}
