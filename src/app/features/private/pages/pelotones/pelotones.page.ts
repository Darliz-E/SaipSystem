import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../../core/services/firebase.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

interface Peloton {
  id?: string;
  nombre: string;
  tipoMarcha: string;
  cantidadMiembros: number;
  instructor: string;
  createdAt?: any;
  updatedAt?: any;
}

@Component({
  selector: 'app-pelotones-page',
  templateUrl: './pelotones.page.html',
  styleUrls: ['./pelotones.page.scss'],
})
export class PelotonesPage implements OnInit {
  pelotonForm!: FormGroup;
  pelotones: Peloton[] = [];
  filteredPelotones: Peloton[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  isLoadingPelotones: boolean = true;
  isEditMode: boolean = false;
  currentPelotonId: string | null = null;
  modalInstance: any;

  tiposMarcha: string[] = [
    'Militar Drill',
    'Fancy Drill',
    'Soundtrack',
    'Silent Drill',
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadPelotones();
    this.setupModalListeners();
  }

  initForm() {
    this.pelotonForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipoMarcha: ['', Validators.required],
      cantidadMiembros: [0, [Validators.required, Validators.min(0)]],
      instructor: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  setupModalListeners() {
    const modalElement = document.getElementById('pelotonModal');
    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', () => {
        if (!this.modalInstance) {
          this.modalInstance = bootstrap.Modal.getInstance(modalElement);
        }
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!this.isLoading) {
          this.pelotonForm.reset();
          this.isEditMode = false;
          this.currentPelotonId = null;
        }
      });
    }
  }

  async loadPelotones() {
    try {
      this.isLoadingPelotones = true;
      const pelotones = await this.firebaseService.getDocuments('pelotones');
      this.pelotones = pelotones as Peloton[];
      this.filteredPelotones = [...this.pelotones];
    } catch (error) {
      console.error('Error cargando pelotones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pelotones',
      });
    } finally {
      this.isLoadingPelotones = false;
    }
  }

  filterPelotones() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredPelotones = [...this.pelotones];
      return;
    }

    this.filteredPelotones = this.pelotones.filter(
      (peloton) =>
        peloton.nombre.toLowerCase().includes(term) ||
        peloton.tipoMarcha.toLowerCase().includes(term) ||
        peloton.instructor.toLowerCase().includes(term)
    );
  }

  getTipoClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      Drill: 'tipo-drill',
      'Fancy Drill': 'tipo-fancy',
      'Exhibition Drill': 'tipo-exhibition',
      'Color Guard': 'tipo-color',
      'Flag Corps': 'tipo-flag',
      'Rifle Drill': 'tipo-rifle',
      'Saber Drill': 'tipo-saber',
      'Marcha Tradicional': 'tipo-tradicional',
      'Marcha Creativa': 'tipo-creativa',
    };
    return classes[tipo] || 'tipo-default';
  }

  openModal() {
    this.isEditMode = false;
    this.currentPelotonId = null;
    this.pelotonForm.reset();

    const modalElement = document.getElementById('pelotonModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  editPeloton(peloton: Peloton) {
    this.isEditMode = true;
    this.currentPelotonId = peloton.id || null;

    this.pelotonForm.patchValue({
      nombre: peloton.nombre,
      tipoMarcha: peloton.tipoMarcha,
      cantidadMiembros: peloton.cantidadMiembros,
      instructor: peloton.instructor,
    });

    const modalElement = document.getElementById('pelotonModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  async savePeloton() {
    if (this.pelotonForm.invalid) {
      this.pelotonForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const pelotonData = {
        nombre: this.pelotonForm.value.nombre,
        tipoMarcha: this.pelotonForm.value.tipoMarcha,
        cantidadMiembros: Number(this.pelotonForm.value.cantidadMiembros),
        instructor: this.pelotonForm.value.instructor,
        updatedAt: new Date(),
      };

      if (this.isEditMode && this.currentPelotonId) {
        // Actualizar pelotón existente
        await this.firebaseService.updateDocument(
          'pelotones',
          this.currentPelotonId,
          pelotonData
        );

        Swal.fire({
          icon: 'success',
          title: 'Pelotón actualizado',
          text: 'El pelotón se actualizó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Crear nuevo pelotón
        const newPeloton = {
          ...pelotonData,
          createdAt: new Date(),
        };

        await this.firebaseService.addDocument('pelotones', newPeloton);

        Swal.fire({
          icon: 'success',
          title: 'Pelotón creado',
          text: 'El pelotón se creó correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      this.closeModal();
      await this.loadPelotones();
    } catch (error) {
      console.error('Error guardando pelotón:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el pelotón',
      });
    } finally {
      this.isLoading = false;
    }
  }

  async confirmDelete(peloton: Peloton) {
    const result = await Swal.fire({
      title: '¿Eliminar pelotón?',
      html: `¿Estás seguro de eliminar el pelotón <strong>"${peloton.nombre}"</strong>?<br><br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a80b0b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed && peloton.id) {
      await this.deletePeloton(peloton.id);
    }
  }

  async deletePeloton(pelotonId: string) {
    try {
      await this.firebaseService.deleteDocument('pelotones', pelotonId);

      Swal.fire({
        icon: 'success',
        title: 'Pelotón eliminado',
        text: 'El pelotón se eliminó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      await this.loadPelotones();
    } catch (error) {
      console.error('Error eliminando pelotón:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el pelotón',
      });
    }
  }

  closeModal() {
    this.pelotonForm.reset();
    this.isEditMode = false;
    this.currentPelotonId = null;

    const modalElement = document.getElementById('pelotonModal');
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
