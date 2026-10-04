import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Nota } from '../../../../shared/models/nota';
import { NotaCardComponent } from '../../components/nota-card/nota-card';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-listagem-notas',
  imports: [RouterLink, FormsModule, NotaCardComponent],
  templateUrl: './listagem-notas.html',
})
export class ListagemNotasComponent {
  private readonly notasService = inject(NotasService);

  readonly termoBusca = signal('');
  readonly modalAberto = signal(false);
  readonly idParaRemover = signal<string | null>(null);

  readonly notas = this.notasService.notas;
  readonly totalNotas = this.notasService.totalNotas;

  readonly notaParaRemover = computed<Nota | null>(() => {
    const id = this.idParaRemover();
    if (!id) {
      return null;
    }
    return this.notas().find((nota) => nota.id === id) ?? null;
  });

  readonly notasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this.notas();

    if (!termo) {
      return lista;
    }

    return lista.filter(
      (nota) =>
        nota.titulo.toLowerCase().includes(termo) ||
        nota.conteudo.toLowerCase().includes(termo),
    );
  });

  confirmarRemocao(id: string): void {
    this.idParaRemover.set(id);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.idParaRemover.set(null);
  }

  executarRemocao(): void {
    const id = this.idParaRemover();
    if (id) {
      this.notasService.removerNota(id);
    }
    this.fecharModal();
  }

  limparBusca(): void {
    this.termoBusca.set('');
  }
}
