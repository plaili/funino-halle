import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CalculationData, CalculationSettings } from '../types/data-types';
import { FormsModule } from '@angular/forms';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgIf } from '@angular/common';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatProgressBar } from '@angular/material/progress-bar';

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
    NgIf,
    NgxMatTimepickerModule,
    MatSlider,
    MatSliderThumb,
    MatProgressBar,
  ],
  selector: 'app-header-component',
  standalone: true,
  template: `
    <form
      #settingsForm="ngForm"
      (ngSubmit)="onSubmit()"
      *ngIf="!showProgress || calculationData.done === undefined">
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
        <mat-label>Start</mat-label>
        <input
          matInput
          [ngxMatTimepicker]="picker"
          [(ngModel)]="model.start"
          [format]="24"
          [placeholder]="model.start"
          name="start"
          readonly />
        <ngx-mat-timepicker #picker></ngx-mat-timepicker>
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
    <section
      class="header-progress"
      *ngIf="showProgress && calculationData.done !== undefined">
      <h2>
        Calculation in progress: current best score={{
          calculationData.bestScore
        }}
      </h2>
      <section class="header-progressbar">
        <mat-progress-bar
          mode="determinate"
          (animationEnd)="onAnimationEnd()"
          [value]="
            (calculationData.currentIteration /
              calculationData.settings.iterations) *
            100
          ">
        </mat-progress-bar>
      </section>
    </section>
  `,
  styles: `
    .mdc-fab {
      margin: 5px;
    }
    .mat-mdc-form-field {
      padding-right: 5px;
    }
  `,
})
export class HeaderComponent {
  @Input() calculationData = {} as CalculationData;
  @Output() calculate = new EventEmitter<CalculationSettings>();

  showProgress = false;

  model = {
    gameDuration: 7,
    gamesPerParticipant: 5,
    iterations: 50000,
    start: '13:00',
  } as CalculationSettings;

  onSubmit() {
    this.calculate.emit(this.model);
    this.showProgress = true;
  }

  onAnimationEnd() {
    this.showProgress = false;
  }
}
