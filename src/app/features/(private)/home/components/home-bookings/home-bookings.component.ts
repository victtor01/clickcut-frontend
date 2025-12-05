import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SummaryAround } from '@app/core/DTOs/around-bookings-response';
import { SummaryService } from '@app/core/services/summary.service';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './home-bookings.component.html',
  styleUrl: `./home-bookings.component.scss`,
  selector: 'home-bookings',
  imports: [RouterModule, CommonModule],
})
export class HomeBookingsComponent implements OnInit {
  constructor(private readonly summaryService: SummaryService) {}

  public aroundBookings?: SummaryAround;

  public ngOnInit(): void {
    this.fetchAround();
  }

  public formatDate(date: string) {
    return dayjs(date).format("YYYY-MM-DD HH:mm");
  }

  private async fetchAround(): Promise<void> {
    this.aroundBookings = await firstValueFrom(this.summaryService.getAround());
  }
}
