---
description: Tecnologias e padrões da stack do projeto (Angular 22, Tailwind 4, daisyUI 5, RxJS 7.8, TypeScript 6)
alwaysApply: true
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
