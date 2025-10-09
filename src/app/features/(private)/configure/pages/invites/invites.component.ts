import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvitesService } from '@app/core/services/invites.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-invite-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invites.component.html',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class InvitesComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  public invitationService = inject(InvitesService);
  public submissionState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  public inviteForm!: FormGroup;

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.inviteForm.get('email');
  }

  public async onSubmit(): Promise<void> {
    if (this.inviteForm.invalid) {
      return;
    }

    this.submissionState.set('loading');

    try {
      await firstValueFrom(
        this.invitationService.createInvite({ email: this.inviteForm.get('email')?.value }),
      );

      this.submissionState.set('success');
      this.inviteForm.reset();

      setTimeout(() => this.submissionState.set('idle'), 3000);
    } catch (error) {
      this.submissionState.set('error');
      setTimeout(() => this.submissionState.set('idle'), 4000);
    }
  }
}
