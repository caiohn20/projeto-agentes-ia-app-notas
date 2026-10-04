import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-editar-nota',
  imports: [FormsModule, RouterLink],
  templateUrl: './editar-nota.html',
})
export class EditarNotaComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notasService = inject(NotasService);

  readonly id = signal<string | null>(null);
  readonly titulo = signal('');
  readonly conteudo = signal('');
  readonly erro = signal('');
  readonly naoEncontrada = signal(false);

  readonly formularioValido = computed(
    () => this.titulo().trim().length > 0 && this.conteudo().trim().length > 0,
  );

  constructor() {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (!paramId) {
      this.naoEncontrada.set(true);
      return;
    }

    const nota = this.notasService.obterNotaPorId(paramId);
    if (!nota) {
      this.naoEncontrada.set(true);
      return;
    }

    this.id.set(nota.id);
    this.titulo.set(nota.titulo);
    this.conteudo.set(nota.conteudo);
  }

  salvar(): void {
    const notaId = this.id();
    const tituloTrim = this.titulo().trim();
    const conteudoTrim = this.conteudo().trim();

    if (!notaId) {
      return;
    }

    if (!tituloTrim || !conteudoTrim) {
      this.erro.set('Por favor, preencha o título e o conteúdo da anotação.');
      return;
    }

    this.notasService.atualizarNota(notaId, {
      titulo: tituloTrim,
      conteudo: conteudoTrim,
    });

    this.router.navigate(['/notas']);
  }

  cancelar(): void {
    this.router.navigate(['/notas']);
  }
}
