import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Business } from '@app/core/models/Business';
import { FavoriteBusinessService } from '@app/core/services/favorite-business.service';
import { firstValueFrom } from 'rxjs';
import { CreateBookingSvg } from '../components/create-booking-svg/create-booking-svg.component';

@Component({ templateUrl: './create-booking-attendee.component.html', imports: [CommonModule, CreateBookingSvg] })
export class CreateBookingAttendee implements OnInit {
  constructor(private readonly favoritesService: FavoriteBusinessService) {}

  public favorites: Business[] = [];

  ngOnInit(): void {
    this.fetchFavorites();
  }

  public async fetchFavorites(): Promise<void> {
    this.favorites = await firstValueFrom(this.favoritesService.findAll());
  }
}
