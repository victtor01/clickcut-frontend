import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MemberShip } from '@app/core/models/MemberShip';
import { Role } from '@app/core/models/Role';
import { MembersService } from '@app/core/services/members.service';
import { RolesService } from '@app/core/services/roles.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { RoleModalComponent } from './components/role-modal/role-modal.component';

@Component({ templateUrl: 'members.component.html' })
export class MembersComponent implements OnInit {
  private membersService = inject(MembersService);
  private rolesService = inject(RolesService);
  private toastService = inject(ToastService);

  public members: MemberShip[] = [];
  public roles: Role[] = [];

  constructor(private readonly rolesDialog: MatDialog) {}

  ngOnInit(): void {
    this.fetch();
  }

  private async fetch(): Promise<void> {
    [this.members, this.roles] = await Promise.all([
      (this.members = await firstValueFrom(this.membersService.findAll())),
      (this.roles = await firstValueFrom(this.rolesService.findAll())),
    ]);
  }

  private async update(role: Role): Promise<void> {
    try {
      const updated = await firstValueFrom(this.rolesService.update(role));
      this.toastService.success('Atualizado com sucesso!');
    } catch (err) {
      console.log(err);
      this.toastService.error('Não foi possivel atualizar o serviço');
    }
  }
  
  private async create(data: Omit<Role, 'id'>) {}

  public openRoleModal(roleId?: string) {
    const modal = this.rolesDialog.open(RoleModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '40rem',
      width: 'min(40rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      ...(roleId && { data: { roleId } }),
    });

    modal.afterClosed().subscribe((data: Partial<Role> | undefined) => {
      if (!data) return;

      const hasId = typeof data.id === 'string' && data.id.trim().length > 0;
      const hasName = typeof data.name === 'string' && data.name.trim().length > 0;
      const hasPermissions = Array.isArray(data.permissions) && data.permissions.length > 0;

      console.log({ id: data.id!, name: data.name!, permissions: data.permissions! });
      if (!hasName || !hasPermissions) return;
      if (hasId) {
        this.update({ id: data.id!, name: data.name!, permissions: data.permissions! });
      } else if (hasName && hasPermissions) {
        this.create({ name: data.name!, permissions: data.permissions! });
      }
    });
  }
}
