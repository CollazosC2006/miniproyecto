import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { User } from '../interfaces/user';
import { Market } from '../interfaces/market';
import { map, Observable } from 'rxjs';
import { query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class TiendasService {

  constructor(private firestore: Firestore) { }

  async addMarket(market_name: string): Promise<void> {
    const marketRef = collection(this.firestore, 'tiendas');

    try {
      // Obtener todas las tiendas actuales para calcular el próximo id
      const snapshot = await getDocs(query(marketRef));
      const numMarkets = snapshot.size;
      const newId = numMarkets + 1; // ID creciente

      // Crear el objeto Market
      const market: Market = {
        name: market_name,
        id: newId,
        date_register: new Date() // Fecha de creación actual
      };

      // Guardar el nuevo mercado en Firestore
      await addDoc(marketRef, market);
      console.log(`Market creado con éxito: ${market.name} con ID ${market.id}`);
    } catch (error) {
      console.error('Error al crear el market:', error);
    }
  }
  // Función para obtener solo los nombres de las tiendas
  getMarketNames(): Observable<string[]> {
    const marketRef = collection(this.firestore, 'tiendas');
    return collectionData(marketRef).pipe(
      map((markets: Market[]) => markets.map(market => market.name)) // Extrae solo los nombres
    );
  }

  async obtenerNombreTienda(idSitio: number): Promise<string | null> {
    try {
      // Referencia a la colección 'tiendas'
      const tiendasRef = collection(this.firestore, 'tiendas');
      
      // Consulta para filtrar por el campo 'id' del documento
      const q = query(tiendasRef, where('id', '==', idSitio));
  
      // Obtener los documentos que coinciden con la consulta
      const querySnapshot = await getDocs(q);
  
      // Verificar si se encontró alguna tienda con ese id
      if (!querySnapshot.empty) {
        const tiendaDoc = querySnapshot.docs[0]; // Tomar el primer documento (asumiendo que 'id' es único)
        const tiendaData = tiendaDoc.data() as { name: string };
        return tiendaData.name; // Retorna el nombre de la tienda
      } else {
        console.log(`No se encontró la tienda con ID: ${idSitio}`);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el nombre de la tienda:", error);
      return null;
    }
  }
  async getStoreIdByName(nombre: string): Promise<number | null> {
    const tiendasRef = collection(this.firestore, 'tiendas');
    const q = query(tiendasRef, where('name', '==', nombre));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const tiendaData = querySnapshot.docs[0].data();
      return tiendaData['id']; // Asume que el ID es único por tienda
    }

    return null; // Si no se encuentra, retornar null o manejar el error
  }



}
