# Planejamento de Desenvolvimento: Integração com Supabase (Projeto Annotations)

- **Data**: 2026-10-28
- **Pesquisa de Origem**: `docs/researchs/2026-10-28-integracao-supabase-annotations.md`
- **Status**: Pronto para Implementação
- **Origem**: Planejamento de Projeto (`/project-planning`)

---

## 1. Resumo Executivo & Escopo

Este planejamento técnico orienta a substituição da camada de persistência local baseada em `localStorage` pela integração em nuvem com o **Supabase**, utilizando o projeto de banco de dados provisionado **`annotations`** (`ygizvocqcznjcxxgmyha`) e sua tabela `public.notas`.

A reatividade da aplicação será preservada através dos **Signals** do Angular 22 (`computed`, `signal`), provendo tratamento assíncrono completo com feedbacks visuais ricos (skeletons do daisyUI 5, spinners em botões e alertas de erro com reintento). Adicionalmente, o sistema garantirá a migração transparente e única das anotações existentes no armazenamento local para a tabela remota, vinculando-as a um UUID de usuário único gerado e persistido no navegador.

### Limites do Escopo
- **Dentro do Escopo**:
  - Injeção das credenciais do Supabase via constante de compilação `define` no `angular.json`.
  - Serviço singleton `SupabaseService` na camada `core`.
  - CRUD assíncrono completo em `public.notas` no `NotasService`.
  - Estados visuais de loading (skeletons) e erro na listagem de anotações.
  - Bloqueio com indicador de carregamento nas ações de criação, edição e exclusão.
  - Padronização do formulário de edição com Signal Forms (`@angular/forms/signals`).
  - Rotina de migração única dos dados legados locais.
- **Fora do Escopo**:
  - Supabase Auth (telas de Login/Cadastro).
  - Sincronização em tempo real via WebSockets (Supabase Realtime).
  - Armazenamento de anexos via Supabase Storage.
  - Políticas de RLS avançadas por JWT de usuário autenticado.

---

## 2. Arquitetura da Solução & Design Técnico

### Padrão Arquitetural
- **Reatividade com Signals**: O estado das notas é mantido em `notasState = signal<Nota[]>([])` no `NotasService`, expondo sinais computados somente leitura (`notas`, `totalNotas`, `carregando`, `erro`).
- **Arquitetura em Camadas (`core`, `shared`, `features`)**:
  - `core/`: Responsável pelo cliente do Supabase, tokens globais e contratos de infraestrutura.
  - `shared/`: Modelos de dados e interfaces compartilhadas.
  - `features/notas/`: Lógica de domínio, gerenciamento de estado das anotações e componentes visuais de tela.

### Modelos & Tipagens (TypeScript)

```typescript
// src/app/core/models/supabase-config.ts
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// src/app/shared/models/nota.ts
export interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  dataCriacao: string;
  usuarioId: string;
}

// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}
```

### Camada de Dados & Integrações
- **Injeção de Credenciais**:
  As chaves públicas são injetadas no construtor de build do Angular (`@angular/build:application`) via `define`:
  - `process.env.SUPABASE_URL`: `"https://ygizvocqcznjcxxgmyha.supabase.co"`
  - `process.env.SUPABASE_ANON_KEY`: `"sb_publishable_1FD6yVzwAqA5F1JzZWMBRQ_OxlANBS-"`
- **Token de Injeção**:
  `SUPABASE_CONFIG` instancia a configuração no escopo raiz usando a `factory` padrão.
- **Cliente Supabase**:
  Instanciado via `createClient(config.url, config.anonKey)` no singleton `SupabaseService`.
- **Tabela Remota (`public.notas`)**:
  - `id`: `text` (chave primária)
  - `titulo`: `text`
  - `conteudo`: `text`
  - `dataCriacao`: `timestamptz` (formato ISO 8601 string no cliente)
  - `usuarioId`: `text` (UUID gerado localmente em `app_notas_usuario_id`)

