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

interface EvaluacionMarcha {
  id?: string;
  pelotonId: string;
  pelotonNombre: string;
  instructor: string;
  tipoMarcha: string;
  cantidadMiembros: number;
  evaluadorNombre: string;
  evaluadorEmail: string;
  coEvaluadores: string[];
  items: Array<{
    name: string;
    value: number;
    max: number;
    comment?: string;
  }>;
  exhibiciones: Array<any>;
  totalParcial: number;
  faltasGenerales: string[];
  faltasEstiloFancy: string[];
  faltasEstiloMilitary: string[];
  faltasEstiloSilent: string[];
  faltasEstiloSoundtrack: string[];
  descalificadoPorFaltasGenerales: boolean;
  createdAt: string;
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
  evaluacionesMarcha: EvaluacionMarcha[] = [];
  evaluacionesMarchaFiltradas: EvaluacionMarcha[] = [];
  isLoadingMarcha: boolean = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.updateCantidad();
    this.loadClubes();
    this.loadEvaluacionesMarcha();
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

  async loadEvaluacionesMarcha() {
    try {
      this.isLoadingMarcha = true;
      const evaluaciones = await this.firebaseService.getDocuments(
        'evaluaciones_marcha'
      );
      this.evaluacionesMarcha = evaluaciones as EvaluacionMarcha[];
      this.evaluacionesMarchaFiltradas = [...this.evaluacionesMarcha];

      // Debug: mostrar datos de la primera evaluación
      if (this.evaluacionesMarcha.length > 0) {
        console.log('Primera evaluación:', this.evaluacionesMarcha[0]);
        console.log('Tipo de marcha:', this.evaluacionesMarcha[0].tipoMarcha);
        console.log('Fecha:', this.evaluacionesMarcha[0].createdAt);
      }

      this.updateCantidad();
    } catch (error) {
      console.error('Error cargando evaluaciones de marcha:', error);
    } finally {
      this.isLoadingMarcha = false;
    }
  }

  onClubChange(event: any) {
    this.selectedClubId = event.target.value;
    this.filtrarEvaluaciones();
  }

  filtrarEvaluaciones() {
    if (this.tabActiva === 2) {
      console.log('Filtrando evaluaciones...');
      console.log('Club seleccionado:', this.selectedClubId);
      console.log('Total evaluaciones:', this.evaluacionesMarcha.length);

      if (this.selectedClubId) {
        this.evaluacionesMarchaFiltradas = this.evaluacionesMarcha.filter(
          (ev) => ev.pelotonId === this.selectedClubId
        );
        console.log(
          'Evaluaciones filtradas:',
          this.evaluacionesMarchaFiltradas.length
        );
      } else {
        this.evaluacionesMarchaFiltradas = [...this.evaluacionesMarcha];
        console.log(
          'Mostrando todas las evaluaciones:',
          this.evaluacionesMarchaFiltradas.length
        );
      }
      this.updateCantidad();
    }
  }

  updateCantidad() {
    if (this.tabActiva === 0) {
      this.cantidadActual = 1;
      this.hasEvaluaciones = true;
    } else if (this.tabActiva === 2) {
      this.cantidadActual = this.evaluacionesMarchaFiltradas.length;
      this.hasEvaluaciones = this.cantidadActual > 0;
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
      this.filtrarEvaluaciones();
    } else {
      this.tituloActual = 'Pase de Lista';
    }
    this.updateCantidad();
  }

  getTipoMarchaLabel(tipo: string): string {
    if (!tipo) {
      console.warn('Tipo de marcha no definido');
      return 'No especificado';
    }

    const tipos: { [key: string]: string } = {
      MILITARY: 'Militar',
      FANCY: 'Fancy',
      SILENT: 'Silenciosa',
      SOUNDTRACK: 'Soundtrack',
    };

    const label = tipos[tipo.toUpperCase()];
    if (!label) {
      console.warn('Tipo de marcha desconocido:', tipo);
      return tipo;
    }

    return label;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    try {
      // Intentar parsear la fecha
      let date: Date;

      // Si es un timestamp de Firestore
      if (typeof dateString === 'object' && 'seconds' in dateString) {
        date = new Date((dateString as any).seconds * 1000);
      } else {
        date = new Date(dateString);
      }

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'N/A';
    }
  }

  getCoEvaluadoresText(coEvaluadores: string[]): string {
    if (!coEvaluadores || coEvaluadores.length === 0) {
      return 'Sin co-evaluadores';
    }
    return coEvaluadores.join(', ');
  }

