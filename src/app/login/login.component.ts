
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterOutlet, MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: boolean = false;
  errorLogin: string = "k";
  formSubmitted: boolean = false;
  errorMessage: string = ''; // Inicializar como una cadena vacía
  isShrunk: boolean = false;

  

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
    
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log(email);
      console.log(password);
      try {
        const isAuthenticated = await this.authService.login(email, password);
        if (!isAuthenticated) {
          this.loginError=true;
          this.errorMessage = 'Credenciales incorrectas. Intente nuevamente.';
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.loginError=true;
        this.errorMessage = 'Ocurrió un error. Intente más tarde.';
      }
    }
  }
  
  hasErrors(controlName: string, errorName: string): boolean {
    return this.loginForm.controls[controlName].hasError(errorName);
  }
}
