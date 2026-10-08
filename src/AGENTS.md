# Gerenciador de Anotações

## Missão do Projeto

Criar uma aplicação para gerenciar anotações.

---

# Tecnologias do Projeto (Stack)

Este projeto utiliza a seguinte stack tecnológica e convenções essenciais:

## 1. Stack e Versões

- **Angular 22** (`@angular/*: ^22.2.0`)
- **Tailwind CSS 4** (`tailwindcss: ^4.3.3`, `@tailwindcss/postcss`)
- **daisyUI 5** (`daisyui: ^5.7.47`)
- **RxJS 7.8** (`rxjs: ~7.8.0`)
- **TypeScript 6** (`typescript: ~6.0.2`)

---

## 2. Diretrizes por Tecnologia

### Angular 22
- **Reatividade com Signals**: Priorize `signal()`, `computed()`, `input()`, `output()` e `viewChild()`.
- **Control Flow Nativo**: Use exclusivamente `@if`, `@for (item of items; track item.id)` e `@switch`. Não use `*ngIf` nem `*ngFor`.
- **Injeção de Dependências**: Utilize `inject(...)` em vez de injeção por construtor.
- **Templates**: Componentes devem usar `templateUrl` em arquivo `.html` separado (evite templates inline).
- **Two-way Data Binding**: Amarre Signals diretamente com `[(ngModel)]="meuSignal"`.
- **Lazy Loading**: Features e telas devem ser carregadas via `loadComponent` ou `loadChildren`.

### Tailwind CSS 4
- Configurado via CSS moderno em `src/styles.css` através de `@import 'tailwindcss';`.
- **Não crie nem espere** um arquivo `tailwind.config.js` legado; a configuração utiliza as diretivas CSS do Tailwind v4.
- Utilize as classes utilitárias do Tailwind 4 para layout, espaçamento, flexbox/grid e tipografia.

### daisyUI 5
- Integrado via plugin CSS com `@plugin "daisyui";` no arquivo global de estilos.
- Utilize classes semânticas de componentes do daisyUI 5 para construção de interface (e.g., `btn`, `btn-primary`, `card`, `card-body`, `input`, `badge`, `modal`).

### RxJS 7.8
- Utilize operadores encadeados com `.pipe()`.
- Para interoperabilidade entre streams assíncronas e a reatividade do Angular, priorize `toSignal()` e `toObservable()` de `@angular/core/rxjs-interop`.
- Evite subscrições manuais (`.subscribe()`) nos componentes sempre que for viável trabalhar de forma declarativa ou com Signals.

### TypeScript 6
- Tipagem estrita ativada (`strict: true`), evitando o uso de `any`.
- **Um arquivo, uma entidade**: separe constantes, tipos e interfaces em arquivos próprios.
- Use imports explícitos e tipagem precisa em parâmetros e retornos de funções.

---

## 3. Exemplo Prático de Uso

```html
<!-- Exemplo combinando Angular 22, Tailwind 4 e daisyUI 5 -->
<div class="card bg-base-100 shadow-md border border-base-200">
  <div class="card-body p-4">
    <h3 class="card-title text-lg font-semibold">{{ nota().titulo }}</h3>
    <p class="text-sm text-base-content/80">{{ nota().conteudo }}</p>

    <div class="card-actions justify-end mt-4">
      <button 
        type="button" 
        class="btn btn-primary btn-sm"
        (click)="editar.emit(nota().id)"
      >
        Editar
      </button>
    </div>
  </div>
</div>
```

---

# Arquitetura de Pastas (core, shared, features)

Organize o código da aplicação seguindo a separação em `core/`, `shared/` e `features/`.

## Responsabilidades das Pastas

- **`core/`**: Recursos essenciais da aplicação, usados diretamente em `app.config.ts` ou consumidos exclusivamente por outros recursos dentro de `core/` (e.g., interceptors HTTP, guardas raiz, tokens globais, providers essenciais).
- **`shared/`**: Recursos reutilizáveis compartilhados entre múltiplas features ou usados internamente dentro de `shared/` (e.g., componentes genéricos de UI, pipes utilitários, diretivas comuns, modelos de dados compartilhados).
- **`features/`**: Módulos/páginas de domínio da aplicação que representam telas ou fluxos de negócio. Devem ser carregados via **lazy loading** nas rotas.

