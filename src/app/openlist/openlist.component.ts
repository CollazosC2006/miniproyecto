import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Lista } from '../interfaces/lista';

import { Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgClass } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-openlist',
  standalone: true,
  imports: [MatDialogActions,MatDialogModule,MatButtonModule,NgClass,MatTableModule,CommonModule],
  templateUrl: './openlist.component.html',
  styleUrl: './openlist.component.css'
})
export class OpenlistComponent {
  //data: { lists: Lista[] } = { lists: [] }; // Inicialización
  dataSource = new MatTableDataSource<Lista>(); // Definir el dataSource sin inicializarlo con datos
  displayedColumns: string[] = ['id', 'FechaRegistro'];
  selectedList: Lista | null = null;
  
  listService: any;

  constructor(
    public dialogRef: MatDialogRef<OpenlistComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lists: Lista[] }  // Usar MAT_DIALOG_DATA para recibir los datos
  ) {}


  ngOnInit(): void {
    this.data.lists.forEach(list => {
      if (list.FechaRegistro instanceof Timestamp) {
        console.log('Fecha antes de la conversión:', list.FechaRegistro);
        list.FechaRegistro = list.FechaRegistro.toDate(); // Convierte Timestamp a Date
        console.log('Fecha después de la conversión:', list.FechaRegistro);
      }
    });
    console.log(this.dataSource);
    this.dataSource.data = this.data.lists;  // Asigna los datos a la fuente de datos de la tabla
    
  
  }

  

  selectList(list: Lista): void {
    this.selectedList = list;
  }

  onOpen(): void {
    if (this.selectedList) {
      this.dialogRef.close(this.selectedList.id); // Devuelve el ID de la lista seleccionada
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin devolver datos
  }
}
