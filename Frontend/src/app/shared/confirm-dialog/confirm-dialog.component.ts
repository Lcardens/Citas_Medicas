import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="dialog.visible"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5)"
    >
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow">
          <div class="modal-header" [ngClass]="headerClass">
            <h5 class="modal-title fw-bold">{{ dialog.config?.titulo }}</h5>
            <button type="button" class="btn-close" (click)="dialog.resolver(false)"></button>
          </div>
          <div class="modal-body text-center py-4">
            <p class="mb-0">{{ dialog.config?.mensaje }}</p>
          </div>
          <div class="modal-footer justify-content-center border-0 pt-0 pb-3">
            <button
              *ngIf="dialog.config?.textoCancelar"
              type="button"
              class="btn btn-outline-secondary px-3"
              (click)="dialog.resolver(false)"
            >
              {{ dialog.config?.textoCancelar }}
            </button>
            <button
              type="button"
              class="btn px-3"
              [ngClass]="btnClass"
              (click)="dialog.resolver(true)"
            >
              {{ dialog.config?.textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.dialog.state$.subscribe(() => this.cdr.detectChanges());
  }

  get headerClass(): string {
    const tipo = this.dialog.config?.tipo || 'peligro';
    if (tipo === 'peligro') return 'bg-danger-subtle';
    if (tipo === 'advertencia') return 'bg-warning-subtle';
    return 'bg-info-subtle';
  }

  get btnClass(): string {
    const tipo = this.dialog.config?.tipo || 'peligro';
    if (tipo === 'peligro') return 'btn-danger';
    if (tipo === 'advertencia') return 'btn-warning';
    return 'btn-info';
  }
}
