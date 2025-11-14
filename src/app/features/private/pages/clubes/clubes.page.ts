import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/services/firebase.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

interface Club {
  id?: string;
  nombre: string;
  zona: string;
  cantidadMiembros: number;
  director: string;
  createdAt?: any;
  updatedAt?: any;
}

@Component({
  selector: 'app-clubes-page',
  templateUrl: './clubes.page.html',
  styleUrls: ['./clubes.page.scss'],
})
export class ClubesPage implements OnInit {
  clubForm!: FormGroup;
  clubes: Club[] = [];
  filteredClubes: Club[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  isLoadingClubes: boolean = true;
  isEditMode: boolean = false;
  currentClubId: string | null = null;
  modalInstance: any;

  zonas: string[] = [
    'Zona 1',
    'Zona 2',
    'Zona 3',
    'Zona 4',
    'Zona 5',
    'Zona 6',
    'Zona 7',
    'Zona 8',
    'Zona 9',
    'Zona 10',
    'Zona 11',
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClubes();
    this.setupModalListeners();
  }

  initForm() {
    this.clubForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      zona: ['', Validators.required],
      cantidadMiembros: [0, [Validators.required, Validators.min(0)]],
      director: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  setupModalListeners() {
    const modalElement = document.getElementById('clubModal');
    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', () => {
        if (!this.modalInstance) {
          this.modalInstance = bootstrap.Modal.getInstance(modalElement);
        }
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!this.isLoading) {
          this.clubForm.reset();
          this.isEditMode = false;
          this.currentClubId = null;
        }
      });
    }
  }

  async loadClubes() {
    try {
      this.isLoadingClubes = true;
      const clubes = await this.firebaseService.getDocuments('clubes');
      this.clubes = clubes as Club[];
      this.filteredClubes = [...this.clubes];
    } catch (error) {
      console.error('Error cargando clubes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los clubes',
      });
    } finally {
      this.isLoadingClubes = false;
    }
  }

  filterClubes() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClubes = [...this.clubes];
      return;
    }

    this.filteredClubes = this.clubes.filter(
      (club) =>
        club.nombre.toLowerCase().includes(term) ||
        club.zona.toLowerCase().includes(term) ||
        club.director.toLowerCase().includes(term)
    );
  }

  openModal() {
    this.isEditMode = false;
    this.currentClubId = null;
    this.clubForm.reset();

    const modalElement = document.getElementById('clubModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  editClub(club: Club) {
    this.isEditMode = true;
    this.currentClubId = club.id || null;

    this.clubForm.patchValue({
      nombre: club.nombre,
      zona: club.zona,
      cantidadMiembros: club.cantidadMiembros,
      director: club.director,
    });

    const modalElement = document.getElementById('clubModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  async saveClub() {
    if (this.clubForm.invalid) {
      this.clubForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const clubData = {
        nombre: this.clubForm.value.nombre,
        zona: this.clubForm.value.zona,
        cantidadMiembros: Number(this.clubForm.value.cantidadMiembros),
        director: this.clubForm.value.director,
        updatedAt: new Date(),
      };

      if (this.isEditMode && this.currentClubId) {
        // Actualizar club existente
        await this.firebaseService.updateDocument(
          'clubes',
          this.currentClubId,
          clubData
        );

        Swal.fire({
          icon: 'success',
          title: 'Club actualizado',
          text: 'El club se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Crear nuevo club
        const newClub = {
          ...clubData,
          createdAt: new Date(),
        };

        await this.firebaseService.addDocument('clubes', newClub);

        Swal.fire({
          icon: 'success',
          title: 'Club creado',
          text: 'El club se creó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      this.closeModal();
      await this.loadClubes();
    } catch (error) {
      console.error('Error guardando club:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el club',
      });
    } finally {
      this.isLoading = false;
    }
  }

  async confirmDelete(club: Club) {
    const result = await Swal.fire({
      title: '¿Eliminar club?',
      html: `¿Estás seguro de eliminar el club <strong>"${club.nombre}"</strong>?<br><br>Esta acción no se puede deshacer y se eliminarán todas las evaluaciones asociadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a80b0b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed && club.id) {
      await this.deleteClub(club.id);
    }
  }

  async deleteClub(clubId: string) {
    try {
      await this.firebaseService.deleteDocument('clubes', clubId);

      Swal.fire({
        icon: 'success',
        title: 'Club eliminado',
        text: 'El club se eliminó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      await this.loadClubes();
    } catch (error) {
      console.error('Error eliminando club:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el club',
      });
    }
  }

  closeModal() {
    this.clubForm.reset();
    this.isEditMode = false;
    this.currentClubId = null;

    const modalElement = document.getElementById('clubModal');
    if (modalElement) {
      if (this.modalInstance) {
        this.modalInstance.hide();
      } else {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }
  }
}
