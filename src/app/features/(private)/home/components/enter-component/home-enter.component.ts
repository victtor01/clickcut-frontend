import { Component, OnInit } from '@angular/core';
import { BusinessStatement } from '@app/core/models/BusinessStatement';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';

@Component({
  templateUrl: './home-enter.component.html',
  selector: 'home-enter',
  imports: [ToFormatBrlPipe]
})
export class HomeEnterComponent implements OnInit {
  constructor(
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService
  ) {}

  public statement?: BusinessStatement;

  public ngOnInit(): void {
    this.businessService.getStatement().subscribe({
      next: (data) => {
        this.statement = data;
      },

      error: () => {
        this.toastService.error(
          'Houve um erro ao tentar pegar o as informações'
        );
      },
    });
  }
}
