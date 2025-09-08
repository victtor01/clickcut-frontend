import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { UpdateServiceDTO } from '@app/core/schemas/update-service.dto';
import { ServicesService } from '@app/core/services/services.service';
import { ToastService } from '@app/core/services/toast.service';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { finalize } from 'rxjs';

@Component({
  templateUrl: 'edit-service.component.html',
  imports: [CommonModule, MoneyInputDirective, ReactiveFormsModule, RouterLink],
})
export class EditServiceComponent implements OnInit {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService,
    private readonly fb: FormBuilder
  ) {}

  public service?: Service;
  public editServiceForm!: FormGroup;

  public isLoading: boolean = false;

  private serviceId: string | null = null;

  public ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('serviceId');
    });

    if (this.serviceId) {
      this.servicesService.findById(this.serviceId).subscribe({
        next: (service) => {
          console.log(service);
          this.editServiceForm.patchValue(service);
        },
      });
    }
  }

  private initForm(): void {
    this.editServiceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      durationInMinutes: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
  }

  public onSubmit(): void {
    if (this.editServiceForm.invalid) {
      console.error('Formulário inválido!');
      return;
    }

    if (!this.serviceId) {
      console.error('ID do serviço não encontrado!');
      return;
    }

    const updatedServiceData = this.editServiceForm.value;

    const updateServiceDTO = {
      title: updatedServiceData.title,
      price: updatedServiceData.price,
      description: updatedServiceData.description || null,
      durationInMinutes: updatedServiceData.durationInMinutes,
      isActive: updatedServiceData.isActive,
    } satisfies UpdateServiceDTO;

    this.isLoading = true;
    this.servicesService
      .update(this.serviceId, updateServiceDTO)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data: Service) => {
          this.service = data;
          this.editServiceForm.patchValue(data);
          this.toastService.success("Atualizado com sucesso!");
        },
      });
  }
}
