---
name: project-planning
description: Cria o planejamento de desenvolvimento estruturado a partir de um documento de pesquisa técnica (research). Conduz entrevista de alinhamento (uma pergunta por vez) se houver contexto faltante, gera micro tarefas atômicas para execução por agentes e salva o plano em docs/planning/. Use quando o usuário pedir para planejar o desenvolvimento, criar um plano de implementação a partir de um research, usar /project-planning ou solicitar o breakdown/micro tarefas de uma funcionalidade.
---

# Planejamento de Desenvolvimento (Project Planning)

Esta skill orienta o agente na conversão de um documento de pesquisa técnica (`docs/researchs/`) em um plano de desenvolvimento técnico estruturado, detalhado e acionável.

Ela atua como a ponte entre a fase de **Pesquisa** (`/project-research`) e a fase de **Implementação**, gerando um documento com arquitetura técnica e um catálogo final de **micro tarefas atômicas** prontas para serem desenvolvidas por agentes de forma autônoma.

---

## 🚫 REGRA DE OURO: ESCOPO ESTRITAMENTE DE PLANEJAMENTO

> **ATENÇÃO MÁXIMA:**
> Esta skill serve **EXCLUSIVAMENTE PARA PLANEJAR**.
> - Você **NÃO DEVE** realizar nenhuma edição de código-fonte (`.ts`, `.html`, `.css`, etc.).
> - Você **NÃO DEVE** criar arquivos de código no projeto.
> - Você **NÃO DEVE** iniciar nenhuma implementação ou executar scripts de scaffold/geração de componentes.
> 
> O seu escopo é **estritamente a análise técnica, entrevista de alinhamento e a geração do documento de planejamento** em `docs/planning/`.

---

## Fluxo de Trabalho (Workflow)

```
[1. Leitura do Research] ➔ [2. Diagnóstico & Entrevista (1 por vez)] ➔ [3. Design Técnico] ➔ [4. Decomposição em Micro Tarefas] ➔ [5. Confirmação & Salvamento]
```

### 1. Leitura e Análise da Pesquisa (Research)
1. Localize o arquivo de pesquisa correspondente dentro de `docs/researchs/`:
   - Se o usuário forneceu o caminho ou nome, leia-o diretamente.
   - Se o usuário não especificou, liste os arquivos em `docs/researchs/` e identifique a pesquisa mais recente ou pergunte qual utilizar.
2. Inspecione o ecossistema atual do repositório (arquitetura do Angular, convenções, componentes DaisyUI, Tailwind v4, rotas, services e tipagens existentes) para assegurar que o plano respeite o padrão do projeto.

### 2. Diagnóstico de Lacunas e Entrevista (Uma Pergunta por Vez)
Avalie se o documento de pesquisa e o contexto atual possuem todas as definições técnicas necessárias para a implementação (ex: contratos de tipos, nomes exatos de tabelas/colunas, validações de formulário, fluxos de erro/loading, bibliotecas auxiliares).

- **Se houver contexto faltando ou dúvidas técnicas:**
  - Faça perguntas ao usuário em formato de entrevista, **estritamente uma pergunta por vez**.
  - Não envie múltiplas perguntas no mesmo turno.
  - Toda pergunta deve incluir uma **recomendação técnica fundamentada**, permitindo ao usuário aprovar com um simples "Sim", "Aprovado" ou ajustar pontualmente:
    ```
    ❓ **Pergunta de Alinhamento**: [Descrição clara do contexto e da dúvida técnica]
    ➡️ **Recomendação**: [Decisão técnica sugerida baseada na stack e boas práticas]
    ```
  - Aguarde a resposta do usuário antes de formular a próxima pergunta.
- **Se o contexto já estiver 100% completo:** Avance diretamente para a elaboração do plano.

### 3. Elaboração do Plano Técnico de Arquitetura
Estruture a arquitetura da solução cobrindo:
- **Mapeamento de Arquivos**: Lista precisa de arquivos a criar, modificar ou refatorar (com caminhos relativos exatos).
- **Modelagem de Dados & Tipagens**: Definição de interfaces TypeScript, contratos de entrada/saída e estados.
- **Fluxo de Reatividade**: Uso de Signals, linkedSignal, computed, services ou httpResource.
- **Interface Visual**: Componentes DaisyUI necessários e classes de utilidade Tailwind CSS v4.

### 4. Decomposição em Micro Tarefas para Agentes
Ao final do planejamento, divida toda a implementação em **micro tarefas individuais**:
- **Granularidade Atômica**: Cada tarefa deve ser pequena o suficiente para que um agente consiga executá-la, testá-la e finalizá-la de forma independente em um único ciclo de execução.
- **Sequência Lógica**: Ordene as tarefas respeitando dependências (ex: tipos/modelos ➔ serviços/lógica ➔ componentes/UI ➔ testes/integração).
- **Critérios de Validação Claros**: Cada micro tarefa deve indicar como o agente comprova que a tarefa foi concluída com sucesso (ex: compilação `ng build`, teste passando, validação visual).

