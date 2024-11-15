import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore} from '@angular/fire/firestore';
import { User } from '../interfaces/user';
import { Market } from '../interfaces/market';
import { Observable } from 'rxjs';
import { query, where, getDocs, updateDoc, Timestamp, setDoc, orderBy, limit, getDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { Lista } from '../interfaces/lista';
import { Elemento } from '../interfaces/elemento';



@Injectable({
  providedIn: 'root'
})
export class ListService {
  constructor(private firestore:Firestore) { 

  }


// Función para obtener el primer ID libre en Firebase
async  obtenerIdLibreParaLista(listaId: string): Promise<number | null> {
  try {
    // Referencia al documento de la lista con el ID proporcionado
    const listaDocRef = doc(this.firestore, `listas/${listaId}`);
    const listaSnapshot = await getDoc(listaDocRef);

    if (listaSnapshot.exists()) {
      // Obtenemos los datos de la lista
      const listaData = listaSnapshot.data() as Lista;
      
      // Extraemos el array 'elementos_lista'
      const elementos_lista: Elemento[] = listaData.elementos_lista;

      // Obtenemos todos los IDs ocupados
      const idsOcupados = elementos_lista.map((elemento) => elemento.id);
      
      // Buscamos el primer ID libre
      let idLibre = 1;  // El primer ID posible
      while (idsOcupados.includes(idLibre)) {
        idLibre++;
      }

      return idLibre;
    } else {
      console.log(`No se encontró la lista con ID: ${listaId}`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el ID libre:", error);
    return null;  // Retorna null si hubo un error
  }
}


async addLista(): Promise<Lista> {
  // Referencia a la colección 'listas'
  const listasRef = collection(this.firestore, 'listas');

  // Obtener el último documento para asignar un nuevo ID de forma incremental
  const lastDocSnap = await getDocs(query(listasRef, orderBy('id', 'desc'), limit(1)));
  const lastId = lastDocSnap.docs.length > 0 ? lastDocSnap.docs[0].data()['id'] : 0;

  // Crear un nuevo ID incrementado
  const newId = lastId + 1;

  // Crear objeto para la nueva lista
  const newLista: Lista = {
    id: newId,
    FechaRegistro: Timestamp.now(),
    elementos_lista: [] // Inicializa la subcolección vacía
  };

  // Agregar la nueva lista a Firestore
  const newListaRef = doc(listasRef, `${newId}`);
  await setDoc(newListaRef, newLista);

  console.log('Lista creada con éxito:', newLista);
  return newLista; // Devolver la nueva lista
}
  
async actualizarElementoEnLista(listaId: string, elementoActualizado: Elemento): Promise<void> {
  try {
    const listaRef = doc(this.firestore, `listas/${listaId}`);

    // Obtener los datos actuales de la lista
    const listaSnapshot = await getDoc(listaRef);
    if (listaSnapshot.exists()) {
      const listaData = listaSnapshot.data() as Lista;

      // Asegurarse de que el ID de elementoActualizado esté en tipo número
      const idElementoActualizado = Number(elementoActualizado.id);

      // Crear un nuevo array `elementos_lista` donde solo se reemplaza el elemento con el ID correcto
      const nuevaListaElementos = listaData.elementos_lista.map(el => {
        // Comparar `id` como número
        return el.id === idElementoActualizado ? { ...el, ...elementoActualizado } : el;
      });

      // Subir el array completo actualizado a Firestore
      await updateDoc(listaRef, {
        elementos_lista: nuevaListaElementos
      });

      console.log(`Elemento con id ${idElementoActualizado} actualizado correctamente en la lista ${listaId}`);
    } else {
      console.warn(`No se encontró la lista con ID: ${listaId}`);
    }
  } catch (error) {
    console.error("Error al actualizar el elemento:", error);
    throw error;
  }
}
  async obtenerUltimaLista(): Promise<Lista | null> {
    const listasRef = collection(this.firestore, 'listas');
    const ultimaListaQuery = query(listasRef, orderBy('FechaRegistro', 'desc'), limit(1));
  
    const querySnapshot = await getDocs(ultimaListaQuery);
    if (!querySnapshot.empty) {
      const listaDoc = querySnapshot.docs[0];
      const listaId = listaDoc.id;
      const listaData = listaDoc.data() as Lista;
  
      // Ahora iteramos sobre los elementos de 'elementos_lista' para añadirles el 'id'
      const elementos_lista: Elemento[] = listaData.elementos_lista.map((elem: any) => ({
        ...elem,       // Copiar todos los campos existentes
        id: listaId    // Asignar el ID del documento de Firebase a cada elemento
      }));
  
      return {
        id: listaData.id,
        FechaRegistro: listaData.FechaRegistro,
        elementos_lista: elementos_lista
      };
    } else {
      return null; // No hay listas en la colección
    }
  }
  



  getLists(): Observable<Lista[]>{
    const userRef=collection(this.firestore,'listas');
    return collectionData(userRef, {id:'id'}) as Observable<Lista[]>;
  }


  async updateLista(lista: Lista): Promise<void> {
    try {
      // Convertir todos los IDs a número en `elementos_lista` antes de enviar a Firestore
      const elementosConIdNumerico = lista.elementos_lista.map(elemento => ({
        ...elemento,
        id: Number(elemento.id) // Asegurar que `id` esté en tipo `number`
      }));
  
      // Referencia al documento de la lista en Firestore
      const listaRef = doc(this.firestore, `listas/${lista.id}`);
  
      // Actualizar la lista en Firestore, incluyendo los elementos con IDs convertidos a número
      await setDoc(
        listaRef,
        {
          id: lista.id,
          FechaRegistro: lista.FechaRegistro,
          elementos_lista: elementosConIdNumerico // Usar la lista con IDs numéricos
        },
        { merge: true }
      );
  
      console.log('Lista actualizada exitosamente con IDs de elementos en tipo número.');
    } catch (error) {
      console.error('Error al actualizar la lista:', error);
      throw error;
    }
  }
  async obtenerListaPorId(listaId: string): Promise<Lista | null> {
    try {
      const listaRef = doc(this.firestore, `listas/${listaId}`);
      const listaSnapshot = await getDoc(listaRef);

      if (listaSnapshot.exists()) {
        const listaData = listaSnapshot.data() as Lista;

        // Convertir IDs de los elementos a número para garantizar consistencia
        listaData.elementos_lista = listaData.elementos_lista.map(elemento => ({
          ...elemento,
          id: Number(elemento.id), // Asegura que `id` sea un número
        }));

        return listaData;
      } else {
        console.warn(`No se encontró una lista con ID: ${listaId}`);
        return null; // Devuelve null si no se encuentra la lista
      }
    } catch (error) {
      console.error('Error al obtener la lista:', error);
      throw error;
    }
  }
  async desactivarElemento(listaId: string, elemento: Elemento): Promise<void> {
    try {
      // Referencia al documento de la lista
      const listaDocRef = doc(this.firestore, `listas/${listaId}`);

      // Primero, eliminamos el elemento actual del array 'elementos_lista'
      await updateDoc(listaDocRef, {
        elementos_lista: arrayRemove(elemento),  // Eliminamos el elemento
      });

      // Actualizamos el estado del elemento a 'false'
      const updatedElemento = { ...elemento, Estado: false };

      // Luego, agregamos el elemento con el estado actualizado de nuevo al array
      await updateDoc(listaDocRef, {
        elementos_lista: arrayUnion(updatedElemento),  // Agregamos el elemento con el estado actualizado
      });

      console.log(`Elemento con id ${elemento.id} desactivado correctamente en la lista ${listaId}`);
    } catch (error) {
      console.error("Error al desactivar el elemento:", error);
    }
  }


  
  
}

function firestoreCollection(firestore: Firestore, arg1: string) {
  throw new Error('Function not implemented.');
}

