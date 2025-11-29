import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { Permission, RoleLegendDTO } from '@app/core/DTOs/roles-legends-response';
import { Role } from '@app/core/models/Role';
import { RolesService } from '@app/core/services/roles.service';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-modal.component.html',
})
export class RoleModalComponent implements OnInit {
  private dialogData = inject<{ roleId?: string } | null>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<RoleModalComponent>);
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public permissionGroups = signal<RoleLegendDTO[]>([]);
  public isEditMode = signal<boolean>(false);
  public isLoading = signal<boolean>(true);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      permissions: this.fb.array([]),
    });
  }

  public async ngOnInit(): Promise<void> {
    const roleId = this.dialogData?.roleId;
    this.isEditMode.set(!!roleId);

    try {
      const permissionsLegend = await firstValueFrom(this.rolesService.findLegends());
      this.permissionGroups.set(permissionsLegend);
      console.log(permissionsLegend)

      if (this.isEditMode() && roleId) {
        const roleToEdit = await firstValueFrom(this.rolesService.findById(roleId));
        this.form.patchValue({ name: roleToEdit.name });
        this.buildPermissionsFormArray(roleToEdit.permissions);
      } else {
        this.buildPermissionsFormArray();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do modal:', error);
      this.closeDialog(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  get permissionsFormArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  private buildPermissionsFormArray(selectedPermissions: string[] = []): void {
    this.permissionsFormArray.clear();

    this.permissionGroups().forEach((group) => {
      if (group && Array.isArray(group.permissions)) {
        group.permissions.forEach((permission) => {
          const isSelected = selectedPermissions.includes(permission.key);
          this.permissionsFormArray.push(new FormControl(isSelected));
        });
      }
    });
  }

  public onFormSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;
    const selectedPermissions: string[] = [];
    let controlIndex = 0;

    this.permissionGroups().forEach((group) => {
      if (group && Array.isArray(group.permissions)) {
        group.permissions.forEach((permission) => {
          if (formValue.permissions[controlIndex]) {
            selectedPermissions.push(permission.key);
          }
          controlIndex++;
        });
      }
    });

    const result: Partial<Role> = {
      id: this.dialogData?.roleId,
      name: formValue.name,
      permissions: selectedPermissions,
    };

    this.closeDialog(result);
  }

  public getFormControlIndex(groupIndex: number, permissionIndex: number): number {
    let currentIndex = 0;

    for (let i = 0; i < groupIndex; i++) {
      currentIndex += this.permissionGroups()[i]?.permissions?.length || 0;
    }

    return currentIndex + permissionIndex;
  }

  public closeDialog(data: Partial<Role> | false = false): void {
    this.dialogRef.close(data);
  }

  public trackByGroup(index: number, group: RoleLegendDTO): string {
    return group.groupName;
  }

  public trackByPermission(index: number, permission: Permission): string {
    return permission.key;
  }
}
