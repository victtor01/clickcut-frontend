import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Para o routerLink no botão de login/cadastro
import { Service } from '@app/core/models/Service'; // Assumindo este modelo
import { User } from '@app/core/models/User';
import { CreateAppointmentClientDTO } from '@app/core/schemas/create-appointment.dto';
import { debounceTime, Subscription } from 'rxjs';
import { CreateAccountComponent } from './components/create-account/create-account.component';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  styleUrl: './confirm-booking.component.scss',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CreateAccountComponent],
  templateUrl: './confirm-booking.component.html',
})
export class ConfirmBookingComponent implements OnInit, OnDestroy {
  @Input()
  public selectedServices: Service[] = [];

  @Input()
  public selectedDate: Date | null = null;

  @Input()
  public selectedTime: string | null = null;

  @Input()
  public selectedAssigner?: User | null;

  @Output()
  public submitOutput = new EventEmitter<CreateAppointmentClientDTO | null>();

  public bookingForm!: FormGroup;
  public isLoading: boolean = false;
  private formChangesSubscription!: Subscription;

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.bookingForm = this.fb.group({
      fullname: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]], // Exemplo: 10 ou 11 dígitos
      email: ['', [Validators.required, Validators.email]],
      bookingTitle: [''], // Opcional
    });

    this.formChangesSubscription = this.bookingForm.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(() => {
        this.verifyFormState();
      });
  }

  public ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  public verifyFormState(): void {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      const formData = this.bookingForm.value;

      const bookingClient: CreateAppointmentClientDTO = {
        fullName: formData.fullname,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      };

      this.submitOutput.emit(bookingClient);

      this.isLoading = false;
    } else {
      this.submitOutput.emit(null);
    }
  }

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
