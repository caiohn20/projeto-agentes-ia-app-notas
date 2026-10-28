---
name: project-implementation
description: Executa a implementação técnica de funcionalidades a partir de um documento de planejamento (planning). Realiza entrevista de alinhamento (uma pergunta por vez) se faltar contexto, implementa micro tarefas de forma isolada e individual, validando cada etapa com build antes de avançar. Use quando o usuário pedir para implementar um planejamento, executar tarefas de planning, usar /project-implement, /project-implementation ou iniciar o desenvolvimento baseado em um plano técnico.
---

# Implementação de Projeto (Project Implementation)

Esta skill orienta o agente na execução técnica de um plano de desenvolvimento estruturado a partir de um arquivo de planejamento (`docs/planning/`).

Ela representa a fase de **Implementação** no pipeline de desenvolvimento (`/project-research` ➔ `/project-planning` ➔ `/project-implementation`), transformando as decisões arquiteturais e o catálogo de micro tarefas atômicas em código funcional, compilado e validado.

---

## ⚙️ Regras Fundamentais de Execução

1. **Arquivo de Planejamento como Fonte da Verdade**: Toda implementação deve basear-se no arquivo de planejamento fornecido pelo usuário.
2. **Entrevista para Contexto Faltante (Uma Pergunta por Vez)**: Se houver qualquer dúvida técnica, credencial ausente ou regra de negócio ambígua, pergunte ao usuário em formato de entrevista, **estritamente uma pergunta por vez**.
3. **Isolamento de Tarefas**: Implemente cada tarefa de forma estritamente individual e sequencial. Jamais junte múltiplas tarefas em uma única etapa.
4. **Ciclo de Build Obrigatório**: Cada tarefa deve ser validada com o build do projeto (`npm run build` ou `ng build`) antes de avançar para a próxima.
5. **Respeito ao Escopo do Usuário**: Se o usuário especificar quais tarefas devem ser implementadas (ex.: apenas tarefas 01 e 02), restrinja-se rigorosamente a esse subconjunto.
6. **Atualização Contínua do Progresso**: A cada tarefa concluída com build bem-sucedido, marque o checkbox correspondente (`- [ ]` ➔ `- [x]`) no próprio arquivo de planejamento.
7. **Notificação de Conclusão**: Ao concluir todas as tarefas requisitadas, notifique expressamente o usuário de que a implementação terminou.

---

## Fluxo de Trabalho (Workflow)

```
[1. Leitura do Planejamento] ➔ [2. Diagnóstico & Entrevista (1 por vez)] ➔ [3. Definição do Escopo] ➔ [4. Ciclo Isolado: Implementar ➔ Build ➔ Próxima] ➔ [5. Notificação de Conclusão]
```

### 1. Leitura e Análise do Arquivo de Planejamento
1. Obtenha o arquivo de planejamento fornecido pelo usuário:
   - Geralmente localizado em `docs/planning/yyyy-MM-dd-[nome-do-planejamento].md`.
   - Se o usuário não informou o caminho na chamada, pergunte qual arquivo de planejamento deve ser utilizado antes de iniciar.
2. Leia o documento na íntegra, absorvendo:
   - Resumo executivo e escopo;
   - Arquitetura da solução, modelos de tipagem (`TypeScript`) e camadas de integração;
   - Mapeamento de arquivos a criar ou modificar;
   - Catálogo de **Micro Tarefas de Implementação**.
3. Inspecione a base de código atual para entender o estado dos arquivos afetados e garantir consistência com os padrões existentes.

### 2. Diagnóstico de Lacunas e Entrevista (Uma Pergunta por Vez)
Avalie se o arquivo de planejamento e o estado do projeto contêm todos os detalhes necessários para a execução:

- **Se houver contexto faltando ou dúvidas técnicas impeditivas:**
  - Formule a dúvida em formato de entrevista, enviando **estritamente uma pergunta por vez**:
    ```
    ❓ **Pergunta de Alinhamento**: [Descrição clara da dúvida ou do detalhe que falta]
    ➡️ **Recomendação**: [Alternativa técnica sugerida baseada no ecossistema e boas práticas]
    ```
  - Aguarde a confirmação ou ajuste do usuário antes de realizar qualquer alteração no código.
