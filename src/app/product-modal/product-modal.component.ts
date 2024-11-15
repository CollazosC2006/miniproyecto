import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {  MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NewPurchaseSiteDialogComponent } from '../new-purchase-site-dialog/new-purchase-site-dialog.component';
import { TiendasService } from '../services/tiendas.service';
import { ListService } from '../services/list.service';


@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [ 
    MatInputModule, 
    MatDialogActions,
    MatIconModule,
    MatDialogContent,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatOption,
    NewPurchaseSiteDialogComponent
    

  ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css'
})
export class ProductModalComponent implements OnInit{
  productForm: FormGroup;

  purchaseSiteOptions: string[] = [];


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductModalComponent>,
    public dialog: MatDialog,
    private tiendasService: TiendasService,
    private listService: ListService
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
      site: ['', Validators.required]  // Control para seleccionar un único sitio de compra
    });
  }

  ngOnInit(): void {
    this.loadMarketNames(); // Llama a la función para cargar los nombres
  }

  get purchaseSites(): FormArray {
    return this.productForm.get('purchaseSites') as FormArray;
  }
  
  openNewSiteDialog(): void {
    const dialogRef = this.dialog.open(NewPurchaseSiteDialogComponent);

    dialogRef.afterClosed().subscribe(async (newSiteName: string) => {
      if (newSiteName) {
        //this.purchaseSiteOptions.push(newSiteName);
        try {
          await this.tiendasService.addMarket(newSiteName);
          this.loadMarketNames();
          console.log('Market agregado exitosamente');
          
        } catch (error) {
          console.error('Error al agregar el market:', error);
        }
      }
    });
  }

  loadMarketNames(): void {
    this.tiendasService.getMarketNames().subscribe(
      (marketNames: string[]) => {
        this.purchaseSiteOptions = marketNames;
        //console.log('Nombres de tiendas cargados:', this.purchaseSiteOptions);
      },
      (error) => {
        //console.error('Error al obtener nombres de tiendas:', error);
      }
    );
  }
  createPurchaseSite(): FormGroup {
    return this.fb.group({
      site: ['', Validators.required]
    });
  }

  addPurchaseSite() {
    this.purchaseSites.push(this.createPurchaseSite());
  }

  incrementQuantity() {
    const quantity = this.productForm.get('quantity')?.value;
    this.productForm.get('quantity')?.setValue(quantity + 1);
  }

  decrementQuantity() {
    const quantity = this.productForm.get('quantity')?.value;
    if (quantity > 1) {
      this.productForm.get('quantity')?.setValue(quantity - 1);
    }
  }

  async onSave() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
  
      // Obtener el ID de la tienda por nombre
      const tiendaId = await this.tiendasService.getStoreIdByName(productData.site);
      

  
      // Preparar el objeto para enviar al componente padre
      const nuevoElemento = {
        nombre: productData.productName,
        Cantidad: productData.quantity,
        IdSitio: tiendaId,
        Estado: true,         // Valores por defecto para un nuevo elemento
        completado: false,
        id:null
      };
  
      this.dialogRef.close(nuevoElemento); // Cierra el modal y pasa el elemento al componente padre
    }
  }

  onCancel() {
    this.dialogRef.close(); // Cerrar modal sin enviar datos
  }


}
