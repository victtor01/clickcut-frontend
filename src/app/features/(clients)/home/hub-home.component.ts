import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/models/BookingService';
import { AttendeeService } from '@app/core/services/attendee.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './hub-home.component.html',
  imports: [CommonModule, DatePipe, ToFormatBrlPipe],
})
export class HubHomeComponent implements OnInit {
  constructor(private readonly attendeeService: AttendeeService, private readonly router: Router) {}

  public statusStyles: { [key in BookingStatus]: { text: string; icon: string; classes: string } } =
    {
      CREATED: {
        text: 'Criado',
        icon: 'add_circle_outline',
        classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      },
      PENDING: {
        text: 'Pendente',
        icon: 'pending',
        classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      },
      CONFIRMED: {
        text: 'Confirmado',
        icon: 'check_circle_outline',
        classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      },
      IN_PROGRESS: {
        text: 'Em Andamento',
        icon: 'sync',
        classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      },
      COMPLETED: {
        text: 'Concluído',
        icon: 'check_circle',
        classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      },
      PAID: {
        text: 'Pago',
        icon: 'paid',
        classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      },
      CANCELLED: {
        text: 'Cancelado',
        icon: 'cancel',
        classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      },
      NO_SHOW: {
        text: 'Não Compareceu',
        icon: 'person_off',
        classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      },
    };

  public ngOnInit(): void {
    this.fetchBookings();
  }

  public viewMode: 'card' | 'list' = 'card';
  public openedSettings: string | null = null;
  public bookings: Booking[] = [];

  public async fetchBookings(): Promise<void> {
    this.bookings = await firstValueFrom(this.attendeeService.getBookings());
  }

  public setViewMode(mode: 'card' | 'list'): void {
    this.viewMode = mode;
  }

  public seeDetails(bookingId: string) {
    this.router.navigate(["/hub", "bookings", bookingId])
  }

  public toggleOpenedSettings(open: string): void {
    this.openedSettings = open;
  }

  public closeSettings() {
    this.openedSettings = null;
  }

  public getTotalPrice(services: BookingService[] | undefined): number {
    if (!services) return 0;
    return services.reduce((total, service) => total + service.price, 0);
  }
}
