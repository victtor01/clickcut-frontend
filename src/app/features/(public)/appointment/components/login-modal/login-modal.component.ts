import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { SvgLogin } from './components/svg-login.component';

@Component({
  templateUrl: 'login-modal.component.html',
  imports: [CommonModule, SvgLogin, RouterModule],
})
export class LoginModalComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: any,
  ) {}
}