## Matriz de Dependências Permitidas

| Origem (Quem importa) | `core/` | `shared/` | `features/` |
|-----------------------|:-------:|:---------:|:-----------:|
| **`core/`**           |   ✅    |    ❌     |     ❌      |
| **`shared/`**         |   ✅    |    ✅     |     ❌      |
| **`features/`**       |   ✅    |    ✅     |     ✅      |

### Regras de Relacionamento

1. **`core`**:
   - ✅ Pode depender de `core`
   - ❌ **Não pode** depender de `shared`
   - ❌ **Não pode** depender de `features`

2. **`shared`**:
   - ✅ Pode depender de `core`
   - ✅ Pode depender de `shared`
   - ❌ **Não pode** depender de `features`

3. **`features`**:
   - ✅ Pode depender de `core`
   - ✅ Pode depender de `shared`
   - ✅ Pode depender de `features`

---

## Exemplos de Importação

### 1. Dentro de `core/`

```typescript
// ❌ Proibido: core depender de shared ou features
import { BotaoComponent } from '../shared/components/botao/botao';
import { NotasService } from '../features/notas/services/notas';

// ✅ Permitido: core depender apenas de core
import { API_URL } from './tokens/api-url.token';
import { AuthInterceptor } from './interceptors/auth.interceptor';
```

### 2. Dentro de `shared/`

```typescript
// ❌ Proibido: shared depender de features
import { NotaCardComponent } from '../features/notas/components/nota-card/nota-card';

// ✅ Permitido: shared depender de core ou de outro recurso em shared
import { LOCAL_STORAGE } from '../core/tokens/local-storage.token';
import { FormatadorDataPipe } from './pipes/formatador-data.pipe';
```

### 3. Dentro de `features/`

```typescript
// ✅ Permitido: feature depender de core, shared ou de outra feature
import { LOCAL_STORAGE } from '../core/tokens/local-storage.token';
import { BotaoComponent } from '../shared/components/botao/botao';
import { PerfilUsuario } from '../features/perfil/models/perfil-usuario';
```

## Carregamento de Features via Lazy Loading

Toda feature deve ser exposta nas rotas principais através de `loadComponent` ou `loadChildren`:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'notas',
    loadChildren: () => import('./features/notas/notas.routes').then(m => m.NOTAS_ROUTES)
  }
];
```

---

# Guia de estilo Angular

## Um arquivo, uma entidade

Separe constantes, interfaces e types. Cada arquivo exporta uma única entidade.

```typescript
// ❌ user.ts — mistura constante, type e interface
export const PAPEL_PADRAO = 'leitor';
export type Papel = 'leitor' | 'editor';
export interface Usuario {
  nome: string;
}

// ✅ papel-padrao.ts
export const PAPEL_PADRAO = 'leitor';

// ✅ papel.ts
export type Papel = 'leitor' | 'editor';

// ✅ usuario.ts
export interface Usuario {
  nome: string;
}
```

## Template em arquivo próprio

Componentes usam `templateUrl`. Não crie componente com `template` inline.

```typescript
// ❌
@Component({
  selector: 'app-nota',
  template: `<p>{{ titulo() }}</p>`,
})
export class Nota {}

// ✅ nota.ts + nota.html
@Component({
  selector: 'app-nota',
  templateUrl: './nota.html',
})
export class Nota {}
```

## Serviços com `@Service`

Use `@Service` de `@angular/core` no lugar de `@Injectable`. Dependências entram com `inject()`.

```typescript
// ❌
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Notas {
  constructor(private http: HttpClient) {}
}

// ✅
import { Service, inject } from '@angular/core';

@Service()
export class Notas {
  private readonly http = inject(HttpClient);
}
```

Mantenha `@Injectable` apenas quando a classe precisar de injeção pelo construtor, escopo diferente de `root`, ou `useClass` / `useValue` / `useExisting` / `useFactory`.

## Estado somente leitura com `computed`

Exponha leitura derivada com `computed`. Não use `signal.asReadonly()`.

```typescript
// ❌
private readonly notasState = signal<Nota[]>([]);
readonly notas = this.notasState.asReadonly();

