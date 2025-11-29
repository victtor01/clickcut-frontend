import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({ templateUrl: './remove-business-pin.component.html' })
export class RemoveBusinessPinComponent {
  private readonly businessService = inject(BusinessService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialogRef<RemoveBusinessPinComponent>);

  public async remove(): Promise<void> {
    try {
      await firstValueFrom(this.businessService.removePin());
      this.toastService.success('Atualizado com sucesso!');
      this.dialog.close({ error: false });
    } catch (error) {
      let message = 'Opa! Houve um erro!';

      if (error instanceof HttpErrorResponse) {
        message = error?.error?.message || message;
      }
    }
  }
}
