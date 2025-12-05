import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Business } from '@app/core/models/Business';
import { FavoriteBusinessService } from '@app/core/services/favorite-business.service';
import { BusinessModalComponent } from '@app/shared/components/business-details/business-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './favorites.component.html',
  imports: [CommonModule],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ],
})
export class FavoritesComponent implements OnInit {
  constructor(
    private readonly favoritesService: FavoriteBusinessService,
    private readonly businessDialog: MatDialog,
  ) {}

  public favorites: Business[] = [];

  public favoritedStatus: { [businessId: string]: boolean } = {};

  public ngOnInit(): void {
    this.fetchFavorites();
  }

  public get hasUnfavoritedItems(): boolean {
    return Object.values(this.favoritedStatus).some((isFavorited) => !isFavorited);
  }

  public async fetchFavorites(): Promise<void> {
    this.favorites = await firstValueFrom(this.favoritesService.findAll());

    this.favorites.forEach((business) => {
      this.favoritedStatus[business.id] = true;
    });
  }

  public async toggleFavorite(business: Business): Promise<void> {
    const businessId = business.id;

    const isCurrentlyFavorited = this.favoritedStatus[businessId];
    this.favoritedStatus[businessId] = !isCurrentlyFavorited;

    if (isCurrentlyFavorited) {
      await firstValueFrom(this.favoritesService.unfavorite(businessId));
    } else {
      await firstValueFrom(this.favoritesService.favorite(businessId));
    }
  }

  public openBusinessDetails(businessId: string) {
    this.businessDialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: businessId },
    });
  }
}
