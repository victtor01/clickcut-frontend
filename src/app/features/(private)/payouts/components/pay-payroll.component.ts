import { CurrencyPipe, DatePipe } from '@angular/common'; // Importe os Pipes
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Payout } from '@app/core/models/Payout';

// Importe os módulos do Angular Material que serão usados no template
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  payout: Payout;
}

@Component({
  selector: 'app-pay-payroll-modal', // Adicione um seletor
  templateUrl: './pay-payroll.component.html',
  standalone: true, // Marque o componente como standalone
  imports: [
    // Imports necessários para o template
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
})
export class PayPayrollModalComponent {
	private dialogRef = inject(MatDialogRef<PayPayrollModalComponent>);
  public data: DialogData = inject(MAT_DIALOG_DATA);
	
  public proofFile: File | null = null;
  public isSubmitting = false;

  public get payout(): Payout {
    return this.data.payout;
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.proofFile = input.files[0];
    }
  }

	public registerPayment(): void {
    this.isSubmitting = true;
    setTimeout(() => {
      this.dialogRef.close({ confirmed: true, file: this.proofFile });
    }, 500);
  }

  public closeModal(): void {
    this.dialogRef.close();
  }
}