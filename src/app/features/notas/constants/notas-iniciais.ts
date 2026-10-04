import { Nota } from '../../../shared/models/nota';

export const NOTAS_INICIAIS: Nota[] = [
  {
    id: '1',
    titulo: 'Reunião de Alinhamento do Projeto',
    conteudo: 'Discutir a arquitetura da aplicação com a equipe, definindo as diretrizes de Angular 22, Tailwind CSS e gerenciamento de estado com Signals.',
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    usuarioId: 'usuario-1',
  },
  {
    id: '2',
    titulo: 'Ideias para o Design System',
    conteudo: 'Explorar componentes do daisyUI 5 combinados com a paleta semântica do Tailwind CSS 4 para garantir acessibilidade e responsividade.',
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    usuarioId: 'usuario-1',
  },
  {
    id: '3',
    titulo: 'Checklist de Boas Práticas',
    conteudo: '1. Um arquivo por entidade.\n2. Componentes com templateUrl.\n3. Injeção de dependências via inject().\n4. Reatividade pura com Signals.',
    dataCriacao: new Date().toISOString(),
    usuarioId: 'usuario-1',
  },
];
