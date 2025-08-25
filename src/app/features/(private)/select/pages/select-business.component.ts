import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { DecorativeShapesComponent } from '../components/decorative-shapes/decorative-shapes.components';

@Component({
  templateUrl: './select-business.component.html',
  styleUrl: './select-business.component.css',
  imports: [CommonModule, DecorativeShapesComponent],
})
export class SelectBusinessComponent implements OnInit {
  public business?: Business[];

  constructor(private readonly businessService: BusinessService) {}

  public ngOnInit(): void {
    this.businessService.getAll().subscribe({
      next: (value) => {
				this.business = value || [];
      },
    });
  }

	public select(businessId: string) {

	}
}