### Componentes Visuais (UI/UX com daisyUI 5 e Tailwind CSS v4)
- **Listagem (`ListagemNotasComponent`)**:
  - Durante `carregando() === true`: Exibe 3 cards com classe `skeleton` estruturados simulando o layout dos cards reais.
  - Em caso de falha de conexão (`erro() !== null`): Renderiza `alert alert-error` com mensagem clara e botão para acionar o método `recarregar()`.
  - No modal de confirmação de exclusão: Desabilita os botões e exibe `loading loading-spinner loading-xs` enquanto a deleção remota estiver em andamento.
- **Páginas de Formulário (`NovaNotaComponent` e `EditarNotaComponent`)**:
  - Botões de envio recebem a classe `loading loading-spinner loading-xs` e estado desabilitado durante as requisições assíncronas.
  - `EditarNotaComponent` refatorado para utilizar Signal Forms (`@angular/forms/signals`), alinhando-se às diretrizes arquiteturais de `src/AGENTS.md`.

---

## 3. Mapeamento de Arquivos

| Ação | Caminho do Arquivo | Descrição / Responsabilidade |
|---|---|---|
| `Modificar` | `package.json` | Adicionar dependência oficial `@supabase/supabase-js`. |
| `Modificar` | `angular.json` | Configurar opção `define` com a URL e Anon Key do Supabase no build. |
| `Criar` | `src/types/env.d.ts` | Declaração de tipos TypeScript para variáveis em `process.env`. |
| `Criar` | `src/app/core/models/supabase-config.ts` | Interface `SupabaseConfig` (princípio "Um arquivo, uma entidade"). |
| `Criar` | `src/app/core/tokens/supabase-config.token.ts` | `InjectionToken` com factory para fornecer as credenciais. |
| `Criar` | `src/app/core/services/supabase.service.ts` | Serviço Core singleton que inicializa e expõe o `SupabaseClient`. |
| `Modificar` | `src/app/features/notas/services/notas.service.ts` | Implementar CRUD assíncrono no Supabase, rotina de migração e signals de estado. |
| `Modificar` | `src/app/features/notas/pages/listagem-notas/listagem-notas.html` | Incluir skeletons daisyUI, alert de erro com retry e spinner no modal de remoção. |
| `Modificar` | `src/app/features/notas/pages/listagem-notas/listagem-notas.ts` | Expor signals `carregando`, `erro`, controle de retry e estado de remoção. |
| `Modificar` | `src/app/features/notas/pages/nova-nota/nova-nota.html` | Feedback de carregamento (spinner) no botão de salvar anotação. |
| `Modificar` | `src/app/features/notas/pages/nova-nota/nova-nota.ts` | Submissão assíncrona ao `NotasService` com signal `salvando`. |
| `Modificar` | `src/app/features/notas/pages/editar-nota/editar-nota.html` | Atualizar template para Signal Forms e feedback de salvamento com spinner. |
| `Modificar` | `src/app/features/notas/pages/editar-nota/editar-nota.ts` | Refatorar para Signal Forms (`@angular/forms/signals`) e submissão assíncrona. |
| `Modificar` | `src/app/features/notas/services/notas.service.spec.ts` | Atualizar testes unitários cobrindo o mock do `SupabaseService` e fluxos assíncronos. |

---

## 4. Estratégia de Testes & Validação

- **Testes Unitários (`npx ng test --watch=false`)**:
  - Mock de `SupabaseService` simulando respostas de sucesso e falha da API PostgREST.
  - Testes do `NotasService`:
    - Inicialização e carregamento assíncrono das anotações ordenadas por `dataCriacao`.
    - Criação de nova anotação vinculando o `usuarioId` correto.
    - Atualização parcial de título e conteúdo.
    - Remoção remota com atualização reativa do sinal `notas()`.
    - Execução idempotente da rotina de migração única a partir do `localStorage`.
- **Validação de Build de Produção (`npx ng build`)**:
  - Garantir ausência de erros de compilação, tipos TypeScript ou quebra de bundles do Angular 22.

---

## 5. Riscos Técnicos & Pontos de Atenção

