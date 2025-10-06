import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientsSummary } from '@app/core/DTOs/clients-summary-response';

@Component({ templateUrl: './client-modal-profile.component.html', imports: [CommonModule] })
export class ClientModalProfile {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: { summary: ClientsSummary },
    private readonly dialog: MatDialogRef<ClientModalProfile>,
  ) {}

  public activeView: 'profile' | 'statistics' = 'profile';

  public get client() {
    return this.data.summary.client;
  }

  public get summary() {
    return this.data?.summary;
  }

  public setView(view: 'profile' | 'statistics'): void {
    this.activeView = view;
  }

  public close(): void {
    this.dialog.close();
  }
}
