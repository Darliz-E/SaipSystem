# Guía de Usuarios - Funcionalidades Implementadas

## ✅ Funcionalidades Completadas

### 1. Crear Usuario
- Formulario con validación completa
- Campos: Nombre, Email, Contraseña, Rol
- Campo de contraseña con botón mostrar/ocultar
- Validaciones en tiempo real
- Guardado en Firestore

### 2. Listar Usuarios
- Carga automática desde Firestore
- Muestra todos los usuarios en tarjetas
- Indicador de carga mientras se obtienen los datos
- Mensaje cuando no hay usuarios

### 3. Buscar Usuarios
- Búsqueda en tiempo real
- Filtra por nombre o correo electrónico
- Sin necesidad de presionar botón

### 4. Editar Usuario
- Click en "Editar" abre el modal con datos precargados
- Actualiza la información en Firestore
- La contraseña no es requerida al editar

### 5. Eliminar Usuario
- Confirmación con SweetAlert2
- Eliminación permanente de Firestore
- Mensaje de éxito/error

## 🎨 Roles Disponibles

1. **Administrador** - Acceso completo al sistema
2. **Evaluador** - Puede crear y gestionar evaluaciones
3. **Invitado** - Solo puede ver evaluaciones y resultados

## 🔐 Campo de Contraseña

- Botón de ojo para mostrar/ocultar
- Validación mínima de 6 caracteres
- Placeholder informativo
- Icono cambia entre `bi-eye` y `bi-eye-slash`

## 📊 Estructura de Datos en Firestore

```typescript
{
  nombre: string,
  email: string,
  password: string, // ⚠️ En producción, usar hash
  rol: 'administrador' | 'evaluador' | 'invitado',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## ⚠️ Notas Importantes

1. **Seguridad de Contraseñas**: Actualmente las contraseñas se guardan en texto plano. En producción, debes:
   - Usar Firebase Authentication para gestionar usuarios
   - O implementar hash de contraseñas (bcrypt, etc.)

2. **Reglas de Firestore**: Configura las reglas de seguridad en Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarios/{userId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Validaciones**: El formulario valida:
   - Nombre: mínimo 3 caracteres
   - Email: formato válido
   - Contraseña: mínimo 6 caracteres
   - Rol: requerido

## 🚀 Próximas Mejoras Sugeridas

- [ ] Integrar con Firebase Authentication
- [ ] Paginación de usuarios
- [ ] Filtros avanzados (por rol, fecha)
- [ ] Exportar lista de usuarios
- [ ] Enviar email de bienvenida
- [ ] Cambio de contraseña
- [ ] Permisos granulares por rol