| Ponto de Atenção | Impacto | Estratégia de Mitigação |
|---|---|---|
| Latência ou instabilidade de conexão no Supabase | Médio | Tratamento reativo com `carregando` e `erro`, fornecendo skeleton na interface e alerta com botão "Tentar Novamente". |
| Perda de notas já salvas localmente no navegador | Alto | Leitura da chave `app_notas_usuario` com envio em lote para o Supabase e registro na flag `app_notas_migracao_concluida`. |
| Diferença de fuso horário / formato em `timestamptz` | Baixo | Padronização no formato ISO string universal (`toISOString()`) tanto na gravação quanto na leitura. |
| Exposição indevida de chaves de API | Baixo | Uso exclusivo da chave pública (`anon key`), associada à política de RLS permissiva na tabela `public.notas`. Nenhuma Service Role é exposta no cliente. |

---

## 6. Micro Tarefas de Implementação (Task Breakdown para Agentes)

> **Instruções para Agentes**: Execute as micro tarefas sequencialmente, uma a uma. Marque como concluída `[x]` somente após verificar os critérios de aceite de cada item.

- [ ] **Micro Tarefa 01: Instalação da dependência `@supabase/supabase-js`**
  - **Objetivo**: Instalar o cliente oficial do Supabase para o ecossistema JavaScript/TypeScript.
  - **Arquivos-alvo**: `package.json`
  - **Dependências**: Nenhuma
  - **Passo a Passo**:
    1. Executar no terminal: `npm install @supabase/supabase-js`.
    2. Conferir a adição da dependência em `dependencies` no `package.json`.
  - **Critério de Aceite / Validação**: Executar `npm list @supabase/supabase-js` e obter retorno de sucesso sem erros de resolução de dependência.

