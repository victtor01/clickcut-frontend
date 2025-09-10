import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessStatement } from '@app/core/models/BusinessStatement';
import { User } from '@app/core/models/User';
import { AuthService } from '@app/core/services/auth.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';

@Component({
  templateUrl: './home-enter.component.html',
  selector: 'home-enter',
  imports: [ToFormatBrlPipe, RouterLink],
})
export class HomeEnterComponent implements OnInit {
  constructor(
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService
  ) {}

  @ViewChild('menuContainer') menuContainerRef!: ElementRef;

  public isMenuOpen = signal(false);
  public statement?: BusinessStatement;
  public user?: User;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isMenuOpen() && !this.menuContainerRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  public get porcetage() {
    if (this.statement) {
      if(!this.statement.revenueGoal) return 0;

      return (this.statement?.revenue / this.statement?.revenueGoal) * 100;
    }

    return 0;
  }

  public toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  public ngOnInit(): void {
    this.businessService.getStatement().subscribe({
      next: (data) => {
        this.statement = data;
      },

      error: () => {
        this.toastService.error('Houve um erro ao tentar pegar o as informações');
      },
    });

    this.authService.currentUser$.subscribe({
      next: (e) => {
        this.user = e || undefined;
      },
    });
  }
}
