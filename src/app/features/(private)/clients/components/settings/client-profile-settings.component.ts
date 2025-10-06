import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientAccount } from '@app/core/models/ClientAccount';

@Component({
  templateUrl: './client-profile-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class ClientProfileSettingsComponent {
  public userProfileForm!: FormGroup;
  public activeView: 'profile' | 'account' | 'privacy' | 'preferences' = 'profile';
  public currentUser!: ClientAccount; // Dados do usuário a serem editados

  // Simula o tema atual para as preferências
  public currentTheme: 'light' | 'dark' | 'system' = 'light';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientProfileSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: ClientAccount },
  ) {
    this.currentUser = data.user;
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

  setView(view: 'profile' | 'account' | 'privacy' | 'preferences'): void {
    this.activeView = view;
  }

  onAvatarChange(event: any): void {
    console.log('Avatar changed:', event.target.files[0]);
  }

  onBannerChange(event: any, type: 'simple' | 'gradient'): void {
    console.log('Banner changed:', type, event.target.files[0]);
  }

  saveChanges(): void {
    if (this.userProfileForm.valid) {
      console.log('Saving changes:', this.userProfileForm.value);
      // Aqui você chamaria um serviço para enviar os dados atualizados para o backend
      // Ex: this.userService.updateProfile(this.userProfileForm.value).subscribe(...);
      this.dialogRef.close(this.userProfileForm.value); // Fecha o modal e retorna os dados
    } else {
      // Marcar campos inválidos para feedback ao usuário
      this.userProfileForm.markAllAsTouched();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
