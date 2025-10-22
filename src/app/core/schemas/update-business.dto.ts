export interface UpdateBusinessDTO {
  name: string;
  revenueGoal: number;
  logoFile: File | null;
  bannerFile: File | null;
  removeLogoFile: boolean;
  removeBannerFile: boolean;
  paymentAccountId?: string | null;
}
