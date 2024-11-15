import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GestionUsuarioComponent } from './gestion-usuario/gestion-usuario.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
        title: 'Login',
      },
    {
      path: 'admin-users',
      component: GestionUsuarioComponent,
      title:'Administrar Usuarios',
      canActivate: [AuthGuard]
    },  
    { path: 'home-page',
      title:'Home Page', 
      component: HomeComponent, 
      canActivate: [AuthGuard] } // Ruta protegida

];
