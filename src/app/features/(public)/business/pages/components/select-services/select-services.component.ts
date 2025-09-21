import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './select-services.component.html',
  imports: [CommonModule, ToFormatBrlPipe],
  selector: 'app-select-service',
})
export class SelectServicesComponent implements OnInit {
  public availableServices: Service[] = [];
  public selectedServices = new Map<string, Service>();
  public totalPrice = 0;
  public totalDuration = 0;

  private businessId?: string;

  constructor(
    private readonly apointmentService: AppointmentsService,
    private readonly router: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.businessId = params['businessId'];

      if (this.businessId) {
        this.fetchServices(this.businessId);
      }
    });
  }

  private async fetchServices(businessId: string): Promise<void> {
    this.availableServices = await firstValueFrom(this.apointmentService.findServices(businessId));
  }

  public toggleService(service: Service): void {
    if (this.selectedServices.has(service.id)) {
      this.selectedServices.delete(service.id);
    } else {
      this.selectedServices.set(service.id, service);
    }
    this.calculateTotals();
  }

  public isSelected(service: Service): boolean {
    return this.selectedServices.has(service.id);
  }

  private calculateTotals(): void {
    let price = 0;
    let duration = 0;
    for (const service of this.selectedServices.values()) {
      price += service.price;
      duration += service.durationInMinutes;
    }
    this.totalPrice = price;
    this.totalDuration = duration;
  }

  public getSelectedServicesArray(): Service[] {
    return Array.from(this.selectedServices.values());
  }

  public next(): void {
    if (this.selectedServices.size > 0) {
      console.log(
        'Avançando para a próxima etapa com os serviços:',
        this.getSelectedServicesArray(),
      );
    }
  }
}
