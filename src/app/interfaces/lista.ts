import { Timestamp } from 'firebase/firestore';
import { Elemento } from './elemento';

export interface Lista { 
  id: number;                // ID único para cada lista, asignado de forma incremental
  FechaRegistro: Timestamp | Date;  // Fecha y hora en que se creó la lista
  elementos_lista: Elemento[]; // Colección de elementos dentro de la lista
}
