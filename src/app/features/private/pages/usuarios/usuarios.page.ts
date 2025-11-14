import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/services/firebase.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  rol: string;
  createdAt?: any;
  updatedAt?: any;
}

@Component({
  selector: 'app-usuarios-page',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  userForm!: FormGroup;
  usuarios: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  searchTerm: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  isLoadingUsers: boolean = true;
  isEditMode: boolean = false;
  currentUserId: string | null = null;
  modalInstance: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.setupModalListeners();
  }

  setupModalListeners() {
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      // Listener cuando se abre el modal
      modalElement.addEventListener('show.bs.modal', () => {
        if (!this.modalInstance) {
          this.modalInstance = bootstrap.Modal.getInstance(modalElement);
        }
      });

      // Listener cuando se cierra el modal
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Limpiar formulario si se cierra sin guardar
        if (!this.isLoading) {
          this.userForm.reset({ rol: 'evaluador' });
          this.showPassword = false;
          this.isEditMode = false;
          this.currentUserId = null;
        }
      });
    }
  }

  initForm() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['evaluador', Validators.required],
    });
  }

  async loadUsers() {
    try {
      this.isLoadingUsers = true;
      const users = await this.firebaseService.getDocuments('usuarios');
      this.usuarios = users as Usuario[];
      this.filteredUsers = [...this.usuarios];
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
      });
    } finally {
      this.isLoadingUsers = false;
    }
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = [...this.usuarios];
      return;
    }

    this.filteredUsers = this.usuarios.filter(
      (user) =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getRolDescription(): string {
    const rol = this.userForm.get('rol')?.value;
    const descriptions: { [key: string]: string } = {
      evaluador: 'Puede crear y gestionar evaluaciones',
      administrador: 'Acceso completo al sistema',
      invitado: 'Solo puede ver evaluaciones y resultados',
    };
    return descriptions[rol] || '';
  }

  async saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const userData = {
        nombre: this.userForm.value.nombre,
        email: this.userForm.value.email,
        rol: this.userForm.value.rol,
        updatedAt: new Date(),
      };

      if (this.isEditMode && this.currentUserId) {
        // Actualizar usuario existente
        await this.firebaseService.updateDocument(
          'usuarios',
          this.currentUserId,
          userData
        );

        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Crear nuevo usuario
        const newUser = {
          ...userData,
          password: this.userForm.value.password, // En producción, hashear la contraseña
          createdAt: new Date(),
        };

        await this.firebaseService.addDocument('usuarios', newUser);

        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se creó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      this.closeModal();
      await this.loadUsers();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el usuario',
      });
    } finally {
      this.isLoading = false;
    }
  }

  editUser(user: Usuario) {
    this.isEditMode = true;
    this.currentUserId = user.id || null;

    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });

    // En modo edición, la contraseña no es requerida
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    // Abrir modal
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  async confirmDelete(user: Usuario) {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e05656',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed && user.id) {
      await this.deleteUser(user.id);
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.firebaseService.deleteDocument('usuarios', userId);

      Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        text: 'El usuario se eliminó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      await this.loadUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el usuario',
      });
    }
  }

  closeModal() {
    // Resetear formulario
    this.userForm.reset({
      rol: 'evaluador',
    });
    this.showPassword = false;
    this.isEditMode = false;
    this.currentUserId = null;

    // Restaurar validación de contraseña
    this.userForm
      .get('password')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    // Cerrar modal
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      // Si ya existe una instancia, usarla
      if (this.modalInstance) {
        this.modalInstance.hide();
      } else {
        // Si no existe, obtener la instancia y cerrarla
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }

      // Remover backdrop manualmente si queda
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // Restaurar scroll del body
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }
  }
}
