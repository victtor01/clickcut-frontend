import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { Service } from '@app/core/models/Service';
import { User } from '@app/core/models/User';
import {
  CreateAppointmentClientDTO,
  CreateAppointmentDTO,
} from '@app/core/schemas/create-appointment.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs, { Dayjs } from 'dayjs';
import { firstValueFrom, Subscription } from 'rxjs';
import { LoginModalComponent } from '../../components/login-modal/login-modal.component';
import { SelectDateTimeComponent } from './components/avaible-times/avaible-times.component';
import { BookingSummaryComponent } from './components/bookings-summary/bookings-summary.component';
import { ConfirmBookingComponent } from './components/confirm-booking/confirm-booking.component';
import { SelectAssignComponent } from './components/select-assign/select-assign.component';
import { SelectServicesComponent } from './components/select-services/select-services.component';

export interface AppointmentsProps {
  assignTo?: User | null;
  businessId?: string;
  services: Service[];
  date?: Dayjs;
}

@Component({
  templateUrl: './public-business.component.html',
  imports: [
    CommonModule,
    SelectAssignComponent,
    SelectServicesComponent,
    SelectDateTimeComponent,
    ConfirmBookingComponent,
    BookingSummaryComponent,
  ],
})
export class AppointMeetComponent implements OnInit, OnDestroy {
  public client?: CreateAppointmentClientDTO;
  public services: Service[] = [];
  public assignedTo?: User | null;
  public assignedToId?: string;
  public businessId?: string;
  public business?: Business;
  public date?: Dayjs;

  public isLoading: boolean = true;
  public step = 1;

  private queryParamsSubscription?: Subscription;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly appointmentsService: AppointmentsService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly loginDialog: MatDialog,
  ) {}

  public ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  public get props(): AppointmentsProps {
    return {
      assignTo: this.assignedTo,
      businessId: this.businessId,
      services: this.services,
      date: this.date,
    };
  }

  public get isValid(): boolean {
    switch (this.step) {
      case 1:
        return !!this.assignedTo?.id;
      case 2:
        return this.services.length > 0;
      case 3:
        return !!this.date;
      case 4:
        return !!this.client;
      default:
        return false;
    }
  }

  public ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.assignedToId = params['assignedTo'];

      if (!this.assignedTo && this.assignedToId) {
        this.fetchAssigner(this.assignedToId);
      } else {
        this.isLoading = false;
      }
    });

    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe((params) => {
      if (params['modal'] === 'login') {
        this.openLoginModal();
      }
    });

    this.activatedRoute.params.subscribe((params) => {
      this.businessId = params['businessId'];

      if (!this.business && this.businessId) {
        this.fetchBusiness(this.businessId);
      }
    });
  }

  public back(): void {
    if (this.step > 1) {
      this.step = this.step - 1;
    }
  }

  private async fetchAssigner(userId: string): Promise<void> {
    this.assignedTo = await firstValueFrom(this.appointmentsService.findAssigner(userId));

    if (!this.assignedTo) {
      this.router.navigate(['/appointments', this.businessId]);
    }

    this.isLoading = false;
    this.step = 2;
  }

  private async fetchBusiness(businessId: string): Promise<void> {
    this.business = await firstValueFrom(this.appointmentsService.getBusinessById(businessId));

    if (!this.business) {
      this.router.navigate(['/home']);
    }
  }

  public selectServices(services: Service[]): void {
    this.services = services;
  }

  public selectDateTime(date: string | null): void {
    this.date = date ? dayjs(date) : undefined;
  }

  public selectAssigner(user: User | null): void {
    this.assignedTo = user;
  }

  public next() {
    switch (this.step) {
      case 1:
        this.setAssignInURL();
        break;
      case 2:
        this.validServices();
        break;
      case 3:
        this.validateTimes();
        break;
      case 4:
        this.submit();
        break;
    }

    if (this.step < 4) {
      this.step++;
    }
  }

  public selectClient(client: CreateAppointmentClientDTO | null) {
    this.client = client || undefined;
  }

  private setAssignInURL() {
    if (!this.assignedTo?.id) return;

    const currentParams = this.activatedRoute.snapshot.queryParams;

    const newParams = { ...currentParams, assignedTo: this.assignedTo?.id };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newParams,
      queryParamsHandling: 'merge',
    });
  }

  private validServices(): void {
    if (this.services.length === 0) {
      this.toastService.error('Selecione ao menos 1 serviço!');
    }
  }

  private validateTimes(): void {
    if (!this.date) {
      this.toastService.error('Selecione a data e hora para o agendamento!');
    }
  }

  public async submit(): Promise<void> {
    const data = {
      assignedToId: this.assignedTo?.id!,
      businessId: this.business?.id!,
      serviceIds: this.services.map((s) => s.id),
      startAt: this.date?.toISOString()!,
      client: this.client!,
    } satisfies CreateAppointmentDTO;

    const boookingCreated = await firstValueFrom(this.appointmentsService.create(data));

    if (boookingCreated?.id) {
      this.router.navigate(['appointments', 'confirm', boookingCreated.id]);
    }
  }

  public openLoginModal() {
    const dialogRef = this.loginDialog.open(LoginModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(55rem, 90%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { modal: null },
        queryParamsHandling: 'merge',
      });

      if (result?.id) {
        this.toastService.success('Pagamento registrado');
      }
    });
  }
}
