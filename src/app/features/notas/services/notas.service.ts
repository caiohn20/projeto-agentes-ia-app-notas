import { Service, computed, inject, signal } from '@angular/core';
import { LOCAL_STORAGE } from '../../../core/tokens/local-storage.token';
import { Nota } from '../../../shared/models/nota';
import { NOTAS_INICIAIS } from '../constants/notas-iniciais';

@Service()
export class NotasService {
  private readonly storage = inject(LOCAL_STORAGE);
  private readonly chaveStorage = 'app_notas_usuario';

  private readonly notasState = signal<Nota[]>(this.inicializarNotas());
  readonly notas = computed(() => this.notasState());
  readonly totalNotas = computed(() => this.notasState().length);

  private inicializarNotas(): Nota[] {
    try {
      const dados = this.storage.getItem(this.chaveStorage);
      if (dados) {
        const notasSalvas = JSON.parse(dados) as Nota[];
        if (Array.isArray(notasSalvas) && notasSalvas.length > 0) {
          return notasSalvas;
        }
      }
    } catch {
      // Em caso de falha de parsing, usa o estado inicial
    }

    this.persistir(NOTAS_INICIAIS);
    return NOTAS_INICIAIS;
  }

  private persistir(notas: Nota[]): void {
    try {
      this.storage.setItem(this.chaveStorage, JSON.stringify(notas));
    } catch {
      // Ignora erros de quota ou armazenamento indisponível
    }
  }

  removerNota(id: string): void {
    this.notasState.update((notas) => {
      const atualizadas = notas.filter((nota) => nota.id !== id);
      this.persistir(atualizadas);
      return atualizadas;
    });
  }

  adicionarNota(dados: Omit<Nota, 'id' | 'dataCriacao'>): void {
    const novaNota: Nota = {
      ...dados,
      id: crypto.randomUUID(),
      dataCriacao: new Date().toISOString(),
    };

    this.notasState.update((notas) => {
      const atualizadas = [novaNota, ...notas];
      this.persistir(atualizadas);
      return atualizadas;
    });
  }

  obterNotaPorId(id: string): Nota | undefined {
    return this.notasState().find((nota) => nota.id === id);
  }

  atualizarNota(id: string, dados: Partial<Omit<Nota, 'id' | 'dataCriacao'>>): boolean {
    let alterou = false;
    this.notasState.update((notas) => {
      const atualizadas = notas.map((nota) => {
        if (nota.id === id) {
          alterou = true;
          return {
            ...nota,
            ...dados,
          };
        }
        return nota;
      });
      if (alterou) {
        this.persistir(atualizadas);
      }
      return atualizadas;
    });
    return alterou;
  }
}
