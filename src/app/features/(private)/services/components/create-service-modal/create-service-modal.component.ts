import { CommonModule } from '@angular/common';
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
import { InvalidationService } from '@app/core/services/invalidation.service';
import { ServicesService } from '@app/core/services/services.service';
import { ToastService } from '@app/core/services/toast.service';
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
  imports: [MoneyInputDirective, FormsModule, ReactiveFormsModule, CommonModule],
})
export class CreateServiceModalComponent implements OnInit {
  constructor(
    private readonly dialogRef: MatDialogRef<CreateServiceModalComponent>,
    private readonly serviceServices: ServicesService,
    private readonly invalidationService: InvalidationService,
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  public isLoading: boolean = false;
  public createForm!: FormGroup;

  public previewPhoto: string | null = null;
  public selectedFile: File | null = null;

  public closeModal(): void {
    this.dialogRef.close();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      durationInMinutes: ['', [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(1)]],
    });
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewPhoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  public onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      console.error('Formulário inválido!');
      return;
    }

    const data: CreateFormGroup = this.createForm.value;

    const createServiceDTO = {
      name: data.title,
      description: data.description,
      price: data.price,
      duration: Number(data.durationInMinutes),
      photo: this.selectedFile,
    } satisfies CreateServiceDTO;

    this.isLoading = true;

    this.serviceServices
      .create(createServiceDTO)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (value) => {
          this.invalidationService.invalidate(this.invalidationService.INVALIDATE_KEYS.service);
          this.dialogRef.close(value);
        },

        error: ({ error }) => {
          console.log(error);
          this.toastService.error(error?.message);
        },
      });
  }
}
