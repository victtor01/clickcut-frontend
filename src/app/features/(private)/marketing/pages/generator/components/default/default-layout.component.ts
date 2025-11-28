import { Component, Input } from '@angular/core';
import { Dayjs } from 'dayjs';

export type CtaType = 'bio' | 'whatsapp' | 'direct' | 'website';

export interface BUSINESS_DATA {
	date?: Dayjs | null;
  business?: BusinessData;
  availableSlots: string[];
  loading: boolean;
  ctaText: string;
  ctaType: CtaType;
}

export interface BusinessData {
  name?: string;
  handle?: string;
  logoUrl?: string;
}

@Component({ templateUrl: './default-layout.component.html', selector: 'default-layout-phone' })
export class DefaultMarketingLayoutComponent {
  @Input()
  public data?: BUSINESS_DATA;

  public get business() {
    return this.data?.business;
  }
  public get date() {
    return this.data?.date;
  }
  public get loading() {
    return this.data?.loading || false;
  }
  public get availableSlots() {
    return this.data?.availableSlots || [];
  }
}
