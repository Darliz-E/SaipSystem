import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {
  isUserMenuOpen = false;
  isNavbarOpen = false;
  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.rol === 'administrador';
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.rol);
  }

  getUserInitials(): string {
    if (!this.currentUser?.nombre) {
      return 'U';
    }

    const names = this.currentUser.nombre.trim().split(' ');

    if (names.length === 1) {
      // Si solo hay un nombre, tomar las primeras 2 letras
      return names[0].substring(0, 2).toUpperCase();
    }

    // Tomar la primera letra del primer nombre y la primera del último apellido
    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Cerrar navbar si está abierto
    if (this.isUserMenuOpen) {
      this.isNavbarOpen = false;
    }
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
    // Cerrar menú de usuario si está abierto
    if (this.isNavbarOpen) {
      this.isUserMenuOpen = false;
    }
  }

  closeNavbar() {
    this.isNavbarOpen = false;
  }

  async logout() {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1b263b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      localStorage.removeItem('currentUser');
      this.isUserMenuOpen = false;

      await Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Hasta pronto',
        timer: 1500,
        showConfirmButton: false,
      });

      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Cerrar menú de usuario si se hace clic fuera
    if (
      this.isUserMenuOpen &&
      !target.closest('.user-dropdown-card') &&
      !target.closest('.avatar-btn')
    ) {
      this.isUserMenuOpen = false;
    }

    // Cerrar navbar si se hace clic fuera
    if (
      this.isNavbarOpen &&
      !target.closest('.navbar-collapse') &&
      !target.closest('.navbar-toggler')
    ) {
      this.isNavbarOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscClose() {
    this.isUserMenuOpen = false;
    this.isNavbarOpen = false;
  }

  @HostListener('window:resize')
  onResize() {
    // Cerrar menús al cambiar tamaño de ventana
    if (window.innerWidth >= 992) {
      this.isNavbarOpen = false;
    }
  }
}
