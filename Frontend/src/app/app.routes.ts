import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { CitasComponent } from './pages/citas/citas';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'citas', component: CitasComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
