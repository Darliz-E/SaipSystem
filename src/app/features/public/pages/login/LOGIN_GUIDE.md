# Guía de Login - Sistema de Autenticación

## ✅ Funcionalidades Implementadas

### 🔐 Pantalla de Login
- Formulario con validación completa
- Campos: Email y Contraseña
- Botón mostrar/ocultar contraseña
- Validaciones en tiempo real
- Estados de carga
- Mensajes de error personalizados

### 🔥 Autenticación con Firebase
- Consulta a la colección `usuarios` en Firestore
- Búsqueda por email
- Verificación de contraseña
- Almacenamiento de sesión en localStorage

### 🛡️ Guard de Autenticación
- Protege las rutas privadas
- Redirige al login si no está autenticado
- Verifica sesión activa en localStorage

### 🚪 Logout
- Botón en el menú de usuario
- Confirmación con SweetAlert2
- Limpia localStorage
- Redirige al login

## 📊 Flujo de Autenticación

1. Usuario ingresa email y contraseña
2. Se busca el usuario en Firestore por email
3. Se verifica la contraseña
4. Si es correcto, se guarda la sesión en localStorage
5. Se redirige al dashboard
6. El guard protege las rutas privadas

## 💾 Estructura de Sesión

```typescript
{
  id: string,
  nombre: string,
  email: string,
  rol: string
}
```

## 🎨 Diseño

- Fondo con gradiente azul
- Card centrado con sombra
- Logo con icono de escudo
- Animaciones suaves
- Responsive (móvil y desktop)
- Mensajes de error con animación

## 🔗 Rutas Configuradas

- `/login` - Pantalla de login
- `/private/*` - Rutas protegidas con authGuard
- `/` - Redirige a login
- `/**` - Redirige a login

## ⚠️ Notas de Seguridad

**IMPORTANTE**: Actualmente las contraseñas se comparan en texto plano. En producción debes:

1. **Usar Firebase Authentication** en lugar de Firestore
2. **O implementar hash de contraseñas** (bcrypt, etc.)
3. **Usar tokens JWT** para sesiones más seguras
4. **Implementar refresh tokens**
5. **Agregar rate limiting** para prevenir ataques de fuerza bruta

## 🚀 Mejoras Sugeridas

- [ ] Integrar Firebase Authentication
- [ ] Recordar sesión (checkbox)
- [ ] Recuperar contraseña
- [ ] Registro de nuevos usuarios
- [ ] Autenticación de dos factores (2FA)
- [ ] Logs de inicio de sesión
- [ ] Bloqueo por intentos fallidos
- [ ] Sesión con expiración automática

## 📝 Uso

### Para iniciar sesión:
1. Ve a `http://localhost:4200/login`
2. Ingresa un email de usuario existente en Firebase
3. Ingresa la contraseña correcta
4. Click en "Iniciar Sesión"

### Para cerrar sesión:
1. Click en el avatar (botón "A")
2. Click en "Cerrar Sesión"
3. Confirmar en el diálogo

## 🧪 Usuarios de Prueba

Usa los usuarios que creaste en la pantalla de Usuarios:
- Email: El que registraste
- Contraseña: La que asignaste

## 🔧 Personalización

Para cambiar el logo, edita:
```scss
.logo-container i {
  // Cambia el icono de Bootstrap Icons
}
```

Para cambiar colores:
```scss
$dark-blue: #1b263b;
$steel-blue: #465a75;
```
