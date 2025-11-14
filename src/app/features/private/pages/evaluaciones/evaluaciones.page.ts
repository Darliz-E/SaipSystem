import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FirebaseService } from '../../../../core/services/firebase.service';

declare var $: any;

interface Club {
  id?: string;
  nombre: string;
  zona: string;
  cantidadMiembros: number;
  director: string;
}

@Component({
  selector: 'app-evaluaciones-page',
  templateUrl: './evaluaciones.page.html',
  styleUrls: ['./evaluaciones.page.scss'],
})
export class EvaluacionesPage implements OnInit {
  tabActiva = 0;
  @ViewChild('cardToPdf') cardToPdfRef!: ElementRef;
  tituloActual = 'Uniformidad';
  cantidadActual = 1;
  hasEvaluaciones = true;
  isForEdit = false;
  clubes: Club[] = [];
  selectedClubId: string = '';
  isLoadingClubes: boolean = true;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.updateCantidad();
    this.loadClubes();
  }

  async loadClubes() {
    try {
      this.isLoadingClubes = true;
      const clubes = await this.firebaseService.getDocuments('clubes');
      this.clubes = clubes as Club[];
    } catch (error) {
      console.error('Error cargando clubes:', error);
    } finally {
      this.isLoadingClubes = false;
    }
  }

  onClubChange(event: any) {
    this.selectedClubId = event.target.value;
    // Aquí puedes filtrar las evaluaciones según el club seleccionado
    console.log('Club seleccionado:', this.selectedClubId);
  }

  updateCantidad() {
    // Aquí puedes actualizar la cantidad según el tab activo
    // Por ahora es estático, pero cuando conectes con Firebase será dinámico
    if (this.tabActiva === 0) {
      this.cantidadActual = 1;
      this.hasEvaluaciones = true;
    } else {
      this.cantidadActual = 0;
      this.hasEvaluaciones = false;
    }
  }

  openModalForEdit() {
    this.isForEdit = true;
    $('#staticBackdrop').modal('show');
  }

  cambiarTabActivo() {
    const variableDeFuncion = 'Hola Mundo'; // esto es una variable LOCAL
    // asi son las funciones cuando ya la entiendas la pones en ingles changeTabActive()
    // Las funciones son un pedazo de codigo que se ejecutara solo cuando la invoques
    // si la quieres invocar aqui en el .TS debes usar la palabra this.cambiarTabActivo()
    // si la usas en el html es solo el nombre cambiarTabActivo() entiendes?

    // IMPORTANTE TODO lo qeu hagas dentro de la funcion se queda en la funcion al menos que uses una variable GLOBAL
    // como funciona la funcion llamandola desde el TS
    alert('Hola Darliz como estas?');
  }

  changeTabActive(index: number) {
    this.tabActiva = index;
    if (index === 0) {
      this.tituloActual = 'Uniformidad';
    } else if (index === 1) {
      this.tituloActual = 'Disciplina';
    } else if (index === 2) {
      this.tituloActual = 'Marcha';
    } else {
      this.tituloActual = 'Pase de Lista';
    }
    this.updateCantidad();
  }

  private loadImageDataUrl(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async generatePdf() {
    try {
      const element = this.cardToPdfRef?.nativeElement as HTMLElement;
      if (!element) {
        console.error('No se encontró el elemento del card para generar PDF.');
        return;
      }
      //Esto fue chatgpt? el agente... que raro
      // Extraer datos del card y del modal (club)
      const club =
        document
          .querySelector('#staticBackdrop .borders-club h5')
          ?.textContent?.trim() || 'Desconocido';
      const puntuacion =
        element.querySelector('.puntuacion h3')?.textContent?.trim() || 'N/A';
      const porcentaje =
        element.querySelector('.badge')?.textContent?.trim() || 'N/A';
      const evaluadorRaw =
        element.querySelector('.card-body small')?.textContent?.trim() || '';
      const evaluador =
        evaluadorRaw.replace(/Nombre del evaluador:\s*/i, '').trim() ||
        'Desconocido';
      const ps = Array.from(element.querySelectorAll('.card-body p'));
      const observaciones =
        (ps.length ? ps[ps.length - 1].textContent?.trim() : '') ||
        'Sin observaciones';
      const fecha = new Date();
      const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(
        fecha.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${fecha.getFullYear()}`;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Intentar añadir logo (opcional)
      const logoData = await this.loadImageDataUrl('assets/logo.png');
      let startY = 20;
      if (logoData) {
        pdf.addImage(logoData, 'PNG', 10, 10, 22, 22);
        pdf.setFontSize(20);
        pdf.text('Reporte de Uniformidad', 40, 18);
        pdf.setFontSize(11);
        pdf.text(`Generado el: ${fechaStr}`, 40, 25);
        startY = 35;
      } else {
        pdf.setFontSize(20);
        pdf.text('Reporte de Uniformidad', 10, 20);
        pdf.setFontSize(11);
        pdf.text(`Generado el: ${fechaStr}`, 10, 28);
        startY = 35;
      }

      const head = [['Club', 'Puntuación', 'Porcentaje', 'Evaluador', 'Fecha']];

      // Construir filas desde los cards visibles
      const cards = Array.from(
        document.querySelectorAll('.card')
      ) as HTMLElement[];
      const selectEl = document.querySelector(
        'select.form-select'
      ) as HTMLSelectElement | null;
      const selectedClub = selectEl?.selectedOptions?.[0]?.text?.trim() || club;
      const body = cards.map((card) => {
        const punt =
          card.querySelector('.puntuacion h3')?.textContent?.trim() ||
          puntuacion;
        const porc =
          card.querySelector('.badge')?.textContent?.trim() || porcentaje;
        const evalRaw =
          card.querySelector('.card-body small')?.textContent?.trim() || '';
        const evalName =
          evalRaw.replace(/Nombre del evaluador:\s*/i, '').trim() || evaluador;
        const fechaCard = fechaStr;
        return [selectedClub, punt, porc, evalName, fechaCard];
      });
      if (body.length === 0) {
        body.push([selectedClub, puntuacion, porcentaje, evaluador, fechaStr]);
      }

      autoTable(pdf, {
        head,
        body,
        startY,
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: 'linebreak',
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [204, 85, 45],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left',
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 38 },
          4: { cellWidth: 28, halign: 'center' },
        },
        theme: 'grid',
      });

      // Campo de Observaciones debajo de la tabla
      const lastY = (pdf as any).lastAutoTable?.finalY ?? startY;
      const margin = 10;
      const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      pdf.setFontSize(12);
      pdf.text('Observaciones', margin, lastY + 10);
      pdf.setFontSize(11);
      const obsLines = pdf.splitTextToSize(observaciones, maxWidth);
      pdf.text(obsLines, margin, lastY + 18);

      pdf.save('reporte-uniformidad.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  }
}
