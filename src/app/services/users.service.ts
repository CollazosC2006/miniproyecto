import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';
import { query, where, getDocs, updateDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private firestore: Firestore) {  }
  addUser(user:User){
    const userRef=collection(this.firestore,'users');
    return addDoc(userRef, user);  
  }
  getUsers(): Observable<User[]>{
    const userRef=collection(this.firestore,'users');
    return collectionData(userRef, {cedula:'cedula'}) as Observable<User[]>;
  }
  deleteUser(user: User) {
    const userRef = collection(this.firestore, 'users');
    const q = query(userRef, where('cedula', '==', user.cedula));

    getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
            snapshot.forEach(docSnapshot => {
                const docRef = doc(this.firestore, `users/${docSnapshot.id}`);
                deleteDoc(docRef)
                    .then(() => console.log("Documento eliminado con éxito"))
                    .catch(error => console.error("Error al eliminar el documento: ", error));
            });
        } else {
            console.log("No se encontró ningún documento con la cédula especificada.");
        }
    }).catch(error => {
        console.error("Error al buscar el documento: ", error);
    });
  }


  async updateUser(user: User) {
    // Referencia a la colección 'users'
    const userRef = collection(this.firestore, 'users');
    
    // Crear una consulta para buscar el usuario por cédula
    const userQuery = query(userRef, where('cedula', '==', user.cedula));
    
    try {
      // Ejecutar la consulta para obtener los documentos que coincidan
      const querySnapshot = await getDocs(userQuery);
  
      // Verificar si se encontró el usuario
      if (!querySnapshot.empty) {
        // Firestore devuelve un snapshot, pero solo necesitamos el primer documento (debería ser único)
        const userDoc = querySnapshot.docs[0];
        
        // Actualizar el documento usando su referencia
        await updateDoc(doc(this.firestore, 'users', userDoc.id), {
          name: user.name,
          last_name: user.last_name,
          mail: user.mail,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
          type_doc: user.type_doc,
          birthday: user.birthday
        });
        
        console.log('Usuario actualizado con éxito.');
      } else {
        console.log('Usuario no encontrado para actualizar.');
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }

}
