export interface UpdateUserDTO {
  username: string;
  email: string;
  removePhoto: boolean;
  codeVerification?: string | null;
  photo?: File | null;
}
