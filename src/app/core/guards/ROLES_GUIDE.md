# Guía del Sistema de Roles

## ✅ Implementación Completada

### 🛡️ Role Guard
Guard que protege rutas según el rol del usuario.

**Ubicación**: `src/app/core/guards/role.guard.ts`

**Funcionamiento**:
1. Verifica si el usuario está autenticado
2. Obtiene los roles requeridos de la ruta
3. Compara el rol del usuario con los roles permitidos
4. Si no tiene permiso, muestra alerta y redirige al dashboard

### 📊 Roles Disponibles

1. **administrador** - Acceso completo al sistema
2. **evaluador** - Puede crear y gestionar evaluaciones
3. **invitado** - Solo puede ver evaluaciones y resultados

### 🔐 Rutas Protegidas

#### Usuarios (Solo Administradores)
```typescript
{
  path: 'usuarios',
  canActivate: [roleGuard],
  data: { roles: ['administrador'] },
  loadChildren: () => import('./pages/usuarios/usuarios.module')
}
```

### 🎨 UI Condicional

El link de "Usuarios" en el navbar solo se muestra si el usuario es administrador:

```html
<li class="nav-item" *ngIf="isAdmin()">
  <a routerLink="/private/usuarios">
    Usuarios
  </a>
</li>
```

### 🔧 Métodos Útiles

**En cualquier componente**:

```typescript
// Verificar si es administrador
isAdmin(): boolean {
  return this.currentUser?.rol === 'administrador';
}

// Verificar múltiples roles
hasRole(roles: string[]): boolean {
  return roles.includes(this.currentUser?.rol);
}
```

**Uso en HTML**:

```html
<!-- Mostrar solo para administradores -->
<div *ngIf="isAdmin()">
  Contenido solo para administradores
</div>

<!-- Mostrar para múltiples roles -->
<div *ngIf="hasRole(['administrador', 'evaluador'])">
  Contenido para admin y evaluador
</div>
```

## 🚀 Cómo Agregar Más Restricciones

### 1. Proteger una Ruta

```typescript
{
  path: 'reportes',
  canActivate: [roleGuard],
  data: { roles: ['administrador', 'evaluador'] },
  loadChildren: () => import('./pages/reportes/reportes.module')
}
```

### 2. Ocultar Elementos en el Navbar

```html
<li class="nav-item" *ngIf="hasRole(['administrador', 'evaluador'])">
  <a routerLink="/private/reportes">
    Reportes
  </a>
</li>
```

### 3. Proteger Funcionalidades Dentro de un Componente

```typescript
// En el componente
canEdit(): boolean {
  return this.hasRole(['administrador', 'evaluador']);
}

canDelete(): boolean {
  return this.isAdmin();
}
```

```html
<!-- En el template -->
<button *ngIf="canEdit()" (click)="edit()">Editar</button>
<button *ngIf="canDelete()" (click)="delete()">Eliminar</button>
```

## 📋 Matriz de Permisos Actual

| Sección      | Administrador | Evaluador | Invitado |
|--------------|---------------|-----------|----------|
| Dashboard    | ✅            | ✅        | ✅       |
| Clubes       | ✅            | ✅        | ✅       |
| Pelotones    | ✅            | ✅        | ✅       |
| Evaluaciones | ✅            | ✅        | ✅       |
| Usuarios     | ✅            | ❌        | ❌       |

## 🔄 Flujo de Verificación

1. Usuario intenta acceder a `/private/usuarios`
2. `roleGuard` se ejecuta
3. Verifica si el usuario está autenticado
4. Obtiene el rol del usuario desde localStorage
5. Compara con roles permitidos: `['administrador']`
6. Si no coincide:
   - Muestra alerta "Acceso Denegado"
   - Redirige a `/private/dashboard`
7. Si coincide:
   - Permite el acceso

## ⚠️ Notas de Seguridad

**IMPORTANTE**: Esta protección es solo en el frontend. En producción debes:

1. **Validar permisos en el backend** (Firebase Security Rules)
2. **Verificar roles en cada operación** de Firestore
3. **No confiar solo en el frontend** para seguridad

### Ejemplo de Firebase Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo administradores pueden gestionar usuarios
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'administrador';
    }

    // Todos pueden leer clubes
    match /clubes/{clubId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ['administrador', 'evaluador'];
    }
  }
}
```

## 🎯 Próximas Mejoras

- [ ] Permisos granulares (crear, editar, eliminar por separado)
- [ ] Roles personalizados
- [ ] Permisos por módulo
- [ ] Logs de acceso
- [ ] Auditoría de cambios
- [ ] Roles temporales
- [ ] Delegación de permisos
