import { TestBed } from '@angular/core/testing';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LOCAL_STORAGE } from '../../../core/tokens/local-storage.token';
import { Nota } from '../../../shared/models/nota';
import { NotasService } from './notas.service';

describe('NotasService', () => {
  let service: NotasService;
  let mockStorage: Record<string, string>;
  let mockNotasDb: Nota[];

  beforeEach(() => {
    mockStorage = {};
    mockNotasDb = [
      {
        id: 'nota-1',
        titulo: 'Nota Inicial',
        conteudo: 'Conteúdo Inicial',
        dataCriacao: new Date().toISOString(),
        usuarioId: 'user-teste-123',
      },
    ];

    const storageMock: Storage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (index: number) => Object.keys(mockStorage)[index] ?? null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    let pendingUpdate: Partial<Nota> | null = null;
    let pendingDelete = false;
    let targetId: string | null = null;

    const createChain = () => {
      const chain = {
        select: () => chain,
        order: async () => ({
          data: [...mockNotasDb],
          error: null,
        }),
        insert: async (records: Nota[]) => {
          mockNotasDb.push(...records);
          return { data: records, error: null };
        },
        update: (dados: Partial<Nota>) => {
          pendingUpdate = dados;
          return chain;
        },
        delete: () => {
          pendingDelete = true;
          return chain;
        },
        eq: (col: string, val: string) => {
          if (col === 'id') {
            targetId = val;
          }
          return chain;
        },
        then: (resolve: (val: unknown) => void) => {
          if (pendingUpdate && targetId) {
            const index = mockNotasDb.findIndex((n) => n.id === targetId);
            if (index !== -1) {
              mockNotasDb[index] = { ...mockNotasDb[index], ...pendingUpdate };
            }
            pendingUpdate = null;
            targetId = null;
            return resolve({ data: null, error: null });
          }
          if (pendingDelete && targetId) {
            mockNotasDb = mockNotasDb.filter((n) => n.id !== targetId);
            pendingDelete = false;
            targetId = null;
            return resolve({ data: null, error: null });
          }
          return resolve({ data: [...mockNotasDb], error: null });
        },
      };
      return chain;
    };

    const mockSupabaseService = {
      client: {
        from: (_table: string) => createChain(),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        NotasService,
        { provide: LOCAL_STORAGE, useValue: storageMock },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    service = TestBed.inject(NotasService);
  });

  it('deve inicializar e carregar notas do Supabase', async () => {
    await service.carregarNotas();
    expect(service.notas().length).toBe(1);
    expect(service.carregando()).toBe(false);
    expect(service.erro()).toBeNull();
    expect(mockStorage['app_notas_usuario_id']).toBeDefined();
  });

  it('deve adicionar uma nova nota via Supabase e atualizar o signal', async () => {
    await service.carregarNotas();
    const totalInicial = service.totalNotas();

    await service.adicionarNota({
      titulo: 'Nova Anotação de Teste',
      conteudo: 'Conteúdo de teste',
      usuarioId: service.usuarioId,
    });

    expect(service.totalNotas()).toBe(totalInicial + 1);
    const primeiraNota = service.notas()[0];
    expect(primeiraNota.titulo).toBe('Nova Anotação de Teste');
    expect(mockNotasDb.some((n) => n.titulo === 'Nova Anotação de Teste')).toBe(true);
  });

  it('deve atualizar uma nota existente no Supabase e no signal', async () => {
    await service.carregarNotas();
    const nota = service.notas()[0];

    const sucesso = await service.atualizarNota(nota.id, {
      titulo: 'Título Atualizado',
      conteudo: 'Conteúdo Atualizado',
    });

    expect(sucesso).toBe(true);
    const notaAtualizada = service.obterNotaPorId(nota.id);
    expect(notaAtualizada?.titulo).toBe('Título Atualizado');
    expect(mockNotasDb.find((n) => n.id === nota.id)?.titulo).toBe('Título Atualizado');
  });

  it('deve remover uma nota no Supabase e atualizar o signal', async () => {
    await service.carregarNotas();
    const totalInicial = service.totalNotas();
    const idParaRemover = service.notas()[0].id;

    const sucesso = await service.removerNota(idParaRemover);

    expect(sucesso).toBe(true);
    expect(service.totalNotas()).toBe(totalInicial - 1);
    expect(service.obterNotaPorId(idParaRemover)).toBeUndefined();
    expect(mockNotasDb.find((n) => n.id === idParaRemover)).toBeUndefined();
  });

  it('deve migrar notas legadas do localStorage para o Supabase de forma idempotente', async () => {
    // Configura notas legadas no storage
    const notasLegadas: Nota[] = [
      {
        id: 'legada-1',
        titulo: 'Nota Legada Local',
        conteudo: 'Conteúdo Legado',
        dataCriacao: new Date().toISOString(),
        usuarioId: 'legado',
      },
    ];
    mockStorage['app_notas_usuario'] = JSON.stringify(notasLegadas);
    delete mockStorage['app_notas_migracao_concluida'];

    // Instancia um novo serviço para acionar a rotina de inicialização/migração
    TestBed.resetTestingModule();

    let pendingUpdate: Partial<Nota> | null = null;
    let pendingDelete = false;
    let targetId: string | null = null;

    const createChain = () => {
      const chain = {
        select: () => chain,
        order: async () => ({
          data: [...mockNotasDb],
          error: null,
        }),
        insert: async (records: Nota[]) => {
          mockNotasDb.push(...records);
          return { data: records, error: null };
        },
        update: (dados: Partial<Nota>) => {
          pendingUpdate = dados;
          return chain;
        },
        delete: () => {
          pendingDelete = true;
          return chain;
        },
        eq: (col: string, val: string) => {
          if (col === 'id') {
            targetId = val;
          }
          return chain;
        },
        then: (resolve: (val: unknown) => void) => {
          if (pendingUpdate && targetId) {
            const index = mockNotasDb.findIndex((n) => n.id === targetId);
            if (index !== -1) {
              mockNotasDb[index] = { ...mockNotasDb[index], ...pendingUpdate };
            }
            pendingUpdate = null;
            targetId = null;
            return resolve({ data: null, error: null });
          }
          if (pendingDelete && targetId) {
            mockNotasDb = mockNotasDb.filter((n) => n.id !== targetId);
            pendingDelete = false;
            targetId = null;
            return resolve({ data: null, error: null });
          }
          return resolve({ data: [...mockNotasDb], error: null });
        },
      };
      return chain;
    };

    const mockSupabaseService = {
      client: {
        from: (_table: string) => createChain(),
      },
    };

    const storageMock: Storage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (index: number) => Object.keys(mockStorage)[index] ?? null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        NotasService,
        { provide: LOCAL_STORAGE, useValue: storageMock },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    const novoService = TestBed.inject(NotasService);
    // Aguarda o processamento de migração e carregamento
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockStorage['app_notas_migracao_concluida']).toBe('true');
    expect(mockNotasDb.some((n) => n.titulo === 'Nota Legada Local')).toBe(true);
    expect(novoService.usuarioId).toBeDefined();
  });
});