// ✅
private readonly notasState = signal<Nota[]>([]);
readonly notas = computed(() => this.notasState());
```

## APIs do `window` atrás de `InjectionToken`

Não acesse `localStorage`, `sessionStorage` ou `window` direto. Abstraia cada recurso em um `InjectionToken`, no próprio arquivo.

```typescript
// local-storage.token.ts
import { InjectionToken } from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<Storage>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

// notas.ts
private readonly storage = inject(LOCAL_STORAGE);
```

## Classes no template

Use `[class]`. Não use `[ngClass]`.

```html
<!-- ❌ -->
<div [ngClass]="{ ativo: ativo() }"></div>

<!-- ✅ -->
<div [class.ativo]="ativo()"></div>
```

## Control flow nativo

Use `@for`, `@if` e `@switch`. Não use `*ngFor`, `*ngIf` nem `*ngSwitch`.

```html
@if (carregando()) {
  <p>Carregando</p>
} @else {
  @for (nota of notas(); track nota.id) {
    <app-nota [nota]="nota" />
  }
}

@switch (status()) {
  @case ('erro') { <p>Falhou</p> }
  @default { <p>Ok</p> }
}
```

## `ngModel` ligado ao signal

Amarre o signal direto com two-way binding.

```html
<!-- ❌ -->
<input [ngModel]="titulo()" (ngModelChange)="titulo.set($event)" />

