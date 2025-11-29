import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { AttendeeService } from '@app/core/services/attendee.service';
import { firstValueFrom } from 'rxjs';

export const BookingStatusMap: Record<BookingStatus, { label: string; classes: string }> = {
  CREATED: {
    label: 'Criado',
    classes: 'bg-stone-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
  },
  PENDING: {
    label: 'Pendente',
    classes: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20',
  },
  CONFIRMED: {
    label: 'Confirmado',
    classes: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-400/30',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    classes: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30',
  },
  COMPLETED: {
    label: 'Concluído',
    classes: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20',
  },
  PAID: {
    label: 'Pago',
    classes: 'bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  },
  CANCELLED: {
    label: 'Cancelado',
    classes: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20',
  },
  NO_SHOW: {
    label: 'Não Compareceu',
    classes: 'bg-stone-50 text-gray-700 ring-gray-600/10 dark:bg-gray-400/10 dark:text-gray-300 dark:ring-gray-400/20',
  },
  CANCELLED_BY_CLIENT: {
    label: '',
    classes: ''
  },
  CANCELLED_BY_MANAGER: {
    label: '',
    classes: ''
  },
  CANCELLED_LATE_BY_CLIENT: {
    label: '',
    classes: ''
  }
};

@Component({ templateUrl: './attendee-history.component.html', imports: [CommonModule] })
export class AttendeeHistoryComponent implements OnInit {
  constructor(private readonly attendeeService: AttendeeService) {}

  public isLoading = true;
  public allBookings: Booking[] = [];
  public upcomingBookings: Booking[] = [];
  public pastBookings: Booking[] = [];
  public statusMap = BookingStatusMap;

  public ngOnInit(): void {
    this.fetchBookings();
  }

  private async fetchBookings(): Promise<void> {
    this.isLoading = true;
    this.allBookings = await firstValueFrom(this.attendeeService.findHistoryForAttendee());

    this.groupBookings();

    this.isLoading = false;
  }

  private groupBookings(): void {
    const now = new Date();
    this.upcomingBookings = this.allBookings
      .filter((b) => new Date(b.startAt) >= now)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    this.pastBookings = this.allBookings
      .filter((b) => new Date(b.startAt) < now)
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }
}
