import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Nota } from '../../../../shared/models/nota';

@Component({
  selector: 'app-nota-card',
  imports: [RouterLink, DatePipe],
  templateUrl: './nota-card.html',
})
export class NotaCardComponent {
  readonly nota = input.required<Nota>();
  readonly remover = output<string>();
}
