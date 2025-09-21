import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { User } from '@app/core/models/User';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './select-assign.component.html',
  selector: 'select-assign',
  imports: [CommonModule],
})
export class SelectAssignComponent implements OnInit {
  private businessId?: string;
  private _business?: Business;

  @Input()
  public selectedUser?: User | null = null;

  public selectedName = this.selectedUser?.username;

  get business() {
    return this._business;
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const businessId = params['businessId'];

      if (businessId) {
        this.businessId = businessId;
        this.fetchBusiness(this.businessId!);
      }
    });

    if (this.selectedUser) {
      this.selectedName = this.selectedUser.username;
    }
  }

  public async fetchBusiness(businessId: string): Promise<void> {
    this._business = await firstValueFrom(
      this.appointmentsService.getBusinessById(businessId),
    ).catch((err) => {
      console.log(err);
      return undefined;
    });
  }

  public selectAssigner(usuario: User): void {
    if (this.selectedUser && this.selectedUser.id === usuario.id) {
      this.selectedUser = null;
    } else {
      this.selectedUser = usuario;
      this.selectedName = usuario.username;
    }
  }

  @Output()
  public selectAssignOutput = new EventEmitter<User>();

  public next(): void {
    if (this.selectAssignOutput && this.selectedUser) {
      this.selectAssignOutput.emit(this.selectedUser);
    }
  }
}
