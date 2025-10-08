import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientAccount } from '@app/core/models/ClientAccount';
import { Theme, ThemeService } from '@app/core/services/theme.service';

@Component({
  templateUrl: './client-profile-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class ClientProfileSettingsComponent {
  public userProfileForm!: FormGroup;
  public activeView: 'profile' | 'account' | 'privacy' | 'preferences' = 'profile';
  public currentUser!: ClientAccount;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { user: ClientAccount },
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<ClientProfileSettingsComponent>,
    private readonly themeService: ThemeService,
  ) {
    this.currentUser = data.user;
  }

  public get currentTheme() {
    return this.themeService.theme;
  }

  ngOnInit(): void {
    this.userProfileForm = this.fb.group({
      fullName: [this.currentUser.fullName, Validators.required],
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      phoneNumber: [this.currentUser.phoneNumber || ''],
      avatarUrl: [this.currentUser.avatarUrl || ''],
      username: [this.currentUser.fullName || '', Validators.required], // Novo campo
      bio: [''],
      newsletterOptIn: [true], // Novo campo
    });
  }

  public handleTheme (event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.themeService.setTheme(value as Theme)
  }

  public setView(view: 'profile' | 'account' | 'privacy' | 'preferences'): void {
    this.activeView = view;
  }

  public onAvatarChange(event: any): void {
    console.log('Avatar changed:', event.target.files[0]);
  }

  public onBannerChange(event: any, type: 'simple' | 'gradient'): void {
    console.log('Banner changed:', type, event.target.files[0]);
  }

  public saveChanges(): void {
    if (this.userProfileForm.valid) {
      this.dialogRef.close(this.userProfileForm.value); // Fecha o modal e retorna os dados
    } else {
      this.userProfileForm.markAllAsTouched();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}
