import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // Importa MatTableModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { matDatepickerAnimations, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../interfaces/user';
import { UsersService } from '../services/users.service';
import * as forge from 'node-forge';
import { NvbarComponent } from '../nvbar/nvbar.component';

interface Usuario {
  id: number;
  name: string;
  last_name: string;
  cedula: number;
  birthday: Date;
  gender: string;
  mail: string;
  phone: number;
  photo: string;
  role: string;
  type_doc: string;
  password:string;
}
@Component({
  selector: 'app-gestion-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    RouterOutlet, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatCardModule, 
    MatTableModule, 
    MatSnackBarModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NvbarComponent
  ],
  templateUrl: './gestion-usuario.component.html',
  styleUrl: './gestion-usuario.component.css'
})
export class GestionUsuarioComponent implements OnInit {
  
  



  usuarioForm: FormGroup;
  selectedUsuario: any = null;
  maxDate = new Date();
  errorMessage: string = '';
  action_form:string='Crear Usuario';
  disable_admin:boolean=false;
  disable_user:boolean=false;

  

  displayedColumns: string[] = ['cedula', 'nombre','last_name', 'correo','role',];

  

  dataSource = new MatTableDataSource<User>

  
  

  
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private route: Router,
    private usersService: UsersService,
  ) {
    const emailPattern = new RegExp("[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{1,5}");
  
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'), Validators.maxLength(50)]],
      cedula: [{ value: ''}, [Validators.required, Validators.pattern('^[1-9][0-9]*$')]],
      birthday: ['', Validators.required],
      gender: ['', Validators.required],
      mail: ['', [Validators.required, Validators.pattern(emailPattern), Validators.maxLength(40)]],
      phone: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{9}$')]],
      role: ['', Validators.required],
      type_doc: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  

  ngOnInit() {
    this.usersService.getUsers().subscribe(users =>{
      console.log(users);
      this.dataSource.data=users;
    })
   
    

    this.dataSource.filterPredicate = (data: User, filter: string) => 
      data.name.toLowerCase().includes(filter);

    this.ordenarUsuarios();

    if (this.num_admins()>=2){
      this.disable_admin=true;
      this.disable_user=false;
    }else{
      this.disable_user=false;
      this.disable_admin=false;
    }
    this.ordenarUsuarios();


  }

 

  selectUsuario(usuario: any): void {
    this.selectedUsuario = usuario;
    this.usuarioForm.patchValue({
      name: usuario.name,
      last_name: usuario.last_name,
      cedula: usuario.cedula,
      birthday: usuario.birthday,
      gender: usuario.gender,
      mail: usuario.mail,
      phone: usuario.phone,
      role: usuario.role,
      type_doc: usuario.type_doc
    });


    this.usuarioForm.get('id')?.disable();  // Deshabilita el campo 'id'
    this.usuarioForm.get('cedula')?.disable();  // Deshabilita el campo 'cedula'
    this.action_form='Actualizar o Eliminar Usuario';
    if (this.num_admins()>=2){
      this.disable_admin=true;
      this.disable_user=false;
    }else if(this.selectedUsuario.role == 'admin' && this.num_admins()==1){
      this.disable_user=true;
      this.disable_admin=false;
    }else{
      this.disable_user=false;
      this.disable_admin=false;
    }
    

  }

  async eliminarUsuario(): Promise<void> {
    if (this.selectedUsuario ) {
      if(this.num_admins()==1 && this.selectedUsuario.role=='admin' ){
        this.snackBar.open('Debe haber por lo menos un administrador en el sistema', 'Cerrar', { duration: 2000 });
        return;
      }else{
        console.log(`Eliminar usuario con cédula: ${this.selectedUsuario.cedula}`);
        const response = await this.usersService.deleteUser(this.selectedUsuario);
        console.log(response);
        this.dataSource.data = this.dataSource.data.filter(u => u !== this.selectedUsuario);
        this.selectedUsuario = null;
        this.usuarioForm.reset();
        this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 2000 });
      }
    }
    this.ordenarUsuarios();
    this.limpiarFormulario();
  }

  async actualizarUsuario(): Promise<void> {
    if (this.selectedUsuario && this.usuarioForm.valid) {
      this.errorMessage = ''; // Limpia el mensaje si el formulario es válido
      // Lógica para actualizar el usuario
      const response= await this.usersService.updateUser(this.usuarioForm.value);
      console.log(response);

    } else {
      this.setErrorMessage();
      return;
    }
    this.snackBar.open('Usuario Actualizado', 'Cerrar', { duration: 2000 });
    this.ordenarUsuarios();
    this.limpiarFormulario();

    /*if (this.selectedUsuario && this.usuarioForm.valid) {
      console.log(`Actualizar usuario con cédula: ${this.selectedUsuario.cedula}`);
      const updatedUsuario = { ...this.selectedUsuario, ...this.usuarioForm.value };
      const index = this.dataSource.data.findIndex(u => u.id === this.selectedUsuario!.id);
      this.dataSource.data[index] = updatedUsuario;
      this.dataSource._updateChangeSubscription();  
      this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 2000 });
    }*/
  }

  

  async crearUsuario(): Promise<void> {

    if (this.usuarioForm.invalid) {
      this.setErrorMessage();
      return; // Detiene la ejecución si el formulario es inválido
    }
  
    // Verificar si la cédula o el correo ya están registrados en dataSource
    const cedulaExistente = this.dataSource.data.some((user) => user.cedula === this.usuarioForm.value.cedula);
    const correoExistente = this.dataSource.data.some((user) => user.mail === this.usuarioForm.value.mail);
  
    // Acciones en función de la verificación
    if (cedulaExistente && correoExistente) {
      this.errorMessage = 'La cédula y el correo ya están registrados.';
      return; // Detiene la creación del usuario
    } else if (cedulaExistente) {
      this.errorMessage = 'La cédula ya está registrada.';
      return; // Detiene la creación del usuario
    } else if (correoExistente) {
      this.errorMessage = 'El correo ya está registrado.';
      return; // Detiene la creación del usuario
    }
  
    // Si las verificaciones son exitosas, procede a crear el usuario
    this.errorMessage = ''; // Limpia el mensaje si no hay errores
    try {
      const response = await this.usersService.addUser(this.usuarioForm.value);
      console.log('Usuario creado:', response);
      this.snackBar.open('Usuario creado', 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('Error al crear el usuario:', error);
    }


    
    this.ordenarUsuarios();
    this.limpiarFormulario();
   //this.route.navigate(['/app-registro-datos']);
  }

  limpiarFormulario(): void {
    this.selectedUsuario = null;
    this.usuarioForm.reset();
    this.usuarioForm.get('id')?.enable();  // Deshabilita el campo 'id'
    this.usuarioForm.get('cedula')?.enable();  // Deshabilita el campo 'cedula'
    this.action_form='Crear Usuario';
    if (this.num_admins()>=2){
      this.disable_admin=true;
      this.disable_user=false;
    }else{
      this.disable_user=false;
      this.disable_admin=false;
    }

  }

  setErrorMessage() {
    this.errorMessage = 'Por favor, corrija o llene los campos indicados antes de continuar.';
  }

  num_admins():number{
    const admins = this.dataSource.data.filter(user => user.role === 'admin');
    return admins.length;
  }

  ordenarUsuarios() {
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      // Ordena los administradores primero y luego los usuarios normales
      return a.role === 'admin' && b.role !== 'admin' ? -1 : 1;
    });
  }

}



