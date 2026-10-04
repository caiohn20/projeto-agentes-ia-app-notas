import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-nova-nota',
  imports: [FormsModule, RouterLink],
  templateUrl: './nova-nota.html',
})
export class NovaNotaComponent {
  private readonly router = inject(Router);
  private readonly notasService = inject(NotasService);

  readonly titulo = signal('');
  readonly conteudo = signal('');
  readonly erro = signal('');

  readonly formularioValido = computed(
    () => this.titulo().trim().length > 0 && this.conteudo().trim().length > 0,
  );

  salvar(): void {
    const tituloTrim = this.titulo().trim();
    const conteudoTrim = this.conteudo().trim();

    if (!tituloTrim || !conteudoTrim) {
      this.erro.set('Por favor, preencha o título e o conteúdo da anotação.');
      return;
    }

    this.notasService.adicionarNota({
      titulo: tituloTrim,
      conteudo: conteudoTrim,
      usuarioId: 'usuario-1',
    });

    this.router.navigate(['/notas']);
  }

  cancelar(): void {
    this.router.navigate(['/notas']);
  }
}
