import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '@app/core/models/Booking';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { firstValueFrom } from 'rxjs';

interface DIALOG_DATA {
  bookingId: string;
}

@Component({
  selector: 'app-cancel-booking',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe],
  templateUrl: './cancel-booking.component.html',
})
export class CancelBookingByClient implements OnInit {
  // Injeções
  private data = inject<DIALOG_DATA>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<CancelBookingByClient>);
  private appointmentsService = inject(AppointmentsService); // Serviço para buscar/cancelar

  // Estado
  public booking = signal<Booking | null>(null);
  public isSubmitting = signal(false);

  public get bookingId() {
    return this.data.bookingId;
  }

  public ngOnInit(): void {
    this.fetchBookingDetails();
  }

  private async fetchBookingDetails() {
    try {
      const booking = await firstValueFrom(
        this.appointmentsService.findBookingById(this.data.bookingId),
      );
      this.booking.set(booking);
    } catch (error) {
      console.error('Erro ao buscar agendamento', error);
      this.close(); // Fecha se não encontrar
    }
  }

  public async cancel(): Promise<void> {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    try {
      await firstValueFrom(this.appointmentsService.cancelByAttendee(this.bookingId));
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Erro ao cancelar', error);
      alert('Não foi possível cancelar o agendamento. Tente novamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}
