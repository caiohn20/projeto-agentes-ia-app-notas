# Plano de Implementação — Módulo de Anotações com Gerenciamento de Estado

Este documento detalha o plano arquitetural, as etapas executadas e os padrões aplicados na criação e manutenção do módulo de anotações (listagem, criação e edição) com gerenciamento de estado da aplicação.

---

## 1. Visão Geral e Objetivo

- **Objetivo**: Prover uma solução completa para gerenciamento de anotações do usuário, contemplando:
  - Listagem reativa com busca instantânea e contadores;
  - Apresentação em cards responsivos com daisyUI e Tailwind CSS;
  - Confirmação de exclusão via modal sem recarregamento de página;
  - Criação de nova anotação em página dedicada (`/nova`);
  - Edição de anotação existente em página dedicada (`/editar/:id`).
- **Stack Tecnológica**:
  - **Angular 22**: Reatividade nativa com Signals (`signal`, `computed`, `input`, `output`), `@Service()`, `inject()` e novo Control Flow (`@if`, `@for ... track`).
  - **Tailwind CSS 4**: Layout em grid/flex, espaçamentos utilitários e tipografia responsiva.
  - **daisyUI 5**: Componentes visuais semânticos (`card`, `btn`, `modal`, `badge`, `input`, `textarea`, `alert`).
  - **TypeScript 6**: Tipagem estrita com regra de *um arquivo, uma entidade*.

---

## 2. Arquitetura em Camadas (Core, Shared e Features)

A distribuição dos arquivos respeita estritamente o isolamento de escopos:

```text
src/app/
├── core/
│   └── tokens/
│       └── local-storage.token.ts          # [Core] InjectionToken para abstrair o window.localStorage
├── shared/
│   └── models/
│       └── nota.ts                         # [Shared] Interface única do modelo de Nota
└── features/
    └── notas/
        ├── constants/
        │   └── notas-iniciais.ts           # [Feature] Mock de dados padrão para inicialização
        ├── services/
        │   └── notas.service.ts            # [Feature] Gerenciamento de estado global da feature com Signals
        ├── components/
        │   └── nota-card/                  # [Feature] Componente de apresentação do card individual
        │       ├── nota-card.ts
        │       └── nota-card.html
        ├── pages/
        │   ├── listagem-notas/             # [Feature] Página principal da listagem (Smart Component)
        │   │   ├── listagem-notas.ts
        │   │   ├── listagem-notas.html
        │   │   └── plano-implementacao.md  # [Documento] Plano arquitetural desta implementação
        │   ├── nova-nota/                  # [Feature] Página dedicada para criação de anotação
        │   │   ├── nova-nota.ts
        │   │   └── nova-nota.html
        │   └── editar-nota/                # [Feature] Página dedicada para edição de anotação
        │       ├── editar-nota.ts
        │       └── editar-nota.html
        └── notas.routes.ts                 # [Feature] Configuração de rotas e lazy loading
```

---

## 3. Detalhamento das Etapas e Componentes

### 3.1. Abstração de Recursos Globais (`core/tokens/local-storage.token.ts`)
- **Regra**: Nunca acessar APIs globais (`window`, `localStorage`) diretamente.
- **Implementação**: `InjectionToken<Storage>` configurado com `providedIn: 'root'`, contendo fallback seguro para ambientes não-navegador (SSR/testes).

### 3.2. Modelo de Dados (`shared/models/nota.ts`)
- **Regra**: Um arquivo, uma entidade.
- **Campos**:
  - `id: string`
  - `titulo: string`
  - `conteudo: string`
  - `dataCriacao: string` (ISO format)
  - `usuarioId: string`

### 3.3. Gerenciamento de Estado Reativo (`NotasService`)
- **Decorator**: `@Service()` de `@angular/core`.
- **Injeção**: Dependências resolvidas via `inject(LOCAL_STORAGE)`.
- **Estado Interno**: `notasState = signal<Nota[]>(...)` mantido privado.
- **Exposição Segura**:
  - Leitura reativa via `readonly notas = computed(() => this.notasState())`.
  - Métrica derivada via `readonly totalNotas = computed(() => this.notasState().length)`.
- **Ações Disponíveis**:
  - `removerNota(id: string)`: Atualização imutável com `.update()` e sincronização no storage.
  - `adicionarNota(dados)`: Criação com ID único (`crypto.randomUUID()`) e persistência.
  - `atualizarNota(id: string, dados)`: Atualização imutável dos campos da nota e sincronização.
  - `obterNotaPorId(id: string)`: Consulta pontual para navegação e preenchimento na edição.

### 3.4. Componente de Apresentação (`NotaCardComponent`)
- **Estrutura**: Separada em `nota-card.ts` e `nota-card.html` (`templateUrl`).
- **Inputs & Outputs**:
  - `readonly nota = input.required<Nota>()`
  - `readonly remover = output<string>()`
