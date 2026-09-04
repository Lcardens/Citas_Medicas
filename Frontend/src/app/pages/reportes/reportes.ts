import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../core/services/reporte.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css'],
})
export class ReportesComponent implements OnInit, AfterViewInit, OnDestroy {
  private reporteService = inject(ReporteService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chartEstados') chartEstadosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartHistorial') chartHistorialRef!: ElementRef<HTMLCanvasElement>;

  chartEstados: Chart | null = null;
  chartHistorial: Chart | null = null;

  cargando = true;
  totalCitas = 0;

  estados: Record<string, number> = { Disponible: 0, Confirmada: 0, Atendida: 0, Cancelada: 0 };
  historial: any[] = [];

  pacientesFrecuentes: any[] = [];
  cargandoPacientes = true;

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.chartEstados?.destroy();
    this.chartHistorial?.destroy();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargandoPacientes = true;

    this.reporteService.citasPorEstado().subscribe({
      next: (res: any) => {
        const d = res?.datos;
        this.estados = d?.estados || this.estados;
        this.totalCitas = d?.total || 0;
        this.historial = d?.historial || [];
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.crearGraficoEstados();
          this.crearGraficoHistorial();
        }, 100);
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });

    this.reporteService.pacientesFrecuentes().subscribe({
      next: (res: any) => {
        this.pacientesFrecuentes = res?.datos || [];
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      },
    });
  }

  crearGraficoEstados(): void {
    if (!this.chartEstadosRef?.nativeElement) return;
    this.chartEstados?.destroy();

    const labels = ['Disponible', 'Confirmada', 'Atendida', 'Cancelada'];
    const data = labels.map((e) => this.estados[e] || 0);
    const colores = ['#6c757d', '#0d6efd', '#198754', '#dc3545'];

    this.chartEstados = new Chart(this.chartEstadosRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colores, borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } },
        },
      },
    });
  }

  crearGraficoHistorial(): void {
    if (!this.chartHistorialRef?.nativeElement || this.historial.length === 0) return;
    this.chartHistorial?.destroy();

    const labels = this.historial.map((h) => this.formatearMesCorto(h.mes));
    const colores: Record<string, string> = {
      Disponible: '#6c757d',
      Confirmada: '#0d6efd',
      Atendida: '#198754',
      Cancelada: '#dc3545',
    };

    const datasets = Object.keys(colores).map((estado) => ({
      label: estado,
      data: this.historial.map((h) => h[estado] || 0),
      backgroundColor: colores[estado],
      borderRadius: 4,
    }));

    this.chartHistorial = new Chart(this.chartHistorialRef.nativeElement, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } },
        },
      },
    });
  }

  formatearMes(mes: string): string {
    if (!mes) return mes;
    const [anio, num] = mes.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${meses[parseInt(num, 10) - 1] || num} ${anio}`;
  }

  formatearMesCorto(mes: string): string {
    if (!mes) return mes;
    const [, num] = mes.split('-');
    const cortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return cortos[parseInt(num, 10) - 1] || num;
  }

  get totalEstados(): number {
    return Object.values(this.estados).reduce((a, b) => a + b, 0);
  }

  porcentaje(valor: number): number {
    return this.totalEstados > 0 ? Math.round((valor / this.totalEstados) * 100) : 0;
  }
}
