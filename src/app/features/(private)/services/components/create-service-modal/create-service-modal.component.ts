import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateServiceDTO } from '@app/core/schemas/create-service.dto';
import { ServicesService } from '@app/core/services/services.service';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { finalize } from 'rxjs';

interface CreateFormGroup {
  title: string;
  description: string;
  durationInMinutes: number;
  price: number;
}

@Component({
  templateUrl: 'create-service-modal.component.html',
  imports: [MoneyInputDirective, FormsModule, ReactiveFormsModule],
})
export class CreateServiceModalComponent implements OnInit {
  constructor(
    private readonly dialogRef: MatDialogRef<CreateServiceModalComponent>,
    private readonly serviceServices: ServicesService,
    private readonly fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  public isLoading: boolean = false;
  public createForm!: FormGroup;

  public closeModal(): void {
    this.dialogRef.close();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      durationInMinutes: ["", [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(1)]],
    });
  }

  public onSubmit(): void {
    if (this.createForm.invalid) {
      console.error('Formulário inválido!');
      return;
    }

    const data: CreateFormGroup = this.createForm.value;

    const createServiceDTO = {
      name: data.title,
      description: data.description,
      price: data.price,
      duration: data.durationInMinutes,
    } satisfies CreateServiceDTO;

    this.isLoading = true;

    this.serviceServices
      .create(createServiceDTO)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (value) => {
          console.log(value);
        },
      });
  }
}
