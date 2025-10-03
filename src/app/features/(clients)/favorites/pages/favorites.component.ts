import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Business } from '@app/core/models/Business';
import { FavoriteBusinessService } from '@app/core/services/favorite-business.service';
import { firstValueFrom } from 'rxjs';


@Component({
  templateUrl: './favorites.component.html',
  imports: [CommonModule],
  animations: [
    trigger('slideFade', [
      // Animação para o elemento ENTRAR na tela (:enter)
      transition(':enter', [
        // Estado inicial: invisível e um pouco para baixo
        style({ opacity: 0, transform: 'translateY(20px)' }),
        // Animação para o estado final: visível e na posição original
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      // Animação para o elemento SAIR da tela (:leave)
      transition(':leave', [
        // Animação para o estado final: invisível e um pouco para baixo
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ],
})
export class FavoritesComponent implements OnInit {
  constructor(private readonly favoritesService: FavoriteBusinessService) {}

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

  public toggleFavorite(business: Business): void {
    const businessId = business.id;

    const isCurrentlyFavorited = this.favoritedStatus[businessId];
    this.favoritedStatus[businessId] = !isCurrentlyFavorited;

    if (isCurrentlyFavorited) {
      console.log(`Enviando requisição para DESFAVORITAR o negócio: ${businessId}`);
    } else {
      console.log(`Enviando requisição para FAVORITAR o negócio: ${businessId}`);
    }
  }
}
