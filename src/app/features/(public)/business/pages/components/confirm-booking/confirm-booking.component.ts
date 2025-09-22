import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Para o routerLink no botão de login/cadastro
import { Service } from '@app/core/models/Service'; // Assumindo este modelo
import { User } from '@app/core/models/User';
import { CreateAccountComponent } from './components/create-account/create-account.component';

const MOCK_SELECTED_SERVICES: Service[] = [
  { id: '1', title: 'Corte de Cabelo', price: 50, durationInMinutes: 30, photoUrl: '' },
  { id: '2', title: 'Barba Terapia', price: 35, durationInMinutes: 20, photoUrl: '' },
];

const MOCK_SELECTED_DATE: Date = new Date(2025, 8, 21);

const MOCK_SELECTED_TIME: string = '14:30';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  styleUrl: './confirm-booking.component.scss',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CreateAccountComponent],
  templateUrl: './confirm-booking.component.html',
})
export class ConfirmBookingComponent implements OnInit {
  @Input()
  public selectedServices: Service[] = [];

  @Input()
  public selectedDate: Date | null = MOCK_SELECTED_DATE;

  @Input()
  public selectedTime: string | null = MOCK_SELECTED_TIME;

  @Input()
  public selectedAssigner?: User | null;

  @Output()
  public bookingForm!: FormGroup;
  public totalPrice: number = 0;
  public totalDuration: number = 0;
  public isLoading: boolean = false;

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.bookingForm = this.fb.group({
      fullname: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]], // Exemplo: 10 ou 11 dígitos
      email: ['', [Validators.required, Validators.email]],
      bookingTitle: [''], // Opcional
    });

    this.calculateTotals();
  }

  private calculateTotals(): void {
    this.totalPrice = this.selectedServices.reduce((sum, srv) => sum + srv.price, 0);
    this.totalDuration = this.selectedServices.reduce((sum, srv) => sum + srv.durationInMinutes, 0);
  }

  public onSubmit(): void {
    if (this.bookingForm.valid && this.selectedDate && this.selectedTime) {
      this.isLoading = true;
      const formData = this.bookingForm.value;
      const bookingDetails = {
        ...formData,
        serviceIds: this.selectedServices.map((s) => s.id),
        date: this.selectedDate.toISOString().split('T')[0],
        time: this.selectedTime,
        totalPrice: this.totalPrice,
      };

      console.log('Dados para agendamento:', bookingDetails);

      setTimeout(() => {
        this.isLoading = false;
        alert('Agendamento realizado com sucesso!');
      }, 2000);
    } else {
      alert('Por favor, preencha todos os campos obrigatórios e selecione a data e o horário.');
      this.bookingForm.markAllAsTouched(); // Marca todos os campos como "touched" para exibir erros
    }
  }

  // Helper para exibir erros de validação
  public getErrorMessage(controlName: string): string | null {
    const control = this.bookingForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return 'Este campo é obrigatório.';
      }
      if (control.errors['email']) {
        return 'E-mail inválido.';
      }
      if (control.errors['pattern']) {
        return 'Número de telefone inválido. Use apenas números (ex: 83988032789).';
      }
    }
    return null;
  }
}
