import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientsSummaryResponse } from '@app/core/DTOs/clients-summary-response';
import { BusinessService } from '@app/core/services/business.service';
import { firstValueFrom } from 'rxjs';

@Component({ templateUrl: './my-clients.component.html', imports: [CommonModule] })
export class MyClientsComponent implements OnInit {
  constructor(private readonly businessService: BusinessService) {}

  public clientsSummary?: ClientsSummaryResponse;

  ngOnInit(): void {
    this.fetchClients();
  }

  private async fetchClients(): Promise<void> {
    this.clientsSummary = await firstValueFrom(this.businessService.getClients());
		console.log(this.clientsSummary)
  }
}