<!-- ✅ -->
<input [(ngModel)]="titulo" />
```

---

# Padrões de Estilização (Tailwind CSS e daisyUI)

Diretrizes obrigatórias para estilização e construção visual da interface no projeto.

## 1. Estilização com Tailwind CSS
- Utilize sempre as classes utilitárias do Tailwind CSS para estruturar e estilizar elementos da aplicação.
- Evite criar estilos CSS puros, seletores manuais ou arquivos `.css` específicos por componente, a menos que estritamente necessário.

## 2. Animações, Sombras e Efeitos Nativos
- Utilize os utilitários nativos do Tailwind para animações (`animate-spin`, `animate-pulse`, etc.), transições (`transition`, `duration-200`, `ease-in-out`) e sombras (`shadow-sm`, `shadow-md`, `shadow-lg`).
- Não implemente regras `@keyframes`, transições personalizadas ou sombras manuais do zero.

## 3. Componentes Prontos do daisyUI
- Priorize e utilize os componentes semânticos do daisyUI (`btn`, `card`, `modal`, `input`, `badge`, `alert`, `table`, etc.) em vez de reconstruir componentes de UI do zero.
- Combine utilitários de espaçamento e alinhamento do Tailwind sobre os componentes do daisyUI quando necessário.

## 4. Paleta de Cores Sem Valores Hardcoded
- Utilize exclusivamente as cores da paleta do Tailwind CSS (ex.: `text-slate-700`, `bg-blue-600`) ou os tokens semânticos de tema do daisyUI (ex.: `bg-base-100`, `text-primary`, `border-base-300`, `text-base-content`).
- Nunca utilize valores hardcoded hexadecimais, RGB/HSL ou classes arbitrárias de cores fixas (como `bg-[#ffffff]` ou `style="color: #333"`).

---

## Exemplos Práticos

```html
<!-- ❌ Evite: cores hardcoded, estilos manuais e recriação de botões do zero -->
<button style="background-color: #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" class="px-4 py-2 rounded text-white">
  Salvar
</button>

<!-- ✅ Recomendado: botão nativo daisyUI com efeitos e tokens semânticos -->
<button type="button" class="btn btn-primary shadow-md transition duration-200">
  Salvar
</button>
```

```html
<!-- ❌ Evite: card montado do zero com cores arbitrárias e sombras manuais -->
<div class="bg-[#f9fafb] p-4 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
  <h2 class="text-[#1f2937] font-bold">Título</h2>
</div>

<!-- ✅ Recomendado: card do daisyUI com tokens de tema e sombra nativa -->
<div class="card bg-base-100 shadow-md border border-base-200">
  <div class="card-body p-4">
    <h2 class="card-title text-base-content">Título</h2>
  </div>
</div>
```

---

# Diretrizes de Layout e Estrutura de Telas

Define a estrutura visual, distribuição das rotas, apresentação de notas e fluxos de interação na aplicação.

## 1. Estrutura Base da Aplicação (Shell)

- **Header Global**: A aplicação deve conter um header com o título visível fixado ou no topo da página.
- **Área Central de Roteamento**: O roteamento (`<router-outlet />`) deve estar posicionado e centralizado no centro da aplicação (ex.: tag `<main>` com container responsivo).
- **Simplicidade e Funcionalidade**: Manter o layout limpo, direto e funcional, evitando poluição visual.

## 2. Página Home (Listagem de Anotações)

- **Listagem Completa**: A página inicial deve listar todas as anotações cadastradas.
- **Botão Adicionar Acima**: Logo acima da listagem de cards, deve haver um botão em destaque para adicionar uma nova anotação.
- **Apresentação em Cards**: Cada anotação deve ser renderizada obrigatoriamente dentro de um componente de card (usando a classe `card` do daisyUI).

## 3. Ações no Card de Anotação

Dentro de cada card de anotação, devem existir botões dedicados para as ações:
- **Editar**: Redireciona para a página com o formulário de edição da anotação.
- **Remover**: Dispara a abertura de um modal de confirmação antes de remover a anotação.

## 4. Fluxos de Formulário (Criação e Edição)

- **Ação de Adicionar**: Não deve ser modal nem inline; deve ser uma página dedicada com rota própria contendo o formulário de criação.
- **Ação de Editar**: Também deve ser uma página dedicada com rota própria contendo o formulário preenchido para edição.

## 5. Fluxo de Remoção (Modal de Confirmação)

- A remoção de qualquer anotação deve exigir confirmação através de um modal (ex.: `<dialog class="modal">` do daisyUI) com opções de confirmar ou cancelar a ação.

---

## Exemplos Práticos

### 1. Shell Principal (`app.html`)

```html
<header class="navbar bg-base-100 border-b border-base-200 px-4 shadow-xs">
  <h1 class="text-xl font-bold tracking-tight text-base-content">App de Notas</h1>
</header>

<main class="container mx-auto max-w-5xl px-4 py-8 flex-1">
  <router-outlet />
</main>
```

### 2. Cabeçalho e Listagem na Home

```html
<div class="flex items-center justify-between mb-6">
  <h2 class="text-2xl font-bold text-base-content">Minhas Anotações</h2>
  <a routerLink="/nova" class="btn btn-primary btn-sm md:btn-md">
    Adicionar Anotação
  </a>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (nota of notas(); track nota.id) {
    <app-nota-card [nota]="nota" (remover)="confirmarRemocao($event)" />
  }
</div>
```

### 3. Card com Botões de Ação

```html
<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="card-body p-5">
    <h3 class="card-title text-base-content">{{ nota().titulo }}</h3>
    <p class="text-sm text-base-content/80 line-clamp-3">{{ nota().conteudo }}</p>

    <div class="card-actions justify-end mt-4 gap-2">
      <a [routerLink]="['/editar', nota().id]" class="btn btn-outline btn-sm">
        Editar
      </a>
      <button 
        type="button" 
        class="btn btn-error btn-sm btn-soft"
        (click)="remover.emit(nota().id)"
      >
        Remover
      </button>
    </div>
  </div>
</div>
```

### 4. Modal de Confirmação de Remoção

```html
<dialog class="modal" [class.modal-open]="modalAberto()">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Confirmar Exclusão</h3>
    <p class="py-4">Tem certeza de que deseja remover esta anotação? Esta ação não pode ser desfeita.</p>
    <div class="modal-action">
      <button type="button" class="btn btn-ghost" (click)="fecharModal()">Cancelar</button>
      <button type="button" class="btn btn-error" (click)="executarRemocao()">Remover</button>
    </div>
  </div>
</dialog>
```
