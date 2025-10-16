import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, QueryList, signal, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Business } from '@app/core/models/Business';

@Component({
  selector: 'app-pin-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pin-entry.component.html',
})
export class PinEntryComponent implements AfterViewInit {
  @Input() business!: Business;
  @Output() onVerify = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef<HTMLInputElement>>;

  form: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      pin1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      pin2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      pin3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      pin4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });
  }

  // ✨ 2. Mova a lógica de foco para o ngAfterViewInit ✨
  ngAfterViewInit(): void {
    // Usamos setTimeout para garantir que a view esteja estável antes de focar.
    setTimeout(() => {
        if (this.pinInputs.first) {
            this.pinInputs.first.nativeElement.focus();
        }
    }, 0);
  }

  onInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // Se um dígito foi inserido e não é o último campo, foca no próximo.
    if (value.length === 1 && index < 3) {
      this.pinInputs.toArray()[index + 1].nativeElement.focus();
    }

    // Se for o último campo e o formulário inteiro for válido, submete.
    if (index === 3 && this.form.valid) {
      this.onSubmit();
    }
  }

  /**
   * ✨ NOVO MÉTODO: Chamado apenas quando a tecla Backspace é pressionada.
   */
  onBackspace(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;

    // Se o campo atual está vazio e não é o primeiro, foca no anterior.
    if (index > 0 && inputElement.value === '') {
      this.pinInputs.toArray()[index - 1].nativeElement.focus();
    }
  }
	
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim().slice(0, 4);
    if (pastedData && /^\d{4}$/.test(pastedData)) {
      this.form.setValue({
        pin1: pastedData[0],
        pin2: pastedData[1],
        pin3: pastedData[2],
        pin4: pastedData[3],
      });
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    const pin = Object.values(this.form.value).join('');
    this.onVerify.emit(pin);
  }
  
  // Método que o componente pai pode chamar para mostrar um erro
  showError(message: string) {
    this.error.set(message);
    this.isLoading.set(false);
    this.form.reset();
    this.pinInputs.first.nativeElement.focus();
  }
}