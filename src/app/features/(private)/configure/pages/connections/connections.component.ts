import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MercadoPagoService } from '@app/core/services/mercado-pago.service';
import { MpLogoComponent } from '../../components/mp-logo/mp-logo.component';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [MpLogoComponent, CommonModule],
  templateUrl: './connections.component.html',
})
export class ConnectionsComponent implements OnInit {
  public connectionStatus = signal<'success' | 'error' | 'not_connected'>('not_connected');
  public isConnected?: boolean;

  constructor(private route: ActivatedRoute, private mercadoPagoService: MercadoPagoService) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('success') === 'mp_connected') {
        this.connectionStatus.set('success');
      }
      if (params.get('error')) {
        this.connectionStatus.set('error');
      }
    });

    this.mercadoPagoService.getState().subscribe({
      next: (tokens) => {
        this.isConnected = !!tokens;
        this.connectionStatus.set('success');
      },

      error: (err) => {
        console.log(err);
        this.isConnected = false;
      },
    });
  }

  public async connectMercadoPago(): Promise<void> {
    this.mercadoPagoService.getConnectUrl().subscribe({
      next: (value) => {
        if (value?.url) {
          window.location.href = value.url;
        }
      },
    });
  }

  public async disconectMercadoPago() {
    this.mercadoPagoService.disconnect().subscribe({
      next: () => {
        this.isConnected = false;
        this.connectionStatus.set('not_connected');
      },
    });
  }
}
