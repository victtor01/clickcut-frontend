import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SummaryAround } from '@app/core/DTOs/around-bookings-response';
import { SummaryService } from '@app/core/services/summary.service';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './home-bookings.component.html',
  styleUrl: `./home-bookings.component.scss`,
  selector: 'home-bookings',
  imports: [RouterModule],
})
export class HomeBookingsComponent implements OnInit {
  constructor(private readonly summaryService: SummaryService) {}

  public aroundBookings?: SummaryAround;

  public ngOnInit(): void {
    this.fetchAround();
  }

  private async fetchAround(): Promise<void> {
    this.aroundBookings = await firstValueFrom(this.summaryService.getAround());
  }
}
