import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ayuda.html',
  styleUrls: ['./ayuda.css'],
})
export class AyudaComponent {
  faqAbierto: number | null = null;

  toggleFaq(index: number): void {
    this.faqAbierto = this.faqAbierto === index ? null : index;
  }
}
