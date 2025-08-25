import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { DecorativeShapesComponent } from '../components/decorative-shapes/decorative-shapes.components';

@Component({
  templateUrl: './select-business.component.html',
  styleUrl: './select-business.component.css',
  imports: [CommonModule, DecorativeShapesComponent],
})
export class SelectBusinessComponent implements OnInit {
  public business?: Business[];

  constructor(
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.businessService.getAll().subscribe({
      next: (value) => {
        this.business = value || [];
      },
    });
  }

  public select(businessId: string) {
    this.businessService.select(businessId).subscribe({
      next: (_) => {
        this.toastService.success(`Login bem-sucedido`);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
        this.toastService.error('Não foi possível conectar-se a loja');
      },
    });
  }
}
