import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { ServicesService } from '@app/core/services/services.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';

@Component({
  templateUrl: './all-services.component.html',
  selector: 'all-services',
  imports: [ToFormatBrlPipe, RouterModule, CommonModule],
})
export class AllServicesComponent<T> implements OnInit {
  constructor(private readonly serviceService: ServicesService) {}

  @Input()
  public onAction?: (data: Service) => void;

  @Input()
  public isActive?: (data: Service) => boolean;

  @Input()
  public isEdit?: boolean;

  @Input()
  public onClickToEdit?: (service: Service) => void;

  private _services?: Service[];

  get services() {
    return this._services;
  }

  public onEdit(service: Service) {
    if (this.onClickToEdit) {
      this.onClickToEdit(service);
    }
  }

  public action(data: Service): void {
    if (this.isEdit) {
      if (this.onClickToEdit) {
        this.onClickToEdit(data);
      }

      return;
    }

    if (this.onAction) {
      this.onAction(data);
    }
  }
  public activated(data: Service) {
    if (this.isActive) {
      return this.isActive(data);
    }

    return true;
  }

  public ngOnInit(): void {
    this.serviceService.getAll().subscribe({
      next: (v) => {
        this._services = v;
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
}
