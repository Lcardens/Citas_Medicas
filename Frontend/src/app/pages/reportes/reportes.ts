import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css'],
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);
  private cdr = inject(ChangeDetectorRef);

  citasPorMes: any[] = [];
  pacientesFrecuentes: any[] = [];
  cargandoMes = true;
  cargandoPacientes = true;
  totalCitasMes = 0;

  ngOnInit(): void {
    this.cargarCitasPorMes();
    this.cargarPacientesFrecuentes();
  }

  formatearMes(mes: string): string {
    if (!mes) return mes;
    const [anio, num] = mes.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const nombre = meses[parseInt(num, 10) - 1] || num;
    return `${nombre} ${anio}`;
  }

  cargarCitasPorMes(): void {
    this.cargandoMes = true;
    this.reporteService.citasPorMes().subscribe({
      next: (res: any) => {
        this.citasPorMes = res?.datos || [];
        this.totalCitasMes = this.citasPorMes.reduce((acc, item) => acc + item.total, 0);
        this.cargandoMes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar citas por mes:', err);
        this.cargandoMes = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarPacientesFrecuentes(): void {
    this.cargandoPacientes = true;
    this.reporteService.pacientesFrecuentes().subscribe({
      next: (res: any) => {
        this.pacientesFrecuentes = res?.datos || [];
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pacientes frecuentes:', err);
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      },
    });
  }
}
