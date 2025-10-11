import { animate, style, transition, trigger } from '@angular/animations'; // Para animações de feedback
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // ReactiveFormsModule para o formulário
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { InvitesService } from '@app/core/services/invites.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterLink], // Adicione ReactiveFormsModule
  templateUrl: './accept-invite.component.html',
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
export class AcceptInviteComponent implements OnInit {
  public token = signal<string | null>(null);
  public isLoading = signal<boolean>(true);
  public isAccepting = signal<boolean>(false);
  public isAccepted = signal<boolean>(false);
  public error = signal<string | null>(null);
  public acceptForm!: FormGroup;

  private readonly inviteService = inject(InvitesService);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
  ) {
    this.acceptForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const receivedToken = params['token'];
      if (receivedToken) {
        this.token.set(receivedToken);
        this.isLoading.set(false);
      } else {
        this.error.set('Token de convite não encontrado na URL.');
        this.isLoading.set(false);
      }
    });
  }

  async onAcceptInvite(): Promise<void> {
    if (!this.token()) {
      this.error.set('Não é possível aceitar o convite: token ausente.');
      return;
    }

    this.isAccepting.set(true);
    this.error.set(null);

    try {
      // Chame seu serviço para aceitar o convite
      // Exemplo:

      await firstValueFrom(this.inviteService.accept({ token: this.token()! })).catch((err) => {
        console.log(err)
        
        if (err instanceof HttpErrorResponse) {
          throw new Error(err.error?.message);
        }
      });
      
      // await this.managerInvitationService.acceptInvite(this.token()).toPromise();

      // Simulação de chamada de API:
      // Simule um erro descomentando a linha abaixo:
      // throw new Error('Falha ao aceitar convite no backend.');

      this.isAccepted.set(true);
      this.isAccepting.set(false);
      // Opcional: Redirecionar para o dashboard após um pequeno delay
      // setTimeout(() => this.router.navigate(['/dashboard']), 3000);
    } catch (e: any) {
      this.isAccepting.set(false);
      this.error.set(e.message || 'Erro desconhecido ao aceitar o convite.');
      console.error('Erro ao aceitar convite:', e);
    }
  }
}
