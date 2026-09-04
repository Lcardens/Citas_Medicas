import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesComponent } from './pages/pacientes/pacientes';
import { MedicosComponent } from './pages/medicos/medicos';
import { CitasComponent } from './pages/citas/citas';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { PerfilComponent } from './pages/perfil/perfil';
import { MisturnosComponent } from './pages/misturnos/misturnos';
import { ReportesComponent } from './pages/reportes/reportes';
import { AuditoriaComponent } from './pages/auditoria/auditoria';
import { AyudaComponent } from './pages/ayuda/ayuda';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';

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
        path: 'citas',
        component: CitasComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'perfil',
        component: PerfilComponent,
      },
      {
        path: 'misturnos',
        component: MisturnosComponent,
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'medicos',
        component: MedicosComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'pacientes',
        component: PacientesComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'ayuda',
        component: AyudaComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