- **UI (daisyUI 5 & Tailwind 4)**:
  - Card estilizado com `card bg-base-100 shadow-sm border border-base-200`.
  - Botão de edição redirecionando para `['/editar', nota().id]`.
  - Botão de remoção acionando o evento `remover.emit(nota().id)`.

### 3.5. Componente de Listagem (`ListagemNotasComponent`)
- **Reatividade e Filtros**:
  - `termoBusca = signal('')`: Ligado bidirecionalmente ao campo de busca via `[(ngModel)]="termoBusca"`.
  - `notasFiltradas = computed(...)`: Filtro dinâmico e em tempo real sobre títulos e conteúdos.
- **Modal de Confirmação**:
  - `modalAberto = signal(false)` e `idParaRemover = signal<string | null>(null)`.
  - `notaParaRemover = computed(...)`: Computa a nota selecionada para exibir o título no corpo do modal.
  - Implementado com `<dialog class="modal" [class.modal-open]="modalAberto()">` do daisyUI.
- **Layout Conforme Diretrizes**:
  - Topo com contagem de anotações e botão em destaque "Adicionar Anotação" apontando para a rota `/nova`.
  - Input de busca textual com botão para limpar pesquisa instantaneamente.
  - Grid responsivo (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - Empty state contextualizado para busca sem resultados ou ausência total de anotações.

### 3.6. Página de Criação (`NovaNotaComponent`)
- **Rota**: `/nova` (e `/notas/nova`).
- **Comportamento**:
  - Página dedicada com rota própria conforme diretriz de layout.
  - Signals para `titulo`, `conteudo`, `erro` e `formularioValido = computed(...)`.
  - Two-way binding direto com `[(ngModel)]`.
  - Validação de preenchimento obrigatório com feedback amigável via alert daisyUI.
  - Ao salvar, invoca `notasService.adicionarNota()` e redireciona para a listagem (`/notas`).

### 3.7. Página de Edição (`EditarNotaComponent`)
- **Rota**: `/editar/:id` (e `/notas/editar/:id`).
- **Comportamento**:
  - Página dedicada com rota própria e carregamento lazy.
  - Captura o `id` da rota via `ActivatedRoute` e busca a nota no `NotasService`.
  - Caso o registro não exista, exibe card informativo amigável com botão de retorno.
  - Pré-carrega `titulo` e `conteudo` em Signals com `[(ngModel)]`.
  - Ao salvar, invoca `notasService.atualizarNota()` e redireciona para a listagem (`/notas`).

### 3.8. Roteamento e Shell da Aplicação
- **Lazy Loading**: `app.routes.ts` e `notas.routes.ts` carregam `ListagemNotasComponent`, `NovaNotaComponent` e `EditarNotaComponent` via `loadComponent` e `loadChildren`.
- **App Shell (`app.html` & `app.ts`)**:
  - Header fixo com título institucional no topo.
  - Container responsivo centralizado `<main class="container mx-auto max-w-5xl px-4 py-8 flex-1">` contendo o `<router-outlet />`.

---

## 4. Conformidade com as Diretrizes do Projeto

| Diretriz | Status | Aplicação |
|---|:---:|---|
| **Signals & Computed** | ✅ | `signal()` para estado e formulários, `computed()` para leitura derivada e validação |
| **Control Flow Nativo** | ✅ | Utilização exclusiva de `@if` e `@for (... track nota.id)` |
| **Templates Externos** | ✅ | Uso obrigatório de `templateUrl` em `.html` separados |
| **Two-way Data Binding** | ✅ | `[(ngModel)]` direto nos Signals de formulários e busca |
| **Um arquivo por entidade**| ✅ | Modelos, tokens, constantes, serviços e componentes em arquivos individuais |
| **Tokens do daisyUI / Tailwind** | ✅ | Utilização de `card`, `btn`, `modal`, `textarea`, `input`, `badge`, `alert` sem cores fixas |
| **Modal de Exclusão** | ✅ | Confirmação explícita antes de qualquer remoção de anotação |
| **Rotas Dedicadas (Criação/Edição)**| ✅ | Páginas dedicadas `/nova` e `/editar/:id` em vez de inline/modal |

---

## 5. Próximos Passos Planejados

1. **Feedback Visual com Notificações (Toast)**:
   - Implementar componente de Toast do daisyUI para alertar sucesso na criação, edição e exclusão.
2. **Categorização e Tags**:
   - Permitir associar categorias ou tags coloridas às anotações.
3. **Ordenação Dinâmica**:
   - Opção para ordenar por data de criação (mais recentes/mais antigas) ou alfabética.
