import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Nota } from '../../../../shared/models/nota';
import { NotaCardComponent } from '../../components/nota-card/nota-card';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-listagem-notas',
  imports: [RouterLink, NotaCardComponent],
  templateUrl: './listagem-notas.html',
})
export class ListagemNotasComponent {
  private readonly notasService = inject(NotasService);

  readonly termoBusca = signal('');
  readonly modalAberto = signal(false);
  readonly idParaRemover = signal<string | null>(null);
  readonly removendo = signal(false);

  readonly notas = this.notasService.notas;
  readonly totalNotas = this.notasService.totalNotas;
  readonly carregando = this.notasService.carregando;
  readonly erro = this.notasService.erro;

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
    if (this.removendo()) {
      return;
    }
    this.modalAberto.set(false);
    this.idParaRemover.set(null);
  }

  async executarRemocao(): Promise<void> {
    const id = this.idParaRemover();
    if (!id || this.removendo()) {
      return;
    }

    this.removendo.set(true);
    try {
      await this.notasService.removerNota(id);
      this.modalAberto.set(false);
      this.idParaRemover.set(null);
    } finally {
      this.removendo.set(false);
    }
  }

  recarregar(): void {
    void this.notasService.carregarNotas();
  }

  limparBusca(): void {
    this.termoBusca.set('');
  }
}
