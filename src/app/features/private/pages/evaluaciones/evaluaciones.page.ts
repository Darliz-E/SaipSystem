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
  uniformidadEvaluaciones: any[] = [];
  uniformidadEvaluacionesFiltradas: any[] = [];
  isLoadingUniformidad: boolean = false;
  uniformidadPorZona: Array<{
    zona: string;
    clubes: Array<{ clubId: string; clubNombre: string; evaluaciones: any[] }>;
  }> = [];
  isCreandoEvento: boolean = false;
  nuevoEvento: { nombre: string; fecha: string; hora: string } = {
    nombre: '',
    fecha: '',
    hora: '',
  };
  eventosPaseLista: Array<{
    id: string;
    nombre: string;
    fecha: string;
    hora: string;
    presentes: number;
    ausentes: number;
    clubesPresentes?: string[];
    clubesAusentes?: string[];
    zonas?: Array<{ zona: string; presentes: string[]; ausentes: string[] }>;
  }> = [];
  formEvento: { nombre: string; fecha: string; hora: string } = {
    nombre: '',
    fecha: '',
    hora: '',
  };
  editEventoId: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.updateCantidad();
    this.loadClubes();
    this.loadEvaluacionesMarcha();
    this.loadEventosPaseLista();
    this.loadUniformidadEvaluaciones();
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
    this.filtrarUniformidad();
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

  async loadUniformidadEvaluaciones() {
    try {
      this.isLoadingUniformidad = true;
      const docs = await this.firebaseService.getDocuments(
        'uniformidad_evaluaciones'
      );
      this.uniformidadEvaluaciones = (docs as any[]).map((d: any) => ({
        id: d.id,
        clubId: d.clubId || d.pelotonId || '',
        clubNombre: d.clubNombre || d.pelotonNombre || '',
        evaluadorNombre:
          d.updatedBy || d.evaluadorNombre || d.evaluadorEmail || '',
        total: d.total || d.totalParcial || d.puntuacion || 0,
        max: d.max || 100,
        observaciones: d.observaciones || d.comentario || '',
        createdAt: d.updatedAt || d.createdAt,
        items: d.items || [],
        status: d.status || d.estado || 'Pendiente',
      }));
      this.filtrarUniformidad();
      this.updateCantidad();
    } catch (error) {
      console.error('Error cargando evaluaciones de uniformidad:', error);
    } finally {
      this.isLoadingUniformidad = false;
    }
  }

  filtrarUniformidad() {
    if (this.selectedClubId) {
      this.uniformidadEvaluacionesFiltradas =
        this.uniformidadEvaluaciones.filter(
          (ev) => ev.clubId === this.selectedClubId
        );
    } else {
      this.uniformidadEvaluacionesFiltradas = [...this.uniformidadEvaluaciones];
    }
    this.buildUniformidadPorZona(this.uniformidadEvaluacionesFiltradas);
  }

  buildUniformidadPorZona(data: any[]) {
    const zonasMap: {
      [zona: string]: {
        [clubId: string]: { clubNombre: string; evaluaciones: any[] };
      };
    } = {};
    data.forEach((ev) => {
      const club = this.clubes.find((c) => c.id === ev.clubId);
      const zona = club?.zona || 'Sin zona';
      if (!zonasMap[zona]) zonasMap[zona] = {};
      if (!zonasMap[zona][ev.clubId]) {
        zonasMap[zona][ev.clubId] = {
          clubNombre: ev.clubNombre || club?.nombre || 'Club',
          evaluaciones: [],
        };
      }
      zonasMap[zona][ev.clubId].evaluaciones.push(ev);
    });
    this.uniformidadPorZona = Object.keys(zonasMap)
      .map((z) => ({
        zona: z,
        clubes: Object.keys(zonasMap[z])
          .map((clubId) => ({
            clubId,
            clubNombre: zonasMap[z][clubId].clubNombre,
            evaluaciones: zonasMap[z][clubId].evaluaciones.sort((a, b) => {
              const ta =
                typeof a.createdAt === 'object' && a.createdAt?.seconds
                  ? a.createdAt.seconds * 1000
                  : new Date(a.createdAt).getTime();
              const tb =
                typeof b.createdAt === 'object' && b.createdAt?.seconds
                  ? b.createdAt.seconds * 1000
                  : new Date(b.createdAt).getTime();
              return tb - ta;
            }),
          }))
          .sort((a, b) => a.clubNombre.localeCompare(b.clubNombre)),
      }))
      .sort((a, b) => {
        const ai = this.getZonaIndex(a.zona);
        const bi = this.getZonaIndex(b.zona);
        if (ai !== bi) return ai - bi;
        return a.zona.localeCompare(b.zona);
      });
  }

  getZonaIndex(z: string): number {
    const m = /^\s*Zona\s*(\d+)/i.exec(z || '');
    if (m) return parseInt(m[1], 10);
    if ((z || '').toLowerCase() === 'sin zona') return 9999;
    return 5000;
  }

  updateCantidad() {
    if (this.tabActiva === 0) {
      this.cantidadActual = this.uniformidadEvaluacionesFiltradas.length;
      this.hasEvaluaciones = this.cantidadActual > 0;
    } else if (this.tabActiva === 2) {
      this.cantidadActual = this.evaluacionesMarchaFiltradas.length;
      this.hasEvaluaciones = this.cantidadActual > 0;
    } else if (this.tabActiva === 3) {
      this.cantidadActual = this.eventosPaseLista.length;
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

  getTotalDeducciones(items: any[]): number {
    return (items || []).reduce(
      (acc, it) =>
        acc +
        (typeof it.deduc === 'string' ? parseFloat(it.deduc) : it.deduc || 0),
      0
    );
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

  async generateUniformidadReport(zona?: string) {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const fecha = new Date();
      const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(
        fecha.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${fecha.getFullYear()}`;
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

      const zonas = zona
        ? this.uniformidadPorZona.filter((z) => z.zona === zona)
        : this.uniformidadPorZona;

      for (const z of zonas) {
        pdf.setFontSize(14);
        pdf.text(`Zona ${z.zona}`, 10, startY);
        startY += 6;

        const head = [
          ['Club', 'Evaluador', 'Hora', 'Total Restado', 'Total Puntos'],
        ];
        const body: any[] = [];
        z.clubes.forEach((c) => {
          c.evaluaciones.forEach((ev) => {
            const totalRestado = this.getTotalDeducciones(ev.items || []);
            body.push([
              c.clubNombre,
              ev.evaluadorNombre || '-',
              this.formatDate(ev.createdAt),
              totalRestado > 0 ? `-${totalRestado}` : '0',
              String(ev.total ?? 0),
            ]);
          });
        });

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
            fillColor: [27, 38, 59],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left',
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          theme: 'grid',
        });

        startY = (pdf as any).lastAutoTable?.finalY + 10;
        const pageHeight = pdf.internal.pageSize.getHeight();
        if (startY > pageHeight - 20) {
          pdf.addPage();
          startY = 20;
        }
      }

      const fileName = zona
        ? `uniformidad_${zona}.pdf`
        : 'uniformidad_reporte.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando reporte de uniformidad:', error);
    }
  }

  getTotalPeloton(pelotonId: string): number {
    const evaluaciones = this.getEvaluacionesAgrupadasPorPeloton()[pelotonId];
    if (!evaluaciones || evaluaciones.length === 0) return 0;

    const total = evaluaciones.reduce((acc, ev) => acc + ev.totalParcial, 0);
    return total;
  }

  async exportarPelotoPDF(pelotonId: string) {
    const evaluaciones = this.getEvaluacionesAgrupadasPorPeloton()[pelotonId];
    if (!evaluaciones || evaluaciones.length === 0) return;

    const peloton = evaluaciones[0];
    const totalPuntos = this.getTotalPeloton(pelotonId);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let currentY = 15;

    // Intentar agregar logo
    try {
      console.log('Intentando cargar logo...');
      const logoData = await this.loadImageDataUrl('assets/logo.png');
      console.log('Logo cargado:', logoData ? 'SI' : 'NO');
      if (logoData) {
        pdf.addImage(logoData, 'PNG', 15, currentY, 20, 20);
        console.log('Logo agregado al PDF');
        // Título al lado del logo
        pdf.setFontSize(16);
        pdf.setTextColor(27, 38, 59);
        pdf.text(
          `Evaluaciones de Marcha - ${peloton.pelotonNombre}`,
          40,
          currentY + 8
        );
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 88);
        pdf.text(
          `Instructor: ${peloton.instructor} | Miembros: ${
            peloton.cantidadMiembros
          } | Tipo: ${this.getTipoMarchaLabel(
            peloton.tipoMarcha
          )} | Total: ${totalPuntos} pts`,
          40,
          currentY + 15
        );
        currentY += 25;
      } else {
        // Sin logo, usar diseño anterior
        pdf.setFontSize(16);
        pdf.setTextColor(27, 38, 59);
        pdf.text(
          `Evaluaciones de Marcha - ${peloton.pelotonNombre}`,
          15,
          currentY
        );
        currentY += 8;
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 88);
        pdf.text(
          `Instructor: ${peloton.instructor} | Miembros: ${
            peloton.cantidadMiembros
          } | Tipo: ${this.getTipoMarchaLabel(
            peloton.tipoMarcha
          )} | Total: ${totalPuntos} pts`,
          15,
          currentY
        );
        currentY += 8;
      }
    } catch (error) {
      console.error('Error cargando logo:', error);
      // Sin logo, usar diseño anterior
      pdf.setFontSize(16);
      pdf.setTextColor(27, 38, 59);
      pdf.text(
        `Evaluaciones de Marcha - ${peloton.pelotonNombre}`,
        15,
        currentY
      );
      currentY += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 88);
      pdf.text(
        `Instructor: ${peloton.instructor} | Miembros: ${
          peloton.cantidadMiembros
        } | Tipo: ${this.getTipoMarchaLabel(
          peloton.tipoMarcha
        )} | Total: ${totalPuntos} pts`,
        15,
        currentY
      );
      currentY += 8;
    }

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

      // Preparar datos de criterios base (solo los que tienen valor > 0)
      const criteriosData: any[] = [];
      if (evaluacion.items && evaluacion.items.length > 0) {
        evaluacion.items.forEach((item) => {
          if (item.value > 0) {
            criteriosData.push([
              item.name,
              `${item.value} / ${item.max}`,
              item.comment || '-',
            ]);
          }
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

      // Preparar datos de exhibiciones (solo las que tienen puntos > 0)
      const exhibicionesData: any[] = [];
      if (evaluacion.exhibiciones && evaluacion.exhibiciones.length > 0) {
        evaluacion.exhibiciones.forEach((exhibicion) => {
          const total = this.getExhibicionTotal(exhibicion);

          // Solo incluir si tiene puntos
          if (total > 0) {
            const detalles = this.getExhibicionDetalles(exhibicion);
            // Filtrar detalles con valor > 0
            const detallesFiltrados = detalles.filter((d) => d.value > 0);
            const detallesStr = detallesFiltrados
              .map((d) => `${d.label}: ${d.value}`)
              .join(', ');

            exhibicionesData.push([
              `${this.getExhibicionTypeLabel(exhibicion.type)} #${
                exhibicion.index
              }`,
              `${total} / ${exhibicion.maxPorExhibicion}`,
              detallesStr || '-',
              exhibicion.comment || '-',
            ]);
          }
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

  imprimirTicket(pelotonId: string) {
    try {
      const evaluaciones = this.getEvaluacionesAgrupadasPorPeloton()[pelotonId];
      if (!evaluaciones || evaluaciones.length === 0) {
        alert('No hay evaluaciones para imprimir');
        return;
      }

      const peloton = evaluaciones[0];
      const totalPuntos = this.getTotalPeloton(pelotonId);

      // Crear contenido HTML para impresión térmica de 58mm
      let ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket - ${peloton.pelotonNombre}</title>
        <style>
          @media print {
            @page { margin: 0; size: 58mm auto; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Courier New', monospace;
            width: 58mm;
            padding: 5mm;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            font-weight: 600;
          }
          .center { text-align: center; }
          .bold { font-weight: 900; color: #000; }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
            font-weight: 900;
          }
          .section {
            margin: 8px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-weight: 700;
          }
          .label { font-weight: 900; color: #000; }
          .total {
            font-size: 14px;
            font-weight: 900;
            margin: 5px 0;
            color: #000;
          }
          .footer {
            text-align: center;
            font-size: 9px;
            margin-top: 10px;
            font-weight: 700;
          }
          .logo {
            text-align: center;
            margin-bottom: 8px;
            padding: 8px 0;
            border: 3px solid #000;
            border-radius: 4px;
            background-color: #000;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 900;
            color: #fff;
            letter-spacing: 3px;
            font-family: Arial, sans-serif;
          }
          .logo-subtitle {
            font-size: 8px;
            color: #fff;
            font-weight: 700;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="logo">
          <div class="logo-text">SAIPH</div>
          <div class="logo-subtitle">By Orion System</div>
        </div>
        <div class="header center">
          <div class="bold" style="font-size: 12px;">EVALUACION DE MARCHA</div>
          <div>${peloton.pelotonNombre}</div>
          <div style="font-size: 8px;">${new Date().toLocaleString(
            'es-ES'
          )}</div>
        </div>

        <div class="section">
          <div class="row">
            <span class="label">Instructor:</span>
            <span>${peloton.instructor}</span>
          </div>
          <div class="row">
            <span class="label">Miembros:</span>
            <span>${peloton.cantidadMiembros}</span>
          </div>
          <div class="row">
            <span class="label">Tipo:</span>
            <span>${this.getTipoMarchaLabel(peloton.tipoMarcha)}</span>
          </div>
        </div>

        <div class="section">
          <div class="center bold" style="margin-bottom: 5px;">EVALUACIONES</div>
    `;

      // Agregar cada evaluación
      evaluaciones.forEach((evaluacion, index) => {
        ticketHTML += `
          <div style="margin: 5px 0; padding: 3px 0; ${
            index > 0 ? 'border-top: 1px dotted #000;' : ''
          }">
            <div class="bold">${index + 1}. ${
          evaluacion.evaluadorNombre || evaluacion.evaluadorEmail
        }</div>
            ${
              evaluacion.coEvaluadores && evaluacion.coEvaluadores.length > 0
                ? `<div style="font-size: 8px;">Co-eval: ${this.getCoEvaluadoresText(
                    evaluacion.coEvaluadores
                  )}</div>`
                : ''
            }
            <div class="row">
              <span>Puntuacion:</span>
              <span class="bold">${evaluacion.totalParcial} pts</span>
            </div>
            <div style="font-size: 8px;">${this.formatDate(
              evaluacion.createdAt
            )}</div>
      `;

        // Agregar criterios base
        if (evaluacion.items && evaluacion.items.length > 0) {
          ticketHTML += `<div style="margin-top: 3px; font-size: 9px;">`;
          evaluacion.items.forEach((item) => {
            ticketHTML += `
            <div class="row">
              <span>${item.name}:</span>
              <span>${item.value}/${item.max}</span>
            </div>
          `;
          });
          ticketHTML += `</div>`;
        }

        // Agregar exhibiciones
        if (evaluacion.exhibiciones && evaluacion.exhibiciones.length > 0) {
          ticketHTML += `<div style="margin-top: 3px; font-size: 8px;">`;
          ticketHTML += `<div class="bold">Exhibiciones:</div>`;
          evaluacion.exhibiciones.forEach((exhibicion) => {
            const total = this.getExhibicionTotal(exhibicion);
            ticketHTML += `
            <div class="row">
              <span>${exhibicion.type} #${exhibicion.index}:</span>
              <span>${total}/${exhibicion.maxPorExhibicion}</span>
            </div>
          `;
          });
          ticketHTML += `</div>`;
        }

        ticketHTML += `</div>`;
      });

      ticketHTML += `
        </div>

        <div class="section center">
          <div class="total">PROMEDIO TOTAL</div>
          <div style="font-size: 16px; font-weight: bold;">${totalPuntos} PUNTOS</div>
        </div>

        <div class="footer">
          <div>Saiph - By Orion System</div>
          <div>Gracias por usar nuestro sistema</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

      // Intentar abrir ventana de impresión
      const printWindow = window.open('', '_blank', 'width=300,height=600');
      if (printWindow) {
        printWindow.document.write(ticketHTML);
        printWindow.document.close();
      } else {
        // Alternativa: usar iframe oculto si las ventanas emergentes están bloqueadas
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(ticketHTML);
          iframeDoc.close();

          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 100);
          }, 250);
        }
      }
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      alert(
        'Error al generar el ticket de impresión. Revisa la consola para más detalles.'
      );
    }
  }
  openEventoModalCreate() {
    this.editEventoId = null;
    this.formEvento = { nombre: '', fecha: '', hora: '' };
    $('#modalEventoPaseLista').modal('show');
  }

  openEventoModalEdit(ev: any) {
    this.editEventoId = ev.id;
    this.formEvento = { nombre: ev.nombre, fecha: ev.fecha, hora: ev.hora };
    $('#modalEventoPaseLista').modal('show');
  }

  async saveEvento() {
    const { nombre, fecha, hora } = this.formEvento;
    if (!nombre || !fecha || !hora) return;
    if (this.editEventoId) {
      const updateData = { nombre, fecha, hora, updatedAt: new Date() };
      this.firebaseService
        .updateDocument('pase_lista_eventos', this.editEventoId, updateData)
        .then(() => {
          this.eventosPaseLista = this.eventosPaseLista.map((e) =>
            e.id === this.editEventoId ? { ...e, ...updateData } : e
          );
        })
        .catch((err) => console.error('Error actualizando evento:', err));
    } else {
      let presentesNombres = (this.clubes || []).map((c) => c.nombre);
      if (!presentesNombres.length) {
        try {
          const clubes = (await this.firebaseService.getDocuments(
            'clubes'
          )) as Club[];
          this.clubes = clubes;
          presentesNombres = clubes.map((c) => c.nombre);
        } catch (e) {
          console.error('No se pudieron cargar clubes para el evento:', e);
        }
      }

      const zonasMap: {
        [zona: string]: { presentes: string[]; ausentes: string[] };
      } = {};
      (this.clubes || []).forEach((club) => {
        const zona = (club as any).zona || 'Sin zona';
        if (!zonasMap[zona]) zonasMap[zona] = { presentes: [], ausentes: [] };
        zonasMap[zona].presentes.push(club.nombre);
      });

      const zonasArray = Object.keys(zonasMap).map((z) => ({
        zona: z,
        presentes: zonasMap[z].presentes,
        ausentes: zonasMap[z].ausentes,
      }));

      const ev = {
        nombre,
        fecha,
        hora,
        presentes: presentesNombres.length,
        ausentes: 0,
        clubesPresentes: presentesNombres,
        clubesAusentes: [],
        zonas: zonasArray,
        createdAt: new Date(),
      } as any;
      await this.firebaseService
        .addDocument('pase_lista_eventos', ev)
        .catch((err) => console.error('Error creando evento:', err));
      await this.loadEventosPaseLista();
    }
    this.editEventoId = null;
    this.formEvento = { nombre: '', fecha: '', hora: '' };
    $('#modalEventoPaseLista').modal('hide');
    if (this.tabActiva === 3) this.updateCantidad();
  }

  async loadEventosPaseLista() {
    try {
      const eventos = await this.firebaseService.getDocuments(
        'pase_lista_eventos'
      );
      this.eventosPaseLista = (eventos as any[])
        .map((e: any) => {
          const zonas: Array<{
            zona: string;
            presentes: string[];
            ausentes: string[];
          }> = e.zonas || [];
          const presentesSum = zonas.length
            ? zonas.reduce((acc, z) => acc + (z.presentes?.length || 0), 0)
            : e.presentes || e.clubesPresentes?.length || 0;
          const ausentesSum = zonas.length
            ? zonas.reduce((acc, z) => acc + (z.ausentes?.length || 0), 0)
            : e.ausentes || e.clubesAusentes?.length || 0;
          return {
            id: e.id,
            nombre: e.nombre,
            fecha: e.fecha,
            hora: e.hora,
            presentes: presentesSum,
            ausentes: ausentesSum,
            clubesPresentes: e.clubesPresentes || [],
            clubesAusentes: e.clubesAusentes || [],
            zonas,
            createdAt: e.createdAt,
          };
        })
        .sort((a: any, b: any) => {
          const getTime = (x: any) => {
            if (x.createdAt?.seconds) return x.createdAt.seconds * 1000;
            if (x.createdAt) return new Date(x.createdAt).getTime();
            if (x.fecha && x.hora)
              return new Date(`${x.fecha}T${x.hora}:00`).getTime();
            return 0;
          };
          return getTime(b) - getTime(a);
        });
      if (this.tabActiva === 3) this.updateCantidad();
    } catch (error) {
      console.error('Error cargando eventos de pase de lista:', error);
    }
  }

  async exportarPaseListaPDF(ev: any) {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const fecha = new Date();
      const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(
        fecha.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${fecha.getFullYear()}`;
      const logoData = await this.loadImageDataUrl('assets/logo.png');
      let startY = 20;
      if (logoData) {
        pdf.addImage(logoData, 'PNG', 10, 10, 22, 22);
        pdf.setFontSize(20);
        pdf.text('Pase de Lista', 40, 18);
        pdf.setFontSize(11);
        pdf.text(`Generado el: ${fechaStr}`, 40, 25);
        startY = 35;
      } else {
        pdf.setFontSize(20);
        pdf.text('Pase de Lista', 10, 20);
        pdf.setFontSize(11);
        pdf.text(`Generado el: ${fechaStr}`, 10, 28);
        startY = 35;
      }

      pdf.setFontSize(12);
      pdf.text(`Evento: ${ev.nombre}`, 10, startY);
      pdf.text(`Fecha: ${ev.fecha}  Hora: ${ev.hora}`, 10, startY + 6);
      pdf.text(
        `Presentes: ${ev.presentes}  Ausentes: ${ev.ausentes}`,
        10,
        startY + 12
      );
      startY += 18;

      const getZonaForClub = (clubNombre: string): string => {
        const club = (this.clubes || []).find(
          (c: any) => c.nombre === clubNombre
        );
        return (club as any)?.zona || 'Sin zona';
      };

      const presentesRows: any[] = [];
      const ausentesRows: any[] = [];
      if (ev.zonas && ev.zonas.length) {
        ev.zonas.forEach((z: any) => {
          (z.presentes || []).forEach((c: string) =>
            presentesRows.push([z.zona, c])
          );
          (z.ausentes || []).forEach((c: string) =>
            ausentesRows.push([z.zona, c])
          );
        });
      } else {
        (ev.clubesPresentes || []).forEach((c: string) =>
          presentesRows.push([getZonaForClub(c), c])
        );
        (ev.clubesAusentes || []).forEach((c: string) =>
          ausentesRows.push([getZonaForClub(c), c])
        );
      }

      if (presentesRows.length) {
        autoTable(pdf, {
          head: [['Zona', 'Club']],
          body: presentesRows,
          startY,
          styles: { fontSize: 10, cellPadding: 2 },
          headStyles: {
            fillColor: [57, 168, 85],
            textColor: 255,
            fontStyle: 'bold',
          },
          theme: 'grid',
        });
        startY = (pdf as any).lastAutoTable?.finalY + 8;
      }

      if (ausentesRows.length) {
        pdf.setFontSize(12);
        pdf.setTextColor(204, 85, 45);
        pdf.text('Ausentes', 10, startY);
        startY += 4;
        autoTable(pdf, {
          head: [['Zona', 'Club']],
          body: ausentesRows,
          startY,
          styles: { fontSize: 10, cellPadding: 2 },
          headStyles: {
            fillColor: [204, 85, 45],
            textColor: 255,
            fontStyle: 'bold',
          },
          theme: 'grid',
        });
        startY = (pdf as any).lastAutoTable?.finalY + 8;
      }

      pdf.save(`pase-lista-${ev.nombre}.pdf`);
    } catch (error) {
      console.error('Error generando PDF de pase de lista:', error);
    }
  }
}