### 5. Confirmação Obrigatória e Salvamento do Arquivo
Quando o planejamento e as micro tarefas estiverem completamente prontos:
1. Apresente um resumo executivo da arquitetura e o checklist de micro tarefas na resposta.
2. **Pergunte explicitamente ao usuário**:
   > *"O planejamento está completo com todas as micro tarefas detalhadas. Posso salvar o documento em `docs/planning/[yyyy-MM-dd-nome-do-planejamento].md`?"*
3. **Nunca salve o arquivo sem a autorização prévia e expressa do usuário.**
4. Após a confirmação:
   - Garanta que a pasta `docs/planning/` exista.
   - Salve o arquivo seguindo rigorosamente o padrão: `yyyy-MM-dd-[nome-do-planejamento-em-kebab-case].md` (ex: `2026-10-27-autenticacao-e-perfil-de-usuario.md`).

---

## Template do Documento de Planejamento

O arquivo gerado em `docs/planning/` deve seguir este modelo estruturado:

```markdown
# Planejamento de Desenvolvimento: [Nome da Funcionalidade / Módulo]

- **Data**: yyyy-MM-dd
- **Pesquisa de Origem**: `docs/researchs/[nome-do-arquivo-de-pesquisa].md`
- **Status**: Pronto para Implementação
- **Origem**: Planejamento de Projeto (`/project-planning`)

---

## 1. Resumo Executivo & Escopo
[Breve resumo da funcionalidade a ser implementada, destacando os objetivos principais e os limites do escopo.]

## 2. Arquitetura da Solução & Design Técnico
- **Padrão Arquitetural**: [Ex: Signal-based reactivity, Standalone Components, Feature Services]
- **Modelos & Tipagens (TypeScript)**:
  ```typescript
  // Interfaces e types centrais
  ```
- **Camada de Dados & Integrações**: [APIs, queries, Supabase, endpoints, adapters]
- **Componentes Visuais (UI/UX)**: [Estrutura de componentes Angular + DaisyUI / Tailwind v4]

## 3. Mapeamento de Arquivos
| Ação | Caminho do Arquivo | Descrição / Responsabilidade |
|---|---|---|
| `Criar` | `src/app/...` | ... |
| `Modificar` | `src/app/...` | ... |

## 4. Estratégia de Testes & Validação
- **Testes Unitários / Integração**: [Serviços e componentes críticos a testar]
- **Comandos de Verificação**: `ng test`, `ng build`, etc.

## 5. Riscos Técnicos & Pontos de Atenção
| Ponto de Atenção | Impacto | Estratégia de Mitigação |
|---|---|---|
| ... | Médio / Alto | ... |

---

## 6. Micro Tarefas de Implementação (Task Breakdown para Agentes)

> **Instruções para Agentes**: Execute as micro tarefas sequencialmente, uma a uma. Marque como concluída `[x]` somente após verificar os critérios de aceite de cada item.

- [ ] **Micro Tarefa 01: [Título Descritivo]**
  - **Objetivo**: [O que deve ser feito]
  - **Arquivos-alvo**: `caminho/do/arquivo.ts`
  - **Dependências**: Nenhuma
  - **Passo a Passo**:
    1. ...
    2. ...
  - **Critério de Aceite / Validação**: [Como validar que está funcionando e concluído]

- [ ] **Micro Tarefa 02: [Título Descritivo]**
  - **Objetivo**: [O que deve ser feito]
  - **Arquivos-alvo**: `caminho/do/arquivo.ts`
  - **Dependências**: Micro Tarefa 01
  - **Passo a Passo**:
    1. ...
  - **Critério de Aceite / Validação**: [Critério específico de conclusão]

- [ ] **Micro Tarefa 03: [Título Descritivo]**
  - **Objetivo**: [O que deve ser feito]
  - **Arquivos-alvo**: `caminho/do/component.ts`, `caminho/do/component.html`
  - **Dependências**: Micro Tarefa 02
  - **Passo a Passo**:
    1. ...
  - **Critério de Aceite / Validação**: [Critério específico de conclusão]
```

---

## Anti-Padrões a Evitar

- ❌ **JAMAIS crie ou altere arquivos de código** do projeto durante a execução desta skill.
- ❌ **NÃO faça mais de uma pergunta por vez** caso falte contexto; sempre avance passo a passo na entrevista.
- ❌ **NÃO faça perguntas sem propor uma recomendação técnica clara**.
- ❌ **NÃO crie micro tarefas genéricas ou monolíticas** (ex: "Desenvolver frontend completo"). Divida em unidades atômicas.
- ❌ **NÃO salve o arquivo sem confirmação explícita do usuário**.
- ❌ **NÃO utilize barras invertidas (`\`)** nos caminhos de arquivo no Markdown.
