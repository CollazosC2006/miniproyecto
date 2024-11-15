import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ListService } from '../services/list.service';
import { Timestamp } from '@angular/fire/firestore';
import { timestamp } from 'rxjs';
import { Lista } from '../interfaces/lista';
import { Elemento } from '../interfaces/elemento';
import { TiendasService } from '../services/tiendas.service';
import { OpenlistComponent } from '../openlist/openlist.component';
import { EditProductModalComponent } from '../edit-product-modal/edit-product-modal.component';
import { NvbarComponent } from '../nvbar/nvbar.component';

export interface Producto {
  completado: boolean;
  producto: string;
  tienda: string;
  cantidad: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule,MatButtonModule,FormsModule, NgClass,ProductModalComponent,NvbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent implements OnInit{

  selectedProduct: any|null=null;
  id_list:number|undefined;
  date_list: Date |undefined;
  lista_actual: Lista |null=null;
  elementos_actual:Elemento[]=[];
  
  
  constructor(
    public dialog: MatDialog, 
    private listService: ListService,
    private tiendasService: TiendasService
  ) {}


  displayedColumns: string[] = ['completado','producto', 'tienda', 'cantidad'];
  
  // Almacena la lista de productos para la tabla
  dataSource = new MatTableDataSource<{ completado: boolean; producto: string; tienda: string; cantidad: number; id:number}>([]);
  
  // Almacena la lista actual con sus elementos desde Firestore

  async ngOnInit() {
    this.cargarUltimaLista();
    this.listService.getLists().subscribe(lists =>{
      console.log(lists);
      this.lists=lists;
    })
  }

  async cargarUltimaLista(): Promise<void> {
    try {
      // Obtiene la última lista
      this.lista_actual = await this.listService.obtenerUltimaLista();

      if (this.lista_actual) {
        this.id_list = this.lista_actual.id;
        if (this.lista_actual.FechaRegistro instanceof Timestamp) {
          this.date_list = this.lista_actual.FechaRegistro.toDate(); // Conversión de Timestamp a Date
        }
        console.log(this.lista_actual)
        // Mapea los elementos con el nombre de la tienda para cada `IdSitio`
        this.updatelist();
      }
    } catch (error) {
      console.error("Error al cargar la última lista:", error);
    }
  }

  async updatelist(){
    if (this.lista_actual) {
      console.log(this.lista_actual);
      const elementosConTienda = await Promise.all(
        this.lista_actual.elementos_lista
          .filter(elemento => elemento.Estado === true)
          .map(async (elemento) => {
            const nombreTienda = await this.tiendasService.obtenerNombreTienda(elemento.IdSitio);
            
            return {
              completado: elemento.completado,
              producto: elemento.nombre,
              tienda: nombreTienda || 'Tienda desconocida', // Si no se encuentra el nombre de la tienda, muestra un valor predeterminado
              cantidad: elemento.Cantidad,
              id: elemento.id
            };
          })
      );
      this.dataSource.data = elementosConTienda; // Usa MatTableDataSource si usas Angular Material
      console.log(this.dataSource.data);
    }  
  }


  async createNewList(): Promise<void> {
    try {
      const nuevaLista = await this.listService.addLista(); // Crear y obtener la nueva lista
      
      if (nuevaLista) {
        // Establece la nueva lista como lista actual
        this.lista_actual = nuevaLista;
        this.id_list = nuevaLista.id;
  
        // Convierte la fecha de registro si es un Timestamp
        if (nuevaLista.FechaRegistro instanceof Timestamp) {
          this.date_list = nuevaLista.FechaRegistro.toDate(); // Conversión a Date
        }
  
        this.updatelist(); // Actualiza la tabla (aunque estará vacía inicialmente)
        console.log('Nueva lista creada y establecida como lista actual:', nuevaLista);
      }
    } catch (error) {
      console.error('Error al crear la lista:', error);
    }
  }

  

  addProduct() {
    // Lógica para agregar un producto
  }

  editProduct() {
    if (this.selectedProduct) {
      const dialogRef = this.dialog.open(EditProductModalComponent, {
        width: '500px',
        data: {
          productName: this.selectedProduct.producto,
          quantity: this.selectedProduct.cantidad,
          site: this.selectedProduct.tienda,
          completado: this.selectedProduct.completado,
          id: this.selectedProduct.id
        }
      });

      dialogRef.afterClosed().subscribe(async (updatedProduct: any) => {
        if (updatedProduct) {
          // Preparar el producto actualizado con el formato requerido por la base de datos
          const elementoActualizado: Elemento = {
            completado: updatedProduct.completado,
            nombre: updatedProduct.productName,
            IdSitio: (await this.tiendasService.getStoreIdByName(updatedProduct.site)) ?? -1, // Asigna -1 si el ID es null
            Cantidad: updatedProduct.quantity,
            Estado: true,
            id: updatedProduct.id
          };

          // Llamar al método del servicio para actualizar el elemento en Firestore
          if (this.lista_actual) {
            try {
              await this.listService.actualizarElementoEnLista(String(this.lista_actual.id), elementoActualizado);
              this.lista_actual=await this.listService.obtenerListaPorId(String(this.lista_actual.id));
              this.updatelist(); // Actualizar la tabla después de la actualización en la base de datos
              console.log('Elemento actualizado en la base de datos y en la interfaz');
            } catch (error) {
              console.error('Error al actualizar el elemento en Firestore:', error);
            }
          }
        }
      });
      this.updatelist();
      this.selectedProduct=null;
    }
  }

  

  deleteProduct() {
    

    if(this.selectedProduct && this.lista_actual){
      const elemento = this.lista_actual.elementos_lista.find(elemento => elemento.id === this.selectedProduct?.id);
      if (elemento) {
        // Ahora tienes el elemento y puedes modificar su estado directamente
        console.log('Elemento encontrado:', elemento);
        
        // Cambiar el estado del elemento encontrado a false
        elemento.Estado = false;  // Cambiar el estado a 'false'
        
        // Ya no se necesita mandar nada a la base de datos, sólo se actualiza el estado en la variable local
        console.log('Estado del elemento modificado:', elemento);
        console.log(this.lista_actual);
      } else {
        console.log('No se encontró el elemento con id:', this.selectedProduct.id);
      }
      
      this.updatelist();
      this.guardarListaActual();
      this.selectedProduct=null;
    }

    
  }
  lists:Lista[]|null=null;
  selectedListId:number|null=null;
  openAnotherList(): void {
    console.log(this.lists);
    const dialogRef = this.dialog.open(OpenlistComponent, {
      width: '500px',
      data: { lists: this.lists }
    });
  
    dialogRef.afterClosed().subscribe((result: number | null) => {
      if (result !== null && this.lists) {
        // Encuentra la lista seleccionada por su ID
        const selectedList = this.lists.find(list => list.id === result);
        if (selectedList) {
          this.lista_actual = selectedList; // Asigna la lista seleccionada como la lista actual
          this.id_list = selectedList.id;
  
          if (selectedList.FechaRegistro instanceof Timestamp) {
            this.date_list = selectedList.FechaRegistro.toDate(); // Conversión a Date
          }
  
          this.updatelist(); // Actualiza la tabla con los elementos de la nueva lista
          console.log('Lista seleccionada:', selectedList);
        }
      }
    });
  }
  

 

  inactive_elements() {
    // Lógica para abrir otra lista
  }

  

  openProductModal() {
    const dialogRef = this.dialog.open(ProductModalComponent);
  
    dialogRef.afterClosed().subscribe(async nuevoElemento => {
      if (nuevoElemento && this.lista_actual) {
        // Agregar el nuevo elemento a lista_actual.elementos_lista
        nuevoElemento.id=await this.listService.obtenerIdLibreParaLista(String(this.lista_actual.id));
        this.lista_actual.elementos_lista.push(nuevoElemento);
  
        // Guardar los cambios en Firestore si es necesario
        this.guardarListaActual();
        this.updatelist();
      }
    });
  }
  
  // Función para guardar la lista en Firestore si es necesario
  guardarListaActual() {

    if (this.lista_actual) {
      this.listService.updateLista(this.lista_actual).then(() => {
        console.log('Lista actualizada con éxito');
      }).catch(error => {
        console.error('Error al actualizar la lista:', error);
      });
    }
    
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    console.log(this.selectProduct);
  }
}
