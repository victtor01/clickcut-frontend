import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CreateManualPaymentDTO } from '@app/core/schemas/create-manual-payment.dto';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';

@Component({
  templateUrl: 'manual-payment.component.html',
  imports: [CommonModule, MoneyInputDirective, ReactiveFormsModule, CurrencyPipe],
  selector: 'manual-payment',
})
export class ManualPaymentComponent {
  @Input({ required: true })
  public maxValue?: number; // Valor máximo permitido (em centavos)

  @Output()
  public paymentSubmit = new EventEmitter<Partial<CreateManualPaymentDTO>>();

  public paymentForm: FormGroup;
  public paymentMethods = [
    { label: 'Dinheiro', value: 'CASH', icon: 'local_atm' },
    { label: 'Débito', value: 'DEBIT_CARD', icon: 'payment' },
    { label: 'Crédito', value: 'CREDIT_CARD', icon: 'credit_card' },
    { label: 'PIX', value: 'PIX', icon: 'qr_code_2' },
  ];

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
    });
  }

  ngOnInit(): void {
    this.addOrUpdateMaxValueValidator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maxValue']) {
      this.paymentForm.get('amount')?.updateValueAndValidity();
    }
  }

  public selectPaymentMethod(methodValue: string): void {
    this.paymentForm.get('paymentMethod')?.setValue(methodValue);
  }

  public submitForm(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const data: Partial<CreateManualPaymentDTO> = {
      amount: this.paymentForm.get('amount')?.value,
      method: this.paymentForm.get('paymentMethod')?.value,
    };

    this.paymentSubmit.emit(data);
  }

  private maxValueValidator(control: AbstractControl): ValidationErrors | null {
    if (this.maxValue === undefined || this.maxValue === null) {
      return null; // Não valida se não houver valor máximo
    }

    const valueInCents = control.value;
    if (valueInCents > this.maxValue) {
      return { maxValueExceeded: { requiredValue: this.maxValue, actualValue: valueInCents } };
    }
    return null;
  }

  private addOrUpdateMaxValueValidator(): void {
    this.paymentForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(1),
      this.maxValueValidator.bind(this), // Usa .bind(this) para manter o contexto do componente
    ]);

    this.paymentForm.get('amount')?.updateValueAndValidity();
  }
}
