import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
export class ReportesComponent implements OnInit, OnDestroy {
  private reporteService = inject(ReporteService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chartEstados') chartEstadosRef!: ElementRef<HTMLCanvasElement>;

  chartEstados: Chart | null = null;

  cargando = true;
  totalCitas = 0;

  estados: Record<string, number> = { Disponible: 0, Confirmada: 0, Atendida: 0, Cancelada: 0 };

  pacientesFrecuentes: any[] = [];
  cargandoPacientes = true;

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.chartEstados?.destroy();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargandoPacientes = true;

    this.reporteService.citasPorEstado().subscribe({
      next: (res: any) => {
        const d = res?.datos;
        this.estados = d?.estados || this.estados;
        this.totalCitas = d?.total || 0;
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.crearGraficoEstados(), 100);
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
}