  getEvaluacionesAgrupadasPorPeloton(): { [key: string]: EvaluacionMarcha[] } {
    const agrupadas: { [key: string]: EvaluacionMarcha[] } = {};

    this.evaluacionesMarchaFiltradas.forEach((evaluacion) => {
      const key = evaluacion.pelotonId;
      if (!agrupadas[key]) {
        agrupadas[key] = [];
      }
      agrupadas[key].push(evaluacion);
    });

    return agrupadas;
  }

  getPelotonKeys(): string[] {
    return Object.keys(this.getEvaluacionesAgrupadasPorPeloton());
  }

  hasFaltas(evaluacion: EvaluacionMarcha): boolean {
    return (
      (evaluacion.faltasGenerales && evaluacion.faltasGenerales.length > 0) ||
      (evaluacion.faltasEstiloFancy &&
        evaluacion.faltasEstiloFancy.length > 0) ||
      (evaluacion.faltasEstiloMilitary &&
        evaluacion.faltasEstiloMilitary.length > 0) ||
      (evaluacion.faltasEstiloSilent &&
        evaluacion.faltasEstiloSilent.length > 0) ||
      (evaluacion.faltasEstiloSoundtrack &&
        evaluacion.faltasEstiloSoundtrack.length > 0)
    );
  }

  getExhibicionTypeLabel(type: string): string {
    const tipos: { [key: string]: string } = {
      // Fancy
      FS: 'Exhibición Fancy/Soundtrack',
      FI: 'Innovación Fancy',
      FD: 'Grado de Dificultad Fancy',
      FJ: 'Impacto del Juez Fancy',
      FP: 'Precisión Fancy',

      // Military
      MS: 'Exhibición Military/Silent',
      MI: 'Innovación Military',
      MD: 'Grado de Dificultad Military',
      MP: 'Precisión Military',

      // Silent
      SI: 'Innovación Silent',
      SD: 'Grado de Dificultad Silent',
      SP: 'Precisión Silent',

      // Soundtrack
      SO: 'Innovación Soundtrack',
      TD: 'Grado de Dificultad Soundtrack',
      TJ: 'Impacto del Juez Soundtrack',
      TP: 'Precisión Soundtrack',
      TS: 'Sincronización Soundtrack',
    };
    return tipos[type] || type;
  }

  getExhibicionTotal(exhibicion: any): number {
    let total = 0;
    const excludeKeys = [
      'type',
      'index',
      'maxPorExhibicion',
      'comment',
      'commentPliegueRepliegue',
      'commentDeformaciones',
      'commentOriginalidad',
      'commentEjecucion',
      'commentComposicion',
      'commentCreatividad',
      'commentPlenas',
      'commentCadenciasNumericas',
      'commentIntervalos',
      'commentContraMarcha',
      'commentPasosDiferentesTiempos',
      'commentGradoDificultadDeformacion',
      'commentGradoDificultad',
      'commentImpactoJuez',
      'commentPrecision',
      'commentSincronizacion',
    ];

    for (const key in exhibicion) {
      if (!excludeKeys.includes(key) && typeof exhibicion[key] === 'number') {
        total += exhibicion[key];
      }
    }
    return total;
  }

