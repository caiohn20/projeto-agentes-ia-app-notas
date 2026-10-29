import { Service, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LOCAL_STORAGE } from '../../../core/tokens/local-storage.token';
import { Nota } from '../../../shared/models/nota';

@Service()
export class NotasService {
  private readonly storage = inject(LOCAL_STORAGE);
  private readonly supabase = inject(SupabaseService);

  private readonly chaveUsuarioId = 'app_notas_usuario_id';
  private readonly chaveMigracao = 'app_notas_migracao_concluida';
  private readonly chaveStorage = 'app_notas_usuario';

  readonly usuarioId: string = this.obterOuCriarUsuarioId();

  private readonly notasState = signal<Nota[]>([]);
  private readonly carregandoState = signal(true);
  private readonly erroState = signal<string | null>(null);

  readonly notas = computed(() => this.notasState());
  readonly totalNotas = computed(() => this.notasState().length);
  readonly carregando = computed(() => this.carregandoState());
  readonly erro = computed(() => this.erroState());

  constructor() {
    void this.inicializar();
  }

  private async inicializar(): Promise<void> {
    await this.migrarDadosLegados();
    await this.carregarNotas();
  }

  private obterOuCriarUsuarioId(): string {
    try {
      const idSalvo = this.storage.getItem(this.chaveUsuarioId);
      if (idSalvo) {
        return idSalvo;
      }
      const novoId = crypto.randomUUID();
      this.storage.setItem(this.chaveUsuarioId, novoId);
      return novoId;
    } catch {
      return crypto.randomUUID();
    }
  }

  private async migrarDadosLegados(): Promise<void> {
    try {
      const jaMigrado = this.storage.getItem(this.chaveMigracao);
      if (jaMigrado === 'true') {
        return;
      }

      const dadosLocais = this.storage.getItem(this.chaveStorage);
      if (dadosLocais) {
        const notasLegadas = JSON.parse(dadosLocais) as Nota[];
        if (Array.isArray(notasLegadas) && notasLegadas.length > 0) {
          const notasFormatadas = notasLegadas.map((nota) => ({
            id: nota.id ?? crypto.randomUUID(),
            titulo: nota.titulo,
            conteudo: nota.conteudo,
            dataCriacao: nota.dataCriacao ?? new Date().toISOString(),
            usuarioId: this.usuarioId,
          }));

          await this.supabase.client.from('notas').insert(notasFormatadas);
        }
      }

      this.storage.setItem(this.chaveMigracao, 'true');
    } catch {
      // Ignora falhas temporárias na migração para não bloquear a inicialização
    }
  }

  async carregarNotas(): Promise<void> {
    this.carregandoState.set(true);
    this.erroState.set(null);

    try {
      const { data, error } = await this.supabase.client
        .from('notas')
        .select('*')
        .eq('usuarioId', this.usuarioId)
        .order('dataCriacao', { ascending: false });

      if (error) {
        throw error;
      }

      this.notasState.set((data as Nota[]) ?? []);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Não foi possível carregar as anotações do servidor.';
      this.erroState.set(mensagem);
    } finally {
      this.carregandoState.set(false);
    }
  }

  async adicionarNota(dados: Omit<Nota, 'id' | 'dataCriacao'>): Promise<Nota> {
    const novaNota: Nota = {
      ...dados,
      id: crypto.randomUUID(),
      dataCriacao: new Date().toISOString(),
      usuarioId: this.usuarioId,
    };

    const { error } = await this.supabase.client.from('notas').insert([novaNota]);

    if (error) {
      throw error;
    }

    this.notasState.update((notas) => [novaNota, ...notas]);
    return novaNota;
  }

  obterNotaPorId(id: string): Nota | undefined {
    return this.notasState().find((nota) => nota.id === id);
  }

  async atualizarNota(
    id: string,
    dados: Partial<Omit<Nota, 'id' | 'dataCriacao'>>,
  ): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('notas')
      .update(dados)
      .eq('id', id)
      .eq('usuarioId', this.usuarioId);

    if (error) {
      throw error;
    }

    this.notasState.update((notas) =>
      notas.map((nota) => (nota.id === id ? { ...nota, ...dados } : nota)),
    );
    return true;
  }

  async removerNota(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('notas')
      .delete()
      .eq('id', id)
      .eq('usuarioId', this.usuarioId);

    if (error) {
      throw error;
    }

    this.notasState.update((notas) => notas.filter((nota) => nota.id !== id));
    return true;
  }
}
