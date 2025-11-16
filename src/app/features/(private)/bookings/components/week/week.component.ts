import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';

@Component({
  templateUrl: './week.component.html',
  selector: 'current-week',
  imports: [CommonModule],
  styles: `
    :host {
      overflow: hidden;
    }
  `,
})
export class WeekComponent {
  private _currentDate!: Dayjs;
  private _dateCounts?: Record<string, number>;
  private shouldScroll = false;
  public dates: Dayjs[] = [];

  @ViewChildren('dayElement')
  private dayElements!: QueryList<ElementRef<HTMLDivElement>>;

  @ViewChild('scrollContainer') // [!code ++]
  private scrollContainer!: ElementRef<HTMLDivElement>; // [!code ++]

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

  public isNow(date: Dayjs): boolean {
    return dayjs().isSame(date, 'date');
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
    const parent = this.scrollContainer?.nativeElement;

    if (selectedIndex !== -1 && elements && elements[selectedIndex]) {
      const elementToScroll = elements[selectedIndex].nativeElement;

      const parentWidth = parent.clientWidth;
      const elementWidth = elementToScroll.clientWidth;

      // Posição do elemento relativa ao container pai
      const elementOffsetLeft = elementToScroll.offsetLeft;

      // Calcula a posição de scroll para centralizar o elemento:
      // Posição de scroll = (centro do elemento) - (centro do pai)
      const scrollLeft = elementOffsetLeft + elementWidth / 2 - parentWidth / 2;

      parent.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }

  private generateWeekDays(): void {
    this.dates = [];

    if (!this.currentDate) {
      return;
    }

    let current = this.currentDate.startOf('month');
    const end = this.currentDate.endOf('month');

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      this.dates.push(current);
      current = current.add(1, 'day');
    }
  }
}
