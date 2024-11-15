import { Injectable } from '@angular/core';

import { Auth, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated$ = new BehaviorSubject<boolean>(false); // Estado de autenticación
  private userData: any = null; // Datos del usuario autenticado

  constructor(private firestore: Firestore, private router: Router) {}

  async login(email: string, password: string): Promise<boolean> {
    // Verificar que email y password no sean undefined
    if (!email || !password) {
      console.error('Error: email o password son undefined');
      throw new Error('Correo y contraseña son requeridos');
    }
  
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('mail', '==', email), where('password', '==', password));
  
    try {
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Usuario encontrado
        querySnapshot.forEach((doc) => {
          this.userData = { id: doc.id, ...doc.data() }; // Almacena los datos del usuario
        });
        this.isAuthenticated$.next(true); // Cambia el estado de autenticación
        this.router.navigate(['/home-page']); // Redirige al componente protegido
        return true;
      } else {
        // Usuario no encontrado
        console.error('Usuario no encontrado con las credenciales proporcionadas');
        return false;
      }
    } catch (error) {
      console.error('Error en la consulta de Firestore:', error);
      throw error;
    }
  }
  

  logout(): void {
    this.isAuthenticated$.next(false);
    this.userData = null;
    this.router.navigate(['/']); // Redirige al login
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.isAuthenticated$.getValue();
  }

  // Obtener el usuario actual como Observable
  getUserData(): any {
    return this.userData;
  }
}
