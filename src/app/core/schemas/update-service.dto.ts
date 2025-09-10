export interface UpdateServiceDTO {
  title: string;
  durationInMinutes: number;
  price: number;
  isActive: boolean;
  description?: string;
  file?: File | null
}