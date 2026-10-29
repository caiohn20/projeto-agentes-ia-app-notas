# Pesquisa Técnica: Integração com Supabase (Projeto Annotations)

- **Data**: 2026-10-28
- **Status**: Aprovado para Desenvolvimento
- **Origem**: Entrevista de Pesquisa de Projeto (`/project-research`)

---

## 1. Visão Geral & Problema a Resolver

Atualmente, o aplicativo Gerenciador de Anotações armazena as notas exclusivamente no `localStorage` do navegador do usuário através do `NotasService`. Essa abordagem limita a persistência à máquina/navegador local, sujeita à limpeza de cache e sem possibilidade de sincronização remota ou expansão colaborativa.

O objetivo desta funcionalidade é integrar o aplicativo ao **Supabase**, utilizando o projeto de nuvem já provisionado chamado **`annotations`** (`ygizvocqcznjcxxgmyha`), mantendo a reatividade com Signals do Angular 22, persistindo os dados de forma assíncrona na tabela remota `public.notas` e realizando a migração transparente dos dados que o usuário já possuir salvos localmente.

---

## 2. Requisitos Funcionais

- **[RF01] Injeção de Credenciais via `define`**: Configurar as constantes de conexão com o Supabase (`SUPABASE_URL` e `SUPABASE_ANON_KEY`) diretamente na opção `define` do construtor `@angular/build:application` no arquivo `angular.json`, garantindo segurança e evitando referências estáticas em arquivos de ambiente legados.
- **[RF02] Provedor do Cliente Supabase (`core`)**: Criar um serviço centralizado `SupabaseService` (com decorator `@Service()` de `@angular/core` e injeção via `inject()`) que instancia e exporta o client oficial `@supabase/supabase-js`.
- **[RF03] Identificação do Usuário por UUID Local**: Gerar e persistir um UUID v4 no `localStorage` (`app_notas_usuario_id`) no primeiro acesso, preenchendo o campo `usuarioId` em todas as inserções e filtrando as consultas por esse identificador.
- **[RF04] Migração Transparente do LocalStorage**: No primeiro carregamento, verificar se há dados na chave legada `app_notas_usuario`. Caso existam e a flag de migração ainda não esteja ativa, enviar as anotações para o Supabase e registrar a migração como concluída.
- **[RF05] CRUD Remoto Assíncrono com Signals**:
  - **Listar**: Carregar notas do Supabase ordenadas por `dataCriacao DESC` e armazená-las no signal `notasState`.
  - **Adicionar**: Inserir nova nota no Supabase com `id` (UUID), `titulo`, `conteudo`, `dataCriacao` e `usuarioId`.
  - **Atualizar**: Atualizar os campos `titulo` e `conteudo` no Supabase por `id`.
  - **Remover**: Excluir a nota no Supabase por `id` após confirmação no modal.
- **[RF06] Estados de Feedback (Loading e Erro)**:
  - Expor signals `carregando = computed(...)` e `erro = computed(...)` no `NotasService`.
  - Exibir skeletons do daisyUI na listagem de cards durante a busca inicial.
  - Exibir feedback visual de processamento nos botões de salvar e excluir.
  - Exibir alerta (`alert alert-error`) com opção de repetição caso ocorra falha de comunicação com o Supabase.

---

## 3. Fora de Escopo (Não-Requisitos)

- Autenticação e telas de Login/Cadastro via Supabase Auth (será implementado em uma fase futura).
- Sincronização em tempo real via WebSockets (`supabase.channel` / Realtime).
- Upload de anexos e mídias via Supabase Storage.
- Políticas de RLS avançadas por JWT de usuário autenticado (a política atual permissiva `ALL` para `public` atende a esta etapa inicial).

---

## 4. Arquitetura & Stack Técnica

### Matriz de Camadas e Responsabilidades (`src/AGENTS.md`)

```text
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── supabase.service.ts         # [Core] Instanciação do SupabaseClient com inject()
│   │   └── tokens/
│   │       ├── local-storage.token.ts      # [Core] InjectionToken para localStorage
│   │       └── supabase-config.token.ts    # [Core] Token de injeção para URL e Anon Key
│   ├── shared/
│   │   └── models/
│   │       └── nota.ts                     # [Shared] Interface da entidade Nota
│   └── features/
│       └── notas/
│           ├── services/
│           │   └── notas.service.ts        # [Feature] Consome SupabaseService, mantém Signals reativos
│           ├── components/
│           │   └── nota-card/              # [Feature] Card com Tailwind 4 e daisyUI 5
│           └── pages/
│               ├── listagem-notas/         # [Feature] Grid com skeletons e tratamento de erro
│               ├── nova-nota/              # [Feature] Formulário com estado assíncrono
│               └── editar-nota/            # [Feature] Formulário de edição com estado assíncrono
├── types/
│   └── env.d.ts                            # [Types] Declaração de tipos para constantes definidas via `define`
└── angular.json                            # [Config] Opção define no build target
```

