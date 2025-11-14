import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../../core/services/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkIfLoggedIn();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  checkIfLoggedIn() {
    // Verificar si ya hay una sesión activa
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.router.navigate(['/private/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      // Buscar usuario en Firestore
      const usuarios = await this.firebaseService.queryDocuments(
        'usuarios',
        'email',
        '==',
        email
      );

      if (usuarios.length === 0) {
        this.errorMessage = 'Usuario no encontrado';
        this.isLoading = false;
        return;
      }

      const usuario = usuarios[0] as any;

      // Verificar contraseña (en producción deberías usar hash)
      if (usuario.password !== password) {
        this.errorMessage = 'Contraseña incorrecta';
        this.isLoading = false;
        return;
      }

      // Guardar sesión
      const userSession = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      };

      localStorage.setItem('currentUser', JSON.stringify(userSession));

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${usuario.nombre}`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirigir al dashboard
      this.router.navigate(['/private/dashboard']);
    } catch (error) {
      console.error('Error en login:', error);
      this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
}
