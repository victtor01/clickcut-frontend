import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '@app/core/models/User';
import { UpdateUserDTO } from '@app/core/schemas/update-user.dto';
import { ToastService } from '@app/core/services/toast.service';
import { UsersService } from '@app/core/services/users.service';
import { finalize } from 'rxjs';

@Component({
  templateUrl: './profile.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class ConfigureProfileComponent implements OnInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      code: [''],
    });
  }

  public summary?: User;
  public form: FormGroup;
  public selectedFile: File | null = null;
  public imagemPreview: string | null = null;

  // -- states --
  public editing: boolean = false;
  public isLoading: boolean = false;
  public errors?: Record<string, string[]>;
  public originalEmail?: string;

  public get firstError() {
    if (this.errors) {
      const messageErrors = Object.entries(this.errors)?.map(([key, value]) => value);
      return messageErrors[0];
    }

    return null;
  }

  public ngOnInit(): void {
    this.usersService.findSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.imagemPreview = data.photoUrl || null;
        this.originalEmail = data.email;
        this.form?.patchValue({
          name: data.username,
          email: data.email,
        });
      },
    });
  }

  public onInputEmailClick(): void {
    if (!this.editing) {
      this.editing = true;
    }
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  public submit(): void {
    if (!this.form.valid) {
      console.log('teste');
      return;
    }

    this.isLoading = true;

    const dataToUpdate = {
      username: this.form.get('name')?.value,
      email: this.form.get('email')?.value,
      removePhoto: false,
      photo: this.selectedFile,
      codeVerification: this.form.get('code')?.value,
    } satisfies UpdateUserDTO;

    this.usersService
      .update(dataToUpdate)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success('Informações salvas');
        },

        error: (err) => {
          this.toastService.error('Alguma informação incorreta!');
          this.errors = err?.error?.errors;
        },
      });
  }

  public handleCloseEmailInput(): void {
    this.editing = !this.editing;
    if (this.editing === false) {
      this.form.patchValue({
        email: this.originalEmail,
      });
    }
  }

  public sendConfirmEmail() {
    if (!this.form.get('email')?.valid) {
      return;
    }

    this.usersService.sendEmailToChangeEmail(this.form.get('email')?.value).subscribe({
      next: (data) => {
        console.log(data);
      },
    });
  }
}
