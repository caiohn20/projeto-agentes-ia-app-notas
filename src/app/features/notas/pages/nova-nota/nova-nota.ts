import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-nova-nota',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './nova-nota.html',
})
export class NovaNotaComponent {
  private readonly router = inject(Router);
  private readonly notasService = inject(NotasService);

  readonly notaModel = signal({
    titulo: '',
    conteudo: '',
  });

  readonly erro = signal('');
  readonly salvando = signal(false);

  readonly notaForm = form(this.notaModel, (nota) => {
    required(nota.titulo, { message: 'Por favor, preencha o título da anotação.' });
    required(nota.conteudo, { message: 'Por favor, preencha o conteúdo da anotação.' });
    validate(nota.titulo, ({ value }) => {
      if (value().length > 0 && !value().trim()) {
        return { kind: 'blank', message: 'O título não pode ser composto apenas por espaços.' };
      }
      return undefined;
    });
    validate(nota.conteudo, ({ value }) => {
      if (value().length > 0 && !value().trim()) {
        return { kind: 'blank', message: 'O conteúdo não pode ser composto apenas por espaços.' };
      }
      return undefined;
    });
  });

  async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }

    if (this.notaForm().invalid()) {
      this.notaForm().markAsTouched();
      this.erro.set('Por favor, preencha o título e o conteúdo da anotação.');
      return;
    }

    const { titulo, conteudo } = this.notaModel();
    const tituloTrim = titulo.trim();
    const conteudoTrim = conteudo.trim();

    if (!tituloTrim || !conteudoTrim) {
      this.erro.set('Por favor, preencha o título e o conteúdo da anotação.');
      return;
    }

    this.erro.set('');
    this.salvando.set(true);

    try {
      await this.notasService.adicionarNota({
        titulo: tituloTrim,
        conteudo: conteudoTrim,
        usuarioId: this.notasService.usuarioId,
      });
      await this.router.navigate(['/notas']);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Ocorreu um erro ao salvar a anotação no servidor.';
      this.erro.set(mensagem);
    } finally {
      this.salvando.set(false);
    }
  }

  cancelar(): void {
    if (this.salvando()) {
      return;
    }
    void this.router.navigate(['/notas']);
  }
}
