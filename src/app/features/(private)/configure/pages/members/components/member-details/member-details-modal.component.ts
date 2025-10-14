import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MemberShip } from '@app/core/models/MemberShip';
import { Role } from '@app/core/models/Role';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';

// A interface de dados agora inclui todas as roles disponíveis para popular o seletor.
interface DialogData {
  member: MemberShip;
  allRoles: Role[]; // Essencial para saber quais cargos podem ser atribuídos
}

@Component({
  selector: 'app-member-details-modal',
  templateUrl: './member-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MoneyInputDirective],
})
export class MemberDetailsModalComponent implements OnInit {
  // Injeção de dependências moderna com inject()
  public data: DialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<MemberDetailsModalComponent>);
  private fb = inject(FormBuilder);

  // Sinal para controlar o estado de carregamento
  public isLoading = signal(false);

  // Declaração do formulário reativo
  public form!: FormGroup;

  ngOnInit(): void {
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

  /**
   * Getter para facilitar o acesso ao FormArray de roles no template.
   */
  public get rolesFormArray(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  /**
   * Retorna o membro injetado no modal.
   */
  public get member(): MemberShip {
    return this.data.member;
  }

  /**
   * Fecha o diálogo sem salvar.
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Processa o envio do formulário.
   */
  public onFormSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Converte o array de booleans do formulário de volta para um array de objetos Role
    const selectedRoles = this.form.value.roles
      .map((checked: boolean, i: number) => (checked ? this.data.allRoles[i] : null))
      .filter((role: Role | null): role is Role => role !== null);

    // Monta o objeto de resultado com os dados atualizados
    const updatedMemberData = {
      ...this.member, // Mantém os dados imutáveis como ID do usuário
      salary: this.form.value.salary,
      commissionRate: this.form.value.commissionRate,
      roles: selectedRoles,
    };

    // Simula uma pequena latência de API
    setTimeout(() => {
      this.isLoading.set(false);
      // Fecha o diálogo e retorna os dados atualizados
      this.dialogRef.close(updatedMemberData);
    }, 1000);
  }
}
