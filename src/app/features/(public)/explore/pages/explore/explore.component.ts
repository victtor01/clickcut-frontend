import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExplorePage, ExploreService } from '@app/core/services/explore.service';
import { BusinessModalComponent } from '@app/shared/components/business-details/business-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({ templateUrl: './explore.component.html', imports: [CommonModule] })
export class ExploreComponent implements OnInit {
  private readonly exploreService = inject(ExploreService);
  public readonly businessDialog = inject(MatDialog);

  public explore?: ExplorePage;

  ngOnInit(): void {
    this.fetchExplore();
  }

  private async fetchExplore(): Promise<void> {
    this.explore = await firstValueFrom(this.exploreService.findAll());
  }

  public openBusinessDetails(businessId: string) {
    this.businessDialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: businessId },
    });
  }
}
