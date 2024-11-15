import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TiendasService } from '../services/tiendas.service';
import { NewPurchaseSiteDialogComponent } from '../new-purchase-site-dialog/new-purchase-site-dialog.component';

import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {  MatOption } from '@angular/material/core';
import { ListService } from '../services/list.service';



@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports:[MatInputModule,MatIconModule,MatDialogContent,MatDialogActions,NgFor,MatButtonModule,MatOption,ReactiveFormsModule],
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.css']
})
export class EditProductModalComponent implements OnInit {
  productForm: FormGroup;
  purchaseSiteOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductModalComponent>,
    private tiendasService: TiendasService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any  // Recibe los datos del elemento a editar
  ) {
    this.productForm = this.fb.group({
      productName: [data.productName || '', Validators.required],
      quantity: [data.quantity || 1, [Validators.required, Validators.min(1)]],
      site: [data.site || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMarketNames();
    console.log(this.data);
  }

  loadMarketNames(): void {
    this.tiendasService.getMarketNames().subscribe(
      (marketNames: string[]) => {
        this.purchaseSiteOptions = marketNames;
      },
      (error) => {
        console.error('Error al obtener nombres de tiendas:', error);
      }
    );
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

  async onUpdate() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
  
      // Validar que el campo 'site' tenga un valor válido
      if (!productData.site || productData.site.trim() === '') {
        console.error('El sitio de compra no es válido.');
        alert('Debe seleccionar un sitio de compra válido.');
        return;
      }
  
      try {
        console.log(productData);
        const tiendaId = await this.tiendasService.getStoreIdByName(productData.site);
  
        // Validar que el ID obtenido no sea null o undefined
        if (!tiendaId) {
          console.error('No se encontró un ID para el sitio especificado.');
          alert('El sitio seleccionado no existe en la base de datos.');
          return;
        }
  
        const updatedElemento = {
          productName: productData.productName,
          quantity: productData.quantity,
          site: productData.site,
          completado: this.data.completado,
          id: this.data.id
        };
        console.log(updatedElemento);
  
        this.dialogRef.close(updatedElemento); // Cerrar el modal con los datos actualizados
      } catch (error) {
        console.error('Error al actualizar el producto:', error);
        alert('Ocurrió un error al procesar la solicitud. Inténtelo nuevamente.');
      }
    }
  }
  

  onCancel() {
    this.dialogRef.close(); // Cerrar modal sin enviar datos
  }

  openNewSiteDialog(): void {
    const dialogRef = this.dialog.open(NewPurchaseSiteDialogComponent);
    dialogRef.afterClosed().subscribe(async (newSiteName: string) => {
      if (newSiteName) {
        try {
          await this.tiendasService.addMarket(newSiteName);
          this.loadMarketNames();
        } catch (error) {
          console.error('Error al agregar el market:', error);
        }
      }
    });
  }
}
