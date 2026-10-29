import { Component, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-editar-nota',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './editar-nota.html',
})
export class EditarNotaComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notasService = inject(NotasService);

  readonly id = signal<string | null>(null);
  readonly erro = signal('');
  readonly naoEncontrada = signal(false);
  readonly salvando = signal(false);

  readonly notaModel = signal({
    titulo: '',
    conteudo: '',
  });

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

  constructor() {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (!paramId) {
      this.naoEncontrada.set(true);
      return;
    }

    this.id.set(paramId);

    const nota = this.notasService.obterNotaPorId(paramId);
    if (nota) {
      this.notaModel.set({
        titulo: nota.titulo,
        conteudo: nota.conteudo,
      });
    } else if (!this.notasService.carregando()) {
      this.naoEncontrada.set(true);
    }

    effect(() => {
      if (!this.notasService.carregando() && !this.naoEncontrada()) {
        const n = this.notasService.obterNotaPorId(paramId);
        if (!n) {
          this.naoEncontrada.set(true);
        } else if (!this.notaModel().titulo && !this.notaModel().conteudo) {
          this.notaModel.set({
            titulo: n.titulo,
            conteudo: n.conteudo,
          });
        }
      }
    });
  }

  async salvar(): Promise<void> {
    const notaId = this.id();
    if (!notaId || this.salvando()) {
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
      await this.notasService.atualizarNota(notaId, {
        titulo: tituloTrim,
        conteudo: conteudoTrim,
      });
      await this.router.navigate(['/notas']);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a anotação.';
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