### Detalhamento dos Componentes Técnicos

- **Dependência**: `@supabase/supabase-js` (versão estável mais recente via `npm`).
- **Configuração no `angular.json`**:
  ```json
  "options": {
    "define": {
      "process.env.SUPABASE_URL": "\"https://ygizvocqcznjcxxgmyha.supabase.co\"",
      "process.env.SUPABASE_ANON_KEY": "\"sb_publishable_1FD6yVzwAqA5F1JzZWMBRQ_OxlANBS-\""
    }
  }
  ```
- **Banco de Dados (Supabase `annotations`)**:
  - **Tabela**: `public.notas`
  - **Campos**:
    - `id` (text, PK, UUID gerado)
    - `titulo` (text)
    - `conteudo` (text)
    - `dataCriacao` (timestamptz, padrão `now()`)
    - `usuarioId` (text)
  - **RLS**: Habilitado com política permissiva `Permitir todas as operacoes na tabela notas` aplicada para a role `public`.

---

## 5. Experiência do Usuário (UI/UX)

- **Listagem de Anotações (`/notas`)**:
  - Enquanto o signal `carregando()` for verdadeiro, o grid renderiza 3 cards estruturados com `skeleton` do daisyUI mantendo a proporção visual do layout.
  - Caso ocorra falha na conexão, exibe um `alert alert-error` contendo mensagem amigável e botão "Tentar Novamente".
  - Mantém o filtro de busca textual instantânea sobre as notas retornadas do banco.
- **Página de Criação (`/nova`)**:
  - Botão "Salvar" recebe indicador de carregamento (`loading loading-spinner`) e fica desabilitado durante o envio ao Supabase.
  - Após sucesso no `insert`, navega para a rota `/notas`.
- **Página de Edição (`/editar/:id`)**:
  - Exibe feedback de carregamento enquanto busca os dados da nota caso ela ainda não esteja em memória.
  - Botão "Salvar Alterações" bloqueado com spinner durante a requisição de `update`.
- **Exclusão de Nota**:
  - O modal de confirmação existente (`<dialog class="modal">`) desabilita o botão de remoção e exibe status de processamento durante a exclusão remota, fechando o modal imediatamente após o retorno.

---

## 6. Riscos, Restrições & Mitigações

| Risco / Incerteza | Impacto | Estratégia de Mitigação |
|---|---|---|
| Latência ou queda de conexão no Supabase | Médio | Gerenciar signals de erro e loading, fornecendo feedback claro na interface e opção de retry. |
| Inconsistência de formato nas datas entre PostgREST (`timestamptz`) e front-end | Baixo | Padronizar a leitura e gravação no formato ISO string (`toISOString()`). |
| Perda de notas já criadas localmente no browser | Alto | Implementar rotina de migração única no `NotasService` enviando dados legados do `localStorage` para a tabela remota. |
| Exposição de chaves sensíveis | Baixo | O `SUPABASE_ANON_KEY` é desenhado para uso público no front-end em conjunto com RLS. Service Role keys jamais serão expostas no build do cliente. |

---

## 7. Fases de Implementação & Próximos Passos

- [ ] **Fase 1: Preparação de Infraestrutura e Dependências**
  - Instalar `@supabase/supabase-js`.
  - Configurar a opção `define` no `angular.json` para as configurações do projeto `annotations`.
  - Criar tipagem `env.d.ts` para tipar as variáveis de build.
- [ ] **Fase 2: Camada Core do Supabase**
  - Criar `SupabaseConfigToken` em `src/app/core/tokens/supabase-config.token.ts`.
  - Implementar `SupabaseService` com `@Service()` em `src/app/core/services/supabase.service.ts`.
- [ ] **Fase 3: Refatoração do `NotasService` com Persistência Remota**
  - Criar gerador/leitor de `usuarioId` único persistido localmente.
  - Implementar métodos assíncronos (`listar`, `criar`, `atualizar`, `remover`) no Supabase.
  - Adicionar lógica de migração transparente do `localStorage`.
  - Gerenciar signals reativos `carregando` e `erro`.
- [ ] **Fase 4: Atualização da Interface (Skeletons, Estados e Ações)**
  - Atualizar `ListagemNotasComponent` com skeletons daisyUI e tratamento de erro.
  - Atualizar `NovaNotaComponent` e `EditarNotaComponent` com estados de submissão.
  - Atualizar modal de confirmação de exclusão com loading state.
- [ ] **Fase 5: Testes e Validação**
  - Validar compilação (`ng build`).
  - Executar testes unitários com mocks do `SupabaseService`.
  - Validar integração ponta a ponta com o banco remoto `annotations`.
