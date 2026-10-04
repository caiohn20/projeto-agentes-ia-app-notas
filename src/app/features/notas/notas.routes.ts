import { Routes } from '@angular/router';

export const NOTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listagem-notas/listagem-notas').then(
        (m) => m.ListagemNotasComponent,
      ),
  },
  {
    path: 'nova',
    loadComponent: () =>
      import('./pages/nova-nota/nova-nota').then((m) => m.NovaNotaComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/editar-nota/editar-nota').then(
        (m) => m.EditarNotaComponent,
      ),
  },
];
