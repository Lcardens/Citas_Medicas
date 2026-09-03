import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmConfig {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'peligro' | 'advertencia' | 'info';
}

interface DialogState {
  visible: boolean;
  config: ConfirmConfig | null;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private state = new BehaviorSubject<DialogState>({
    visible: false,
    config: null,
    resolve: null,
  });

  state$ = this.state.asObservable();

  confirmar(config: ConfirmConfig): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.next({
        visible: true,
        config: {
          textoConfirmar: 'Confirmar',
          textoCancelar: 'Cancelar',
          tipo: 'peligro',
          ...config,
        },
        resolve,
      });
    });
  }

  resolver(valor: boolean): void {
    const current = this.state.value;
    if (current.resolve) {
      current.resolve(valor);
    }
    this.state.next({ visible: false, config: null, resolve: null });
  }

  get visible(): boolean {
    return this.state.value.visible;
  }

  get config(): ConfirmConfig | null {
    return this.state.value.config;
  }
}
