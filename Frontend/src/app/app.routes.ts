import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesComponent } from './pages/pacientes/pacientes';
import { MedicosComponent } from './pages/medicos/medicos';
import { CitasComponent } from './pages/citas/citas';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';

// Guards
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

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
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        component: InicioComponent,
      },
      {
        path: 'medicos',
        component: MedicosComponent,
      },
      {
        path: 'pacientes',
        component: PacientesComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'citas',
        component: CitasComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
