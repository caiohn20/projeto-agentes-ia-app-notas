import { TestBed } from '@angular/core/testing';
import { NotasService } from './notas.service';
import { LOCAL_STORAGE } from '../../../core/tokens/local-storage.token';

describe('NotasService', () => {
  let service: NotasService;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
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
      ],
    });

    service = TestBed.inject(NotasService);
  });

  it('deve inicializar com notas padrão quando o storage estiver vazio', () => {
    expect(service.notas().length).toBeGreaterThan(0);
    expect(mockStorage['app_notas_usuario']).toBeDefined();
  });

  it('deve adicionar uma nova nota e persistir no storage', () => {
    const totalInicial = service.totalNotas();
    service.adicionarNota({
      titulo: 'Nova Anotação de Teste',
      conteudo: 'Conteúdo de teste',
      usuarioId: 'usuario-1',
    });

    expect(service.totalNotas()).toBe(totalInicial + 1);
    const primeiraNota = service.notas()[0];
    expect(primeiraNota.titulo).toBe('Nova Anotação de Teste');
    expect(mockStorage['app_notas_usuario']).toContain('Nova Anotação de Teste');
  });

  it('deve atualizar uma nota existente e persistir no storage', () => {
    const nota = service.notas()[0];
    const sucesso = service.atualizarNota(nota.id, {
      titulo: 'Título Atualizado',
      conteudo: 'Conteúdo Atualizado',
    });

    expect(sucesso).toBe(true);
    const notaAtualizada = service.obterNotaPorId(nota.id);
    expect(notaAtualizada?.titulo).toBe('Título Atualizado');
    expect(mockStorage['app_notas_usuario']).toContain('Título Atualizado');
  });

  it('deve remover uma nota e atualizar o storage', () => {
    const totalInicial = service.totalNotas();
    const idParaRemover = service.notas()[0].id;

    service.removerNota(idParaRemover);

    expect(service.totalNotas()).toBe(totalInicial - 1);
    expect(service.obterNotaPorId(idParaRemover)).toBeUndefined();
  });
});
