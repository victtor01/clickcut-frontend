import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { Service } from '@app/core/models/Service';
import { User } from '@app/core/models/User';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { firstValueFrom } from 'rxjs';
import { SelectAssignComponent } from './components/select-assign/select-assign.component';
import { SelectServicesComponent } from './components/select-services/select-services.component';

@Component({
  templateUrl: './public-business.component.html',
  imports: [SelectAssignComponent, CommonModule, SelectServicesComponent],
})
export class AppointMeetComponent implements OnInit {
  public assignedTo?: User;
  public assignedToId?: string;
  public businessId?: string;
  public business?: Business;
  public services?: Service[];

  public isLoading: boolean = true;

  public step = 1;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly appointmentsService: AppointmentsService,
    private readonly router: Router,
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.assignedToId = params['assignedTo'];

      if (!this.assignedTo && this.assignedToId) {
        this.fetchAssigner(this.assignedToId);
      } else {
        this.isLoading = false;
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

  public selectAssigner(user: User) {
    this.assignedTo = user;

    const currentParams = this.activatedRoute.snapshot.queryParams;

    const newParams = { ...currentParams, assignedTo: user.id };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newParams,
      queryParamsHandling: 'merge',
    });

    this.step++;
  }
}
