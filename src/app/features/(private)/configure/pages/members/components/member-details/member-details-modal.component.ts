import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MemberShip } from '@app/core/models/MemberShip';
import { Role } from '@app/core/models/Role';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';

interface DialogData {
  member: MemberShip;
  allRoles: Role[];
}

@Component({
  selector: 'app-member-details-modal',
  templateUrl: './member-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MoneyInputDirective],
})
export class MemberDetailsModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<MemberDetailsModalComponent>);
  private readonly fb = inject(FormBuilder);
  
  public data: DialogData = inject(MAT_DIALOG_DATA);
  public isLoading = signal(false);
  public form!: FormGroup;

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const memberRoleIds = new Set(this.member.roles.map((r) => r.id));
    const roleCheckboxes = this.data.allRoles.map((role) => memberRoleIds.has(role.id));

    this.form = this.fb.group({
      salary: [this.member.salary, [Validators.required, Validators.min(0)]],
      commissionRate: [
        this.member.commissionRate * 100,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      roles: this.fb.array(roleCheckboxes),
    });
  }

  public get rolesFormArray(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  public get member(): MemberShip {
    return this.data.member;
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public onFormSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const selectedRoles = this.form.value.roles
      .map((checked: boolean, i: number) => (checked ? this.data.allRoles[i] : null))
      .filter((role: Role | null): role is Role => role !== null);

    const updatedMemberData = {
      ...this.member,
      salary: this.form.value.salary,
      commissionRate: this.form.value.commissionRate,
      roles: selectedRoles,
    } satisfies MemberShip;

    // Simula uma pequena latência de API
    setTimeout(() => {
      this.isLoading.set(false);
      // Fecha o diálogo e retorna os dados atualizados
      this.dialogRef.close(updatedMemberData);
    }, 1000);
  }
}