  getExhibicionDetalles(
    exhibicion: any
  ): Array<{ label: string; value: number }> {
    const detalles: Array<{ label: string; value: number }> = [];
    const labelMap: { [key: string]: string } = {
      pliegueRepliegue: 'Pliegue/Repliegue',
      deformaciones: 'Deformaciones',
      creatividad: 'Creatividad',
      originalidad: 'Originalidad',
      ejecucion: 'Ejecución',
      composicion: 'Composición',
      plenas: 'Plenas',
      cadenciasNumericas: 'Cadencias Numéricas',
      intervalos: 'Intervalos',
      contraMarcha: 'Contra Marcha',
      pasosDiferentesTiempos: 'Pasos Diferentes Tiempos',
      gradoDificultadDeformacion: 'Grado Dificultad Deformación',
      gradoDificultad: 'Grado de Dificultad',
      impactoJuez: 'Impacto del Juez',
      precision: 'Precisión',
      sincronizacion: 'Sincronización',
    };

    for (const key in exhibicion) {
      if (labelMap[key] && typeof exhibicion[key] === 'number') {
        detalles.push({
          label: labelMap[key],
          value: exhibicion[key],
        });
      }
    }
    return detalles;
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

  getPromedioPeloton(pelotonId: string): string {
    const evaluaciones = this.getEvaluacionesAgrupadasPorPeloton()[pelotonId];
    if (!evaluaciones || evaluaciones.length === 0) return '0';

    const suma = evaluaciones.reduce((acc, ev) => acc + ev.totalParcial, 0);
    const promedio = suma / evaluaciones.length;
    return promedio.toFixed(2);
  }

  async exportarPelotoPDF(pelotonId: string) {
    const evaluaciones = this.getEvaluacionesAgrupadasPorPeloton()[pelotonId];
    if (!evaluaciones || evaluaciones.length === 0) return;

    const peloton = evaluaciones[0];
    const promedio = this.getPromedioPeloton(pelotonId);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let currentY = 15;

    // Título
    pdf.setFontSize(16);
    pdf.setTextColor(27, 38, 59);
    pdf.text(`Evaluaciones de Marcha - ${peloton.pelotonNombre}`, 15, currentY);
    currentY += 8;

    // Información del pelotón
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 88);
    pdf.text(
      `Instructor: ${peloton.instructor} | Miembros: ${
        peloton.cantidadMiembros
      } | Tipo: ${this.getTipoMarchaLabel(
        peloton.tipoMarcha
      )} | Promedio: ${promedio} pts`,
      15,
      currentY
    );
    currentY += 8;

    // Por cada evaluador, crear una tabla con su desglose
    evaluaciones.forEach((evaluacion, index) => {
      // Verificar si necesitamos una nueva página
      if (currentY > 180) {
        pdf.addPage();
        currentY = 15;
      }

      // Encabezado del evaluador
      pdf.setFontSize(11);
      pdf.setTextColor(70, 90, 117);
      pdf.text(
        `Evaluador: ${evaluacion.evaluadorNombre || evaluacion.evaluadorEmail}`,
        15,
        currentY
      );
      currentY += 1;

      // Co-evaluadores y fecha
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const coEval =
        evaluacion.coEvaluadores && evaluacion.coEvaluadores.length > 0
          ? `Co-evaluadores: ${this.getCoEvaluadoresText(
              evaluacion.coEvaluadores
            )}`
          : '';
      const fecha = `Fecha: ${this.formatDate(evaluacion.createdAt)}`;
      pdf.text(`${coEval} ${coEval ? ' | ' : ''}${fecha}`, 15, currentY + 4);
      currentY += 8;

      // Preparar datos de criterios base
      const criteriosData: any[] = [];
      if (evaluacion.items && evaluacion.items.length > 0) {
        evaluacion.items.forEach((item) => {
          criteriosData.push([
            item.name,
            `${item.value} / ${item.max}`,
            item.comment || '-',
          ]);
        });
      }

      // Tabla de criterios base
      if (criteriosData.length > 0) {
        autoTable(pdf, {
          head: [['Criterio Base', 'Puntos', 'Comentario']],
          body: criteriosData,
          startY: currentY,
          margin: { left: 15 },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [70, 90, 117],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 'auto' },
          },
          theme: 'grid',
        });
        currentY = (pdf as any).lastAutoTable.finalY + 3;
      }

      // Preparar datos de exhibiciones
      const exhibicionesData: any[] = [];
      if (evaluacion.exhibiciones && evaluacion.exhibiciones.length > 0) {
        evaluacion.exhibiciones.forEach((exhibicion) => {
          const detalles = this.getExhibicionDetalles(exhibicion);
          const detallesStr = detalles
            .map((d) => `${d.label}: ${d.value}`)
            .join(', ');
          const total = this.getExhibicionTotal(exhibicion);

          exhibicionesData.push([
            `${this.getExhibicionTypeLabel(exhibicion.type)} #${
              exhibicion.index
            }`,
            `${total} / ${exhibicion.maxPorExhibicion}`,
            detallesStr || '-',
            exhibicion.comment || '-',
          ]);
        });
      }

      // Tabla de exhibiciones
      if (exhibicionesData.length > 0) {
        autoTable(pdf, {
          head: [['Exhibición', 'Puntos', 'Desglose', 'Comentario']],
          body: exhibicionesData,
          startY: currentY,
          margin: { left: 15 },
          styles: {
            fontSize: 7,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [70, 90, 117],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 70 },
            3: { cellWidth: 'auto' },
          },
          theme: 'grid',
        });
        currentY = (pdf as any).lastAutoTable.finalY + 2;
      }

      // Total del evaluador
      pdf.setFontSize(10);
      pdf.setTextColor(57, 168, 85);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: ${evaluacion.totalParcial} puntos`, 15, currentY);
      pdf.setFont('helvetica', 'normal');
      currentY += 8;

      // Línea separadora entre evaluadores
      if (index < evaluaciones.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(15, currentY, 282, currentY);
        currentY += 5;
      }
    });

    pdf.save(`evaluacion-marcha-${peloton.pelotonNombre}.pdf`);
  }
}
