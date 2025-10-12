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

// Importe seus modelos e serviços
import { RoleLegendDTO } from '@app/core/DTOs/roles-legends-response';
import { Role } from '@app/core/models/Role';
import { RolesService } from '@app/core/services/roles.service';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-modal.component.html',
})
export class RoleModalComponent implements OnInit {
  // --- Injeção de Dependências ---
  private dialogData = inject<{ roleId?: string } | null>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<RoleModalComponent>);
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);

  // --- Estado do Componente ---
  public form: FormGroup;
  public allPermissions = signal<RoleLegendDTO[]>([]);
  public isEditMode = signal<boolean>(false);
  public isLoading = signal<boolean>(true);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      permissions: this.fb.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    const roleId = this.dialogData?.roleId;
    this.isEditMode.set(!!roleId);

    try {
      // Busca a lista de todas as permissões possíveis no sistema
      const permissionsLegend = await firstValueFrom(this.rolesService.findLegends());
      this.allPermissions.set(permissionsLegend);

      if (this.isEditMode() && roleId) {
        // --- MODO EDIÇÃO ---
        const roleToEdit = await firstValueFrom(this.rolesService.findById(roleId));
        this.form.patchValue({ name: roleToEdit.name });
        this.buildPermissionsFormArray(roleToEdit.permissions);
      } else {
        // --- MODO CRIAÇÃO ---
        this.buildPermissionsFormArray();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do modal:', error);
      this.closeDialog(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Getter para facilitar o acesso ao FormArray no template
  get permissionsFormArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  /**
   * Constrói o FormArray de checkboxes de permissão.
   * @param selectedPermissions As permissões que devem vir marcadas (para o modo edição).
   */
  private buildPermissionsFormArray(selectedPermissions: string[] = []): void {
    this.allPermissions().forEach((permissionInfo) => {
      const isSelected = selectedPermissions.includes(permissionInfo.value);
      this.permissionsFormArray.push(new FormControl(isSelected));
    });
  }

  /**
   * Chamado ao submeter o formulário.
   */
  onFormSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;

    // Transforma o array de booleans de volta para um array de strings com os valores das permissões
    const selectedPermissions = this.allPermissions()
      .filter((_, index) => formValue.permissions[index])
      .map((permissionInfo) => permissionInfo.value);

    const result: Partial<Role> = {
      id: this.dialogData?.roleId,
      name: formValue.name,
      permissions: selectedPermissions,
    };

    this.closeDialog(result);
  }

  /**
   * Fecha o modal, opcionalmente passando dados de volta.
   */
  closeDialog(data: Partial<Role> | false = false): void {
    this.dialogRef.close(data);
  }
}
