import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';

@Component({
  templateUrl: './week.component.html',
  selector: 'current-week',
  imports: [CommonModule],
})
export class WeekComponent {
  private _currentDate!: Dayjs;
  private _dateCounts?: Record<string, number>;
  private shouldScroll = false;
  public dates: Dayjs[] = [];

  @ViewChildren('dayElement')
  private dayElements!: QueryList<ElementRef<HTMLDivElement>>;

  @Input()
  public set currentDate(date: Dayjs) {
    this._currentDate = dayjs(date);
    this.shouldScroll = true;
    this.generateWeekDays();
  }

  @Input()
  public set dateWithCount(dates: Record<string, number>) {
    this._dateCounts = dates;
  }

  public get currentDate(): Dayjs {
    return this._currentDate;
  }

  public get counts() {
    return this._dateCounts;
  }

  public ngAfterViewChecked(): void {
    if (!this.shouldScroll) {
      return;
    }

    this.shouldScroll = false;
    this.scrollToSelectedDay();
  }

  private scrollToSelectedDay(): void {
    const selectedIndex = this.dates.findIndex((day) => day.isSame(this.currentDate, 'day'));
    const elements = this.dayElements?.toArray();

    if (selectedIndex !== -1 && elements && elements[selectedIndex]) {
      const elementToScroll = elements[selectedIndex].nativeElement;
      elementToScroll.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }

  private generateWeekDays(): void {
    this.dates = [];

    if (!this.currentDate) {
      return;
    }

    let current = this.currentDate.startOf('week');
    const end = this.currentDate.endOf('week');

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      this.dates.push(current);
      current = current.add(1, 'day');
    }
  }
}
