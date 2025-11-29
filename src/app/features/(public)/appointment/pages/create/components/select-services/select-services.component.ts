import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';
import { AppointmentsProps } from '../../public-business.component';

@Component({
  templateUrl: './select-services.component.html',
  imports: [CommonModule, ToFormatBrlPipe],
  selector: 'app-select-service',
})
export class SelectServicesComponent implements OnInit {
  private businessId?: string;
  private userId?: string;
  public availableServices: Service[] = [];
  public selectedServices = new Map<string, Service>();

  constructor(
    private readonly apointmentService: AppointmentsService,
    private readonly router: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.businessId = params['businessId'];

      this.router.queryParams.subscribe((query) => {
        this.userId = query['assignedTo'];
        if (this.businessId && this.userId) {
          this.fetchServices(this.businessId, this.userId);
        }
      });
    });

    this.setupServices();
  }

  @Input()
  public props?: AppointmentsProps;

  @Output()
  public changesServices = new EventEmitter<Service[]>();

  private setupServices() {
    if (this.props) {
      this.props.services?.forEach((service) => {
        this.selectedServices.set(service.id, service);
      });
    }
  }

  private async fetchServices(businessId: string, userId: string): Promise<void> {
    this.availableServices = await firstValueFrom(
      this.apointmentService.findServices(businessId, userId),
    );
  }

  public toggleService(service: Service): void {
    if (this.selectedServices.has(service.id)) {
      this.selectedServices.delete(service.id);
    } else {
      this.selectedServices.set(service.id, service);
    }

    const services = this.getSelectedServicesArray();

    this.changesServices.emit(services);
  }

  public isSelected(service: Service): boolean {
    return this.selectedServices.has(service.id);
  }

  public getSelectedServicesArray(): Service[] {
    return Array.from(this.selectedServices.values());
  }

  public next(): void {
    if (this.selectedServices.size > 0) {
      if (this.changesServices) {
        this.changesServices.emit(this.getSelectedServicesArray());
      }
    }
  }
}
