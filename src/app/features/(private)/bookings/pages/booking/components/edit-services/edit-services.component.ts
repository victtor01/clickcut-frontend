import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Service } from '@app/core/models/Service';
import { BookingsService } from '@app/core/services/booking.service';
import { ServicesService } from '@app/core/services/services.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-services.component.html',
})
export class EditAppointmentServicesModalComponent implements OnInit {
  private readonly servicesService = inject(ServicesService);
  private readonly bookingsService = inject(BookingsService);
  private readonly toastService = inject(ToastService);

  public data = inject<{ selectedIds: string[]; bookingId: string }>(MAT_DIALOG_DATA);

  public dialogRef = inject(MatDialogRef<EditAppointmentServicesModalComponent>);

  public get selectedIds() {
    return this.data.selectedIds || [];
  }

  private get bookingId() {
    return this.data.bookingId;
  }

  public allServices = signal<Service[]>([]);
  public selectedServiceIds = signal<Set<string>>(new Set());
  public isLoading = signal<boolean>(true);

  public selectedServices = computed(() =>
    this.allServices().filter((s) => this.selectedServiceIds().has(s.id)),
  );

  public totalPrice = computed(() =>
    this.selectedServices().reduce((sum, service) => sum + service.price, 0),
  );

  public totalDuration = computed(() =>
    this.selectedServices().reduce((sum, service) => sum + service.durationInMinutes, 0),
  );

  public async ngOnInit(): Promise<void> {
    this.isLoading.set(true);

    const services = await firstValueFrom(this.servicesService.getAll());

    this.allServices.set(services);

    this.selectedServiceIds.set(new Set(this.selectedIds));

    this.isLoading.set(false);
  }

  public isSelected(service: Service): boolean {
    return this.selectedServiceIds().has(service.id);
  }

  public close() {
    this.dialogRef.close();
  }

  public toggleServiceSelection(service: Service): void {
    this.selectedServiceIds.update((currentIds) => {
      const newIds = new Set(currentIds);
      if (newIds.has(service.id)) {
        newIds.delete(service.id);
      } else {
        newIds.add(service.id);
      }
      return newIds;
    });
  }

  public async saveChanges(): Promise<void> {
    try {
      const servicesIds = [...this.selectedServiceIds()];

      await firstValueFrom(this.bookingsService.updateServices(this.bookingId, servicesIds));

      this.toastService.success('Novos serviços atualizados!');

      this.dialogRef.close();
    } catch (err) {
      const defaultError = 'Houve um erro desconhecido!';
      if (err instanceof HttpErrorResponse) {
        this.toastService.error(err.error?.message || defaultError);
      } else {
        this.toastService.error(defaultError);
      }
    }
  }
}
