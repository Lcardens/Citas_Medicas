import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesComponent } from './pages/pacientes/pacientes';
import { MedicosComponent } from './pages/medicos/medicos';
import { CitasComponent } from './pages/citas/citas';
import { InicioComponent } from './pages/inicio/inicio'; // 👈 1. Importar el componente
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '', // 👈 2. Al entrar a /dashboard carga Inicio
        component: InicioComponent,
      },
      {
        path: 'pacientes',
        component: PacientesComponent,
      },
      {
        path: 'medicos',
        component: MedicosComponent,
      },
      {
        path: 'citas',
        component: CitasComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
