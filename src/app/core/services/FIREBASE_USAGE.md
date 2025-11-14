# Guía de Uso de Firebase

## Configuración Completada ✅

Firebase ya está configurado en tu proyecto con:
- **Authentication** (Auth)
- **Firestore** (Base de datos)
- **Storage** (Almacenamiento de archivos)

## Cómo Usar el Servicio

### 1. Inyectar el servicio en tu componente

```typescript
import { FirebaseService } from '@app/core/services/firebase.service';

constructor(private firebaseService: FirebaseService) { }
```

### 2. Autenticación

```typescript
// Login
async login() {
  try {
    const user = await this.firebaseService.login('email@example.com', 'password');
    console.log('Usuario logueado:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Logout
async logout() {
  await this.firebaseService.logout();
}

// Obtener usuario actual
const currentUser = this.firebaseService.getCurrentUser();
```

### 3. Firestore (Base de Datos)

```typescript
// Agregar documento
async addClub() {
  const clubId = await this.firebaseService.addDocument('clubes', {
    nombre: 'Club Ejemplo',
    ciudad: 'Santiago',
    createdAt: new Date()
  });
}

// Obtener todos los documentos
async getClubes() {
  const clubes = await this.firebaseService.getDocuments('clubes');
  console.log(clubes);
}

// Actualizar documento
async updateClub(id: string) {
  await this.firebaseService.updateDocument('clubes', id, {
    nombre: 'Nuevo Nombre'
  });
}

// Eliminar documento
async deleteClub(id: string) {
  await this.firebaseService.deleteDocument('clubes', id);
}

// Query con filtros
async searchClubes() {
  const clubes = await this.firebaseService.queryDocuments(
    'clubes',
    'ciudad',
    '==',
    'Santiago'
  );
}
```

### 4. Storage (Subir Archivos)

```typescript
async uploadImage(file: File) {
  const url = await this.firebaseService.uploadFile(
    `images/${Date.now()}_${file.name}`,
    file
  );
  console.log('URL de descarga:', url);
}
```

## Colecciones Sugeridas

- `clubes` - Información de clubes
- `pelotones` - Información de pelotones
- `evaluaciones` - Evaluaciones realizadas
- `usuarios` - Datos de usuarios

## Seguridad

Recuerda configurar las reglas de seguridad en Firebase Console:
- Firestore Rules
- Storage Rules
- Authentication settings
