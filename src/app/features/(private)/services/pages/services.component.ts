import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { AllServicesComponent } from '../components/all-services/all-services.component';
import { CreateServiceModalComponent } from '../components/create-service-modal/create-service-modal.component';

@Component({
  templateUrl: './services.component.html',
  imports: [AllServicesComponent, RouterModule],
})
export class ServicesComponent {
  constructor(private router: Router, private readonly createDialogRef: MatDialog) {}

  public isEditing = false;

  public isActive(): boolean {
    return false;
  }

  public handleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  public onClickEdit = (service: Service) => {
    this.router.navigate(['/services', 'edit', service.id]);
  };

  public openCreateService() {
    const dialogRef = this.createDialogRef.open(CreateServiceModalComponent, {
      backdropClass: ['bg-gray-200/50', 'dark:bg-zinc-950/60', "backdrop-blur-sm"],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(50rem, 90%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef
  }
}
