import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common'; // ✨ Importar DatePipe
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Invitation, InvitationStatus } from '@app/core/models/Invitation';
import { InvitesService } from '@app/core/services/invites.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-invite-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe], // ✨ Adicionar DatePipe nos imports
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
  public allInvitations = signal<Invitation[]>([]);
  public inviteForm!: FormGroup;

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // ✨ Carrega os convites ao iniciar
    this.findInvitations();
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

      // ✨ Atualiza a lista após enviar com sucesso
      await this.findInvitations();

      setTimeout(() => this.submissionState.set('idle'), 3000);
    } catch (error) {
      this.submissionState.set('error');
      setTimeout(() => this.submissionState.set('idle'), 4000);
    }
  }

  public async findInvitations(): Promise<void> {
    try {
      const invitations = await firstValueFrom(this.invitationService.getAll());  
      console.log(invitations)
      // Opcional: Ordenar por data (mais recentes primeiro)
      // invitations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.allInvitations.set(invitations);
    } catch (e) {
      console.error('Erro ao buscar convites', e);
    }
  }

  // ✨ Helper para estilizar o status
  public getStatusStyles(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.Pending:
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case InvitationStatus.Accepted:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case InvitationStatus.Expired:
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case InvitationStatus.Cancelled:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:border-neutral-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // ✨ Helper para traduzir o status (se necessário)
  public getStatusLabel(status: InvitationStatus): string {
    const labels: Record<string, string> = {
      Pending: 'Pendente',
      Accepted: 'Aceito',
      Declined: 'Recusado',
      Expired: 'Expirado',
      Cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }
}
