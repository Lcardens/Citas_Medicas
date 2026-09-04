import {
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-buscador-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador-paciente.html',
  styleUrls: ['./buscador-paciente.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BuscadorPacienteComponent),
      multi: true,
    },
  ],
})
export class BuscadorPacienteComponent implements ControlValueAccessor {
  @Input() pacientes: any[] = [];
  @Input() placeholder = 'Buscar paciente...';
  @Input() required = false;

  valor: string = '';
  abierto = false;
  timeout: any;

  get textoBusqueda(): string {
    if (!this.valor) return '';
    const encontrado = this.pacientes.find(
      (p) => p._id === this.valor,
    );
    if (encontrado) {
      return this.etiqueta(encontrado);
    }
    return this.valor;
  }

  get opcionesFiltradas(): any[] {
    const q = (this.valor || '').trim().toLowerCase();
    if (!q) return this.pacientes.slice(0, 8);
    return this.pacientes
      .filter((p) => {
        const nombre = `${p.Nombre || ''} ${p.Apellido || ''} ${p.nombre || ''} ${p.nombres || ''} ${p.nombreCompleto || ''}`.toLowerCase();
        const doc = `${p.Documento || p.documento || ''}`.toLowerCase();
        return (
          nombre.includes(q) ||
          doc.includes(q)
        );
      })
      .slice(0, 8);
  }

  etiqueta(p: any): string {
    const nombre =
      p.Nombre || p.nombre || p.nombres || p.nombreCompleto || 'Paciente';
    const doc = p.Documento || p.documento || '';
    const docTexto = doc ? ` (Doc: ${doc})` : '';
    return `${nombre}${docTexto}`;
  }

  onInput(ev: any): void {
    this.valor = ev.target.value;
    this.abierto = true;
    this.onChange(this.valor);
    this.onTouched();
  }

  seleccionar(p: any): void {
    this.abierto = false;
    this.onChange(p._id);
  }

  abrir(): void {
    this.abierto = true;
  }

  cerrar(): void {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.abierto = false;
    }, 150);
  }

  onFocus(): void {
    this.abierto = true;
  }

  writeValue(valor: any): void {
    this.valor = valor || '';
  }

  onChange: (val: any) => void = () => {};
  onTouched: () => void = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}