- **Se o contexto já estiver completo e claro:** Avance imediatamente para a etapa seguinte.

### 3. Definição do Escopo de Tarefas
- Verifique se o usuário solicitou a execução de **tarefas específicas**:
  - Exemplo: *"implemente apenas a micro tarefa 01"* ou *"faça da micro tarefa 03 em diante"*.
  - Se sim: execute apenas as tarefas solicitadas.
  - Se não: execute todas as tarefas pendentes (`- [ ]`) na ordem sequencial definida no planejamento.

### 4. Ciclo de Implementação Individual e Isolada (Loop de Execução)
Para cada micro tarefa selecionada, execute rigorosamente o ciclo abaixo:

```
┌────────────────────────────────────────────────────────┐
│                   1. Implementação                     │
│    (Criação/edição pontual de arquivos da tarefa)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   2. Rodar o Build                     │
│               (npm run build / ng build)               │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      [Build Falhou ❌]           [Build Passou ✅]
             │                           │
  Corrija o erro apontado        Marque como completa
  e rode o build novamente      (- [x] no planning.md)
  (repita até passar)                    │
                                         ▼
                             Siga para a próxima tarefa
```

#### Passo 1: Implementação
- Crie ou edite exclusivamente os arquivos designados para a micro tarefa atual.
- Siga à risca os requisitos técnicos, tipagens, padrões de reatividade (Signals), componentes DaisyUI e classes utilitárias do Tailwind CSS v4 estipulados no planejamento.
- Mantenha o código limpo, sem adicionar escopos extras que pertençam a tarefas posteriores.

#### Passo 2: Rodar o Build
- Execute o comando de compilação do projeto via terminal ou ferramenta integrada:
  ```bash
  npm run build
  ```
- **Se o build falhar:**
  1. Analise atentamente a mensagem de erro (erros de tipo, imports faltando, sintaxe, templates, etc.).
  2. Aplique a correção pontual necessária nos arquivos relevantes.
  3. Execute o build novamente.
  4. Repita este ciclo de correção até que o build passe com sucesso. Não avance de tarefa enquanto houver erro de compilação.
- **Se o build funcionar:**
  1. Atualize o arquivo de planejamento marcando a tarefa atual como concluída (`- [ ]` ➔ `- [x]`).
  2. Apresente um breve status informando que a tarefa foi concluída com sucesso e o build validado.
  3. Passe imediatamente para a próxima micro tarefa da fila.

### 5. Finalização e Notificação
Quando a última micro tarefa do escopo for concluída com o build aprovado:
1. Verifique se todas as tarefas previstas no planejamento foram marcadas com `- [x]`.
2. Notifique explicitamente o usuário informando que a **implementação terminou com sucesso**.
3. Apresente um resumo executivo final contendo:
   - Lista das tarefas executadas e validadas;
   - Arquivos criados e alterados;
   - Status da compilação e orientações para testes manuais ou execução da aplicação (`npm start`).

---

## Anti-Padrões a Evitar

- ❌ **JAMAIS implemente múltiplas micro tarefas ao mesmo tempo**. Sempre execute uma por vez, de forma isolada.
- ❌ **NÃO avance para a tarefa seguinte se o build falhar**. A correção do erro é mandatória antes de prosseguir.
- ❌ **NÃO faça mais de uma pergunta de entrevista por vez** caso falte contexto.
- ❌ **NÃO faça perguntas sem propor uma recomendação técnica clara**.
- ❌ **NÃO ignore instruções de tarefas específicas dadas pelo usuário**.
- ❌ **NÃO esqueça de marcar `- [x]` no arquivo de planejamento** após cada tarefa concluída.
- ❌ **NÃO finalize o trabalho sem notificar claramente o usuário** sobre a conclusão da implementação.
- ❌ **NÃO utilize barras invertidas (`\`)** nos caminhos de arquivo no Markdown.
