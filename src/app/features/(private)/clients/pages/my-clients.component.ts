import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientsSummary, ClientsSummaryResponse } from '@app/core/DTOs/clients-summary-response';
import { BusinessService } from '@app/core/services/business.service';
import { ClientAccountService } from '@app/core/services/clients-account.service';
import { ClientModalProfile } from '@app/shared/components/client-profile/client-modal-profile.component';
import { firstValueFrom } from 'rxjs';

@Component({ templateUrl: './my-clients.component.html', imports: [CommonModule] })
export class MyClientsComponent implements OnInit {
  constructor(
    private readonly businessService: BusinessService,
    private readonly clientModalRef: MatDialog,
    private readonly clientsService: ClientAccountService,
  ) {}

  public clientsSummary?: ClientsSummaryResponse;

  ngOnInit(): void {
    this.fetchClients();
  }

  private async fetchClients(): Promise<void> {
    this.clientsSummary = await firstValueFrom(this.businessService.getClients());
    console.log(this.clientsSummary);
  }

  public async openProfileModal(summary: ClientsSummary): Promise<void> {
    this.clientModalRef.open(ClientModalProfile, {
      width: '100%',
      maxWidth: '50rem',
      backdropClass: ['bg-stone-200/50', 'dark:bg-stone-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      data: {
        summary: summary,
      },
    });
  }
}
