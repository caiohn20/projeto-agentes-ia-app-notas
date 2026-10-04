import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'notas',
  },
  {
    path: 'notas',
    loadChildren: () =>
      import('./features/notas/notas.routes').then((m) => m.NOTAS_ROUTES),
  },
  {
    path: 'nova',
    loadComponent: () =>
      import('./features/notas/pages/nova-nota/nova-nota').then(
        (m) => m.NovaNotaComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./features/notas/pages/editar-nota/editar-nota').then(
        (m) => m.EditarNotaComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'notas',
  },
];
