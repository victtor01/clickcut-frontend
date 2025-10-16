import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BusinessStatement } from '@app/core/models/BusinessStatement';
import { Notification } from '@app/core/models/Notification';
import { User } from '@app/core/models/User';
import { AuthService } from '@app/core/services/auth.service';
import { BusinessService } from '@app/core/services/business.service';
import { NotificationsService } from '@app/core/services/notifications.service';
import { RealTimeService } from '@app/core/services/real-time.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ToastService } from '@app/core/services/toast.service';
import { NotificationColorPipe } from '@app/shared/pipes/notification-color-pipe/notification-color.pipe';
import { NotificationIconPipe } from '@app/shared/pipes/notification-icon-pipe/notification-icon.pipe';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  templateUrl: './home-enter.component.html',
  selector: 'home-enter',
  imports: [ToFormatBrlPipe, RouterLink, CommonModule, NotificationIconPipe, NotificationColorPipe],
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class HomeEnterComponent implements OnInit, OnDestroy {
  constructor(
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly realTimeService: RealTimeService,
    private readonly themeService: ThemeService,
    private readonly router: Router,
  ) {}

  private subscriptions = new Subscription();

  @ViewChild('menuContainer') menuContainerRef!: ElementRef;

  public isMenuOpen = signal(false);
  public isNotificationsOpen = signal(false);
  public statement?: BusinessStatement;
  public notifications: Notification[] = [];
  public user?: User;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isMenuOpen() && !this.menuContainerRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.realTimeService.stopConnection();
  }

  public openLink(link?: string) {
    if (link) {
      this.router.navigateByUrl(link);
    }
  }

  public handleTheme() {
    this.themeService.toggleTheme();
  }

  public get porcetage() {
    if (this.statement) {
      if (!this.statement.revenueGoal) return 0;

      const porcetage = (this.statement?.revenue / this.statement?.revenueGoal) * 100;
      return porcetage > 100 ? 100 : porcetage.toFixed(2);
    }

    return 0;
  }

  public toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  public async toggleNotifications(): Promise<void> {
    this.isNotificationsOpen.update((value) => !value);
  }

  public ngOnInit(): void {
    this.businessService.getStatement().subscribe({
      next: (data) => {
        this.statement = data;
      },

      error: (err) => {
        this.toastService.error('Houve um erro ao tentar pegar o as informações');
      },
    });

    this.authService.currentUser$.subscribe({
      next: (e) => {
        this.user = e || undefined;
      },
    });

    this.realTimeService.startConnection();

    this.subscribeToEvents();
    this.fetchNotifications();
  }

  public hasNotRead(): boolean {
    const filter = this.notifications.filter((b) => !b.isRead)?.[0];

    return !!filter?.id;
  }

  private subscribeToEvents(): void {
    const bookingSub = this.realTimeService.notifications$.subscribe((notification) => {
      this.toastService.success('Nova notificação disponível');
      this.notifications = [...this.notifications, notification];
    });

    this.subscriptions.add(bookingSub);
  }

  public async markAllAsRead(): Promise<void> {
    var marked = await firstValueFrom(this.notificationsService.markAsRead());

    if (marked.message) {
      this.notifications = this.notifications.map((b) => ({ ...b, isRead: true }));
    }
  }

  private async fetchNotifications(): Promise<void> {
    this.notifications = await firstValueFrom(this.notificationsService.getNotifications());
    console.log(this.notifications);
  }
}
