---
name: project-research
description: Conduz uma entrevista estruturada de pesquisa (research) com o usuário para aprofundar e coletar todos os requisitos de uma nova funcionalidade ou sistema a ser desenvolvido, salvando um relatório técnico em docs/researchs/. Use quando o usuário pedir para pesquisar algo para desenvolver, planejar uma funcionalidade, usar /project-research ou solicitar um deep research/PRD de projeto.
---

# Pesquisa de Projeto & Funcionalidades (Project Research)

Esta skill orienta o agente na condução de uma entrevista estruturada ("research interview") para extrair e consolidar todos os requisitos, contexto de negócio, decisões técnicas e arquitetura antes de iniciar o desenvolvimento de algo novo.

Ao final da entrevista, consolida os resultados em um documento técnico completo e solicita permissão para salvá-lo em `docs/researchs/yyyy-MM-dd-[nome-da-pesquisa].md`.

---

## Fluxo de Trabalho (Workflow)

```
[1. Entendimento Inicial] ➔ [2. Rodadas de Entrevista] ➔ [3. Enriquecimento Técnico] ➔ [4. Confirmação do Usuário] ➔ [5. Salvamento do Arquivo]
```

### 1. Entendimento Inicial e Diagnóstico de Fatos
1. Identifique o tema ou funcionalidade que o usuário deseja desenvolver.
2. Inspecione o ambiente e o repositório (arquitetura atual, dependências em `package.json`, bibliotecas instaladas, convenções de código) sem perguntar ao usuário nada que já possa ser descoberto pelo próprio agente.
3. Se o usuário já tiver fornecido detalhes suficientes sobre certos tópicos no prompt inicial, **não pergunte novamente** o que já foi respondido.

### 2. Rodadas de Entrevista (Interview Frontier)
Conduza a entrevista em **rodadas estruturadas**. Não sobrecarregue com perguntas soltas; agrupe por dimensões e **sempre forneça uma resposta recomendada** baseada no contexto do projeto e boas práticas.

Formato recomendado para cada pergunta:
```
❓ **Q[N]** - **[Título da Pergunta]**: [Contexto e pergunta clara com alternativas se aplicável]
➡️ **Recomendação**: [Sugestão técnica ou de produto fundamentada]
```

#### Dimensões essenciais para cobrir:
- **Objetivo de Negócio & Problema**: Qual dor essa funcionalidade resolve? Quem é o usuário impactado?
- **Escopo & Requisitos Funcionais**: Quais os casos de uso críticos (caminho feliz) e exceções? O que fica explicitamente FORA de escopo?
- **Requisitos Técnicos & Arquitetura**: Como essa funcionalidade se integra à stack existente? Há persistência de dados (ex: Supabase, banco local, API externa)? Qual o padrão de reatividade e estado?
- **Experiência do Usuário (UI/UX)**: Quais componentes visuais serão necessários? Qual biblioteca de estilo utilizar (ex: DaisyUI, Tailwind)?
- **Riscos, Restrições & Segurança**: Regras de autorização, integridade de dados, performance, possíveis gargalos.

> Dica: Formule as perguntas de modo que um simples "Sim" ou "Aprovado" do usuário aprove as suas recomendações, permitindo avançar rapidamente se ele concordar com a proposta.

### 3. Enriquecimento Técnico Ativo
Durante ou logo após a entrevista:
- Se houver dependências desconhecidas, integrações de APIs ou bibliotecas sob avaliação, utilize ferramentas de busca (`WebSearch` ou leitura de documentação) para enriquecer a recomendação técnica.
- Garanta que a arquitetura proposta seja viável e consistente com o projeto atual.

### 4. Apresentação do Resumo e Confirmação Obrigatória
Quando todas as perguntas forem respondidas e o contexto estiver 100% completo:
1. Apresente um resumo executivo da pesquisa consolidada na resposta.
2. **Pergunte explicitamente ao usuário**:
   > *"O contexto da pesquisa está completo. Posso salvar o relatório em `docs/researchs/[yyyy-MM-dd-nome-da-pesquisa].md`?"*
3. **Nunca salve o arquivo antes da confirmação afirmativa do usuário.**

### 5. Salvamento do Arquivo
Após a confirmação expressa do usuário:
1. Garanta que o diretório `docs/researchs/` exista (crie-o se necessário).
2. Gere o nome do arquivo seguindo rigorosamente o padrão:
   - Formato: `yyyy-MM-dd-[nome-da-pesquisa-em-kebab-case].md`
   - Exemplo: `2026-10-27-autenticacao-e-perfil-de-usuario.md` (utilizando a data atual).
3. Escreva o arquivo preenchendo o template estruturado abaixo.

---

## Template do Documento de Pesquisa

O arquivo salvo em `docs/researchs/` deve seguir este modelo:

```markdown
# Pesquisa Técnica: [Nome da Funcionalidade / Projeto]

- **Data**: yyyy-MM-dd
- **Status**: Aprovado para Desenvolvimento
- **Origem**: Entrevista de Pesquisa de Projeto (`/project-research`)

---

## 1. Visão Geral & Problema a Resolver
[Descrição clara do objetivo, o valor entregue ao usuário e o problema que está sendo solucionado.]

## 2. Requisitos Funcionais
- [RF01] ...
- [RF02] ...

## 3. Fora de Escopo (Não-Requisitos)
- O que não será entregue nesta iteração.

## 4. Arquitetura & Stack Técnica
- **Frontend / Componentes**: [Componentes, estados, bibliotecas como DaisyUI/Tailwind]
- **Backend / Dados**: [APIs, queries, Supabase / DB, modelos de dados]
- **Integrações**: [Serviços externos, MCPs, etc.]

## 5. Experiência do Usuário (UI/UX)
[Descrição do fluxo de telas, interações e componentes previstos.]

## 6. Riscos, Restrições & Mitigações
| Risco / Incerteza | Impacto | Estratégia de Mitigação |
|---|---|---|
| ... | Alto / Médio / Baixo | ... |

## 7. Fases de Implementação & Próximos Passos
- [ ] **Fase 1**: Modelagem e Estrutura Inicial
- [ ] **Fase 2**: Lógica de Negócio e Serviços
- [ ] **Fase 3**: Interface e Componentes Visuais
- [ ] **Fase 4**: Testes e Validação
```

---

## Anti-Padrões a Evitar
- ❌ Não salve o arquivo em `docs/researchs/` sem antes pedir e receber a autorização do usuário.
- ❌ Não faça perguntas genéricas cujas respostas já estão no código ou no histórico imediato.
- ❌ Não pergunte sem sugerir uma recomendação (o usuário deve ter um ponto de partida técnico claro).
- ❌ Não use caminhos com barra invertida (`\`) nos links ou referências a arquivos.
