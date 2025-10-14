// payroll.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PayrollReviewResponse } from '@app/core/DTOs/payroll-review-response';
import { MemberShip } from '@app/core/models/MemberShip';
import { MembersService } from '@app/core/services/members.service';
import { PayrollService } from '@app/core/services/payroll.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom } from 'rxjs';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll.component.html',
})
export class PayrollComponent implements OnInit {
  public payouts: PayrollReviewResponse[] = [];
  public members: MemberShip[] = [];
  public selectedMember?: MemberShip;
  public currentDate = new Date();
  public calendarWeeks: CalendarDay[][] = [];
  public periodStart: Date | null = null;
  public periodEnd: Date | null = null;
  public isOpen = false;
  public isPeriodInvalid = false;

  private unavailableRanges: { start: Date; end: Date }[] = [];

  private payrollService = inject(PayrollService);
  private membersService = inject(MembersService);
  private toastService = inject(ToastService);

  async ngOnInit(): Promise<void> {
    this.generateCalendar();

    await Promise.all([this.fetchPayroll(), this.fetchMembers()]);

    this.updateUnavailableRanges();
    this.validatePeriod();
  }

  private async fetchMembers(): Promise<void> {
    this.members = await firstValueFrom(this.membersService.findAll());
    if (this.members && this.members.length > 0) {
      this.selectedMember = this.members[0];
    }
  }

  public toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  public selectMember(member: MemberShip): void {
    if (this.selectedMember?.user.id === member.user.id) return; // Evita recálculo desnecessário

    this.selectedMember = member;
    this.isOpen = false;
    this.periodStart = null;
    this.periodEnd = null;
    this.updateUnavailableRanges();
  }

  public async generate(): Promise<void> {
    if (!this.selectedMember) {
      this.toastService.error('Selecione o membro para gerar');
      return;
    }

    if (!this.periodStart || !this.periodEnd) {
      this.toastService.error('selecione o começo e fim!');
      return;
    }

    try {
      await firstValueFrom(
        this.payrollService.generate({
          memberId: this.selectedMember.user.id!,
          periodStart: this.periodStart,
          periodEnd: this.periodEnd,
        }),
      );
    } catch (err) {
      this.toastService.error("Houve um erro ao tentar gerar uma comissão");
    }
  }

  private updateUnavailableRanges(): void {
    if (!this.selectedMember) {
      this.unavailableRanges = [];
      return;
    }

    this.unavailableRanges = this.payouts
      .filter((payout) => payout.user.id === this.selectedMember?.user.id)
      .map((payout) => {
        const start = new Date(payout.payroll.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(payout.payroll.end);
        end.setHours(0, 0, 0, 0);
        return { start, end };
      });
  }

  private validatePeriod(): void {
    if (!this.periodStart || !this.periodEnd) {
      this.isPeriodInvalid = false;
      return;
    }

    const hasOverlap = this.unavailableRanges.some(
      (range) => range.start <= (this.periodEnd as Date) && range.end >= (this.periodStart as Date),
    );

    this.isPeriodInvalid = hasOverlap;
  }

  public isUnavailable(date: Date): boolean {
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    return this.unavailableRanges.some((range) => dayDate >= range.start && dayDate <= range.end);
  }

  public generateCalendar(): void {
    this.calendarWeeks = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    let currentWeek: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const day: CalendarDay = {
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
      };

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
  }

  public prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
  }

  public nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
  }

  public selectDay(day: CalendarDay): void {
    if (this.isUnavailable(day.date)) {
      return; // Impede a seleção
    }

    const clickedDate = day.date;
    if (!this.periodStart || this.periodEnd) {
      this.periodStart = clickedDate;
      this.periodEnd = null;
    } else if (clickedDate < this.periodStart) {
      this.periodStart = clickedDate;
    } else {
      this.periodEnd = clickedDate;
    }

    this.validatePeriod();
  }

  public isInRange(date: Date): boolean {
    if (!this.periodStart || !this.periodEnd) return false;
    return date > this.periodStart && date < this.periodEnd;
  }

  private async fetchPayroll(): Promise<void> {
    this.payouts = await firstValueFrom(this.payrollService.findAll());
  }
}