- [ ] **Micro Tarefa 02: Configuração de variáveis de compilação no `angular.json` e tipagem global**
  - **Objetivo**: Injetar as credenciais do projeto `annotations` via opção `define` e criar a declaração de tipos para `process.env`.
  - **Arquivos-alvo**: `angular.json`, `src/types/env.d.ts`
  - **Dependências**: Micro Tarefa 01
  - **Passo a Passo**:
    1. Criar o arquivo `src/types/env.d.ts` declarando o namespace global `NodeJS.ProcessEnv` contendo `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
    2. Modificar `angular.json` na seção `projects.projeto-agentes-ia-app-notas.architect.build.options` adicionando a propriedade `define` com:
       - `process.env.SUPABASE_URL`: `"\"https://ygizvocqcznjcxxgmyha.supabase.co\""`
       - `process.env.SUPABASE_ANON_KEY`: `"\"sb_publishable_1FD6yVzwAqA5F1JzZWMBRQ_OxlANBS-\""`
  - **Critério de Aceite / Validação**: Executar `npx ng build` e confirmar que o build é executado normalmente reconhecendo as novas configurações.

- [ ] **Micro Tarefa 03: Criação do modelo `SupabaseConfig` e do token de injeção `SUPABASE_CONFIG`**
  - **Objetivo**: Estruturar o contrato de configuração e o InjectionToken para injeção de dependências do Supabase na camada `core`.
  - **Arquivos-alvo**: `src/app/core/models/supabase-config.ts`, `src/app/core/tokens/supabase-config.token.ts`
  - **Dependências**: Micro Tarefa 02
  - **Passo a Passo**:
    1. Criar `src/app/core/models/supabase-config.ts` exportando a interface `SupabaseConfig` com os campos `url: string` e `anonKey: string`.
    2. Criar `src/app/core/tokens/supabase-config.token.ts` exportando `SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('SUPABASE_CONFIG', { providedIn: 'root', factory: () => ({ url: process.env.SUPABASE_URL, anonKey: process.env.SUPABASE_ANON_KEY }) })`.
  - **Critério de Aceite / Validação**: Compilação sem erros via `npx ng build` atendendo à regra "Um arquivo, uma entidade".

- [ ] **Micro Tarefa 04: Implementação do serviço singleton `SupabaseService`**
  - **Objetivo**: Prover uma instância única e injetável do cliente Supabase para consumo nas features da aplicação.
  - **Arquivos-alvo**: `src/app/core/services/supabase.service.ts`
  - **Dependências**: Micro Tarefa 03
  - **Passo a Passo**:
    1. Criar `src/app/core/services/supabase.service.ts` com o decorator `@Service()` de `@angular/core`.
    2. Injetar `SUPABASE_CONFIG` através de `inject(SUPABASE_CONFIG)`.
    3. Inicializar e exportar a propriedade `readonly client: SupabaseClient = createClient(this.config.url, this.config.anonKey)`.
  - **Critério de Aceite / Validação**: Executar `npx ng build` e verificar ausência de erros na camada `core`.

- [ ] **Micro Tarefa 05: Refatoração do `NotasService`: Identificador de Usuário e Migração Legada**
  - **Objetivo**: Gerenciar a identificação única do usuário no navegador e efetuar a migração assíncrona única dos dados locais para a tabela remota `public.notas`.
  - **Arquivos-alvo**: `src/app/features/notas/services/notas.service.ts`
  - **Dependências**: Micro Tarefa 04
  - **Passo a Passo**:
    1. No `NotasService`, implementar a geração/obtenção do `usuarioId` persistido sob a chave `app_notas_usuario_id` no `LOCAL_STORAGE`.
    2. Implementar método privado `migrarDadosLegados()`: verificar se `app_notas_migracao_concluida` está definida; se não estiver e houver notas em `app_notas_usuario`, inseri-las no Supabase via `supabase.client.from('notas').insert(...)` associadas ao `usuarioId` atual e registrar `app_notas_migracao_concluida = 'true'`.
  - **Critério de Aceite / Validação**: Compilação com `npx ng build`.

- [ ] **Micro Tarefa 06: Refatoração do `NotasService`: CRUD Remoto Assíncrono e Signals de Estado**
  - **Objetivo**: Conectar as operações de consulta, criação, edição e exclusão de notas ao Supabase com signals reativos de carregamento e erro.
  - **Arquivos-alvo**: `src/app/features/notas/services/notas.service.ts`
  - **Dependências**: Micro Tarefa 05
  - **Passo a Passo**:
    1. Adicionar signals privados: `private readonly carregandoState = signal(false)` e `private readonly erroState = signal<string | null>(null)`.
    2. Expor leituras computadas: `readonly carregando = computed(() => this.carregandoState())` e `readonly erro = computed(() => this.erroState())`.
    3. Implementar `carregarNotas(): Promise<void>` realizando `select('*').eq('usuarioId', this.usuarioId).order('dataCriacao', { ascending: false })` e atualizando `notasState`.
    4. Implementar `adicionarNota(...)`, `atualizarNota(...)` e `removerNota(...)` como métodos assíncronos chamando o cliente Supabase e atualizando o signal interno `notasState`.
    5. Disparar `carregarNotas()` na inicialização do serviço.
  - **Critério de Aceite / Validação**: Compilação limpa com `npx ng build`.

- [ ] **Micro Tarefa 07: Atualização da Listagem (`ListagemNotasComponent` e Template)**
  - **Objetivo**: Renderizar skeletons daisyUI durante o carregamento, feedback de erro com botão de repetição e feedback no modal de exclusão.
  - **Arquivos-alvo**: `src/app/features/notas/pages/listagem-notas/listagem-notas.ts`, `src/app/features/notas/pages/listagem-notas/listagem-notas.html`
  - **Dependências**: Micro Tarefa 06
  - **Passo a Passo**:
    1. Em `ListagemNotasComponent`, conectar os signals `carregando = this.notasService.carregando`, `erro = this.notasService.erro`, adicionar o signal `removendo = signal(false)` e expor o método `recarregar()`.
    2. Em `listagem-notas.html`, adicionar bloco `@if (carregando())` exibindo 3 cards estruturados com classes `skeleton` do daisyUI 5.
    3. Adicionar bloco `@else if (erro())` renderizando um `alert alert-error` com botão para invocar `recarregar()`.
    4. No modal de exclusão, adicionar o spinner `loading loading-spinner loading-xs` no botão de confirmação e bloquear interação enquanto `removendo()` for verdadeiro.
  - **Critério de Aceite / Validação**: Executar `npx ng build` sem erros de template ou tipos.

- [ ] **Micro Tarefa 08: Atualização da Página de Criação (`NovaNotaComponent` e Template)**
  - **Objetivo**: Tratar a criação assíncrona no Supabase com indicador de carregamento e bloqueio no botão de salvar.
  - **Arquivos-alvo**: `src/app/features/notas/pages/nova-nota/nova-nota.ts`, `src/app/features/notas/pages/nova-nota/nova-nota.html`
  - **Dependências**: Micro Tarefa 06
  - **Passo a Passo**:
    1. Em `NovaNotaComponent`, criar o signal `salvando = signal(false)`.
    2. No método `salvar()`, definir `salvando.set(true)`, invocar `await this.notasService.adicionarNota(...)`, navegar para `/notas` e tratar eventuais falhas redefinindo o signal.
    3. No template `nova-nota.html`, desabilitar o botão quando `salvando()` for verdadeiro e exibir a classe `loading loading-spinner loading-xs`.
  - **Critério de Aceite / Validação**: Compilação com `npx ng build`.

- [ ] **Micro Tarefa 09: Refatoração da Página de Edição (`EditarNotaComponent` e Template)**
  - **Objetivo**: Padronizar formulário de edição com Signal Forms e adicionar feedback assíncrono durante atualização.
  - **Arquivos-alvo**: `src/app/features/notas/pages/editar-nota/editar-nota.ts`, `src/app/features/notas/pages/editar-nota/editar-nota.html`
  - **Dependências**: Micro Tarefa 06
  - **Passo a Passo**:
    1. Refatorar `EditarNotaComponent` substituindo `FormsModule` e `[(ngModel)]` por Signal Forms (`@angular/forms/signals` com `form()`, `[formField]` e `[formRoot]`), atendendo às diretrizes de `src/AGENTS.md`.
    2. Adicionar o signal `salvando = signal(false)`.
    3. No método `salvar()`, invocar assincronamente `await this.notasService.atualizarNota(...)`, redirecionando para `/notas` após a confirmação.
    4. No template `editar-nota.html`, adicionar `loading loading-spinner loading-xs` no botão durante o salvamento.
  - **Critério de Aceite / Validação**: Executar `npx ng build` e confirmar compilação do componente.

- [ ] **Micro Tarefa 10: Atualização dos Testes Unitários do `NotasService`**
  - **Objetivo**: Atualizar a suíte de testes unitários do serviço cobrindo o cliente Supabase mockado e cenários assíncronos.
  - **Arquivos-alvo**: `src/app/features/notas/services/notas.service.spec.ts`
  - **Dependências**: Micro Tarefa 06
  - **Passo a Passo**:
    1. Criar mock tipado para `SupabaseService` simulando as operações encadeadas `.from('notas').select(...)`, `.insert(...)`, `.update(...)` e `.delete(...)`.
    2. Configurar o `TestBed` fornecendo os mocks de `SupabaseService` e `LOCAL_STORAGE`.
    3. Implementar testes cobrindo: carregamento inicial assíncrono, adição de nova anotação, atualização, exclusão e verificação da migração legada.
  - **Critério de Aceite / Validação**: Executar `npx ng test --watch=false` e obter 100% de sucesso nos testes.

- [ ] **Micro Tarefa 11: Validação Final e Integridade Geral do Projeto**
  - **Objetivo**: Garantir a integridade da aplicação em modo de produção e conformidade com as regras arquiteturais do repositório.
  - **Arquivos-alvo**: Todo o repositório
  - **Dependências**: Micro Tarefas 01 a 10
  - **Passo a Passo**:
    1. Executar `npx ng build` para garantir a geração dos artefatos de produção em `dist/`.
    2. Executar `npx ng test --watch=false` para validação de regressão na suíte de testes.
    3. Validar conformidade com as regras de `src/AGENTS.md` (Signal Forms, convenção de pastas `core`/`shared`/`features`, componentes semânticos daisyUI e ausência de `[(ngModel)]`).
  - **Critério de Aceite / Validação**: `ng build` e `ng test` executados com código de saída 0.
