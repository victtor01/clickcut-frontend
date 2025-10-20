import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { startWith } from 'rxjs';

import { BookingService } from '@app/core/models/BookingService';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MoneyInputDirective],
  templateUrl: './service-modal.component.html',
})
export class ServiceModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ServiceModalComponent>);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  public finalPrice = signal<number>(0);
  public isSubmitting = signal<boolean>(false);

  public form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    price: [0],
    extraFee: [0, [Validators.required, Validators.min(0)]],
    discount: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

	private data = inject<{ service: BookingService }>(MAT_DIALOG_DATA);
	
	public get initialData () {
		return this.data.service;
	}

  ngOnInit(): void {
		console.log("initi", this.initialData)
		if(!this.initialData) return;

    this.form.patchValue({
      title: this.initialData.title,
      price: this.initialData.price,
      extraFee: this.initialData.extraFee,
      discount: this.initialData.discount,
      notes: this.initialData.notes,
    });

    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((values) => {
        const price = this.initialData.price || 0;
        const extraFee = values.extraFee || 0;
        const discount = values.discount || 0;
        this.finalPrice.set(price + extraFee - discount);
      });
  }

  public get price() {
    if (this.form.get('price')?.value) {
      return this.form.get('price')!.value! / 100;
    } else {
      return 0;
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const finalData = {
      ...this.initialData,
      ...this.form.value,
      finalPrice: this.finalPrice(),
    };

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.dialogRef.close(finalData); // Fecha o modal e retorna os dados
    }, 1500);
  }

  public close(): void {
    this.dialogRef.close();
  }

	
}
