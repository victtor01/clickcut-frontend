export interface UpdateBusinessDTO {
  name: string;
  revenueGoal: number;
  handle?: string;
  description?: string;
  phoneNumber?: string;
  logoFile: File | null;
  bannerFile: File | null;
  removeLogoFile: boolean;
  removeBannerFile: boolean;
  paymentAccountId?: string | null;
}
