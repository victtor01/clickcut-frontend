import { Component, inject, OnInit } from '@angular/core';
import { MemberShip } from '@app/core/models/MemberShip';
import { Role } from '@app/core/models/Role';
import { MembersService } from '@app/core/services/members.service';
import { RolesService } from '@app/core/services/roles.service';
import { firstValueFrom } from 'rxjs';

@Component({ templateUrl: 'members.component.html' })
export class MembersComponent implements OnInit {
  private membersService = inject(MembersService);
	private rolesService = inject(RolesService);

  public members: MemberShip[] = [];
	public roles: Role[] = [];

  ngOnInit(): void {
		this.fetch()
	}

  private async fetch(): Promise<void> {
		[this.members, this.roles] = await Promise.all([
			this.members = await firstValueFrom(this.membersService.findAll()),
			this.roles = await firstValueFrom(this.rolesService.findAll()),
		])

		console.log(this.roles)
	}
}
