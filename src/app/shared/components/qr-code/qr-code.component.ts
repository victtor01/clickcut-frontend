import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qrcode-display',
  standalone: true,
  imports: [CommonModule], // Importe CommonModule para usar diretivas como *ngIf
  templateUrl: './qr-code.component.html',
})
export class QrcodeDisplayComponent implements OnChanges {
  @Input({ required: true }) data: string | null = null;

  public qrCodeUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.generateQRCode(this.data);
    } else {
      this.qrCodeUrl.set(null);
    }
  }

  private async generateQRCode(dataString: string): Promise<void> {
    try {
      const url = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: 'L',
        type: 'image/png',
        margin: 2,
        width: 250, // Largura em pixels
      });

			this.qrCodeUrl.set(url);
    } catch (err) {
      console.error('Erro ao gerar o QR Code:', err);
      this.qrCodeUrl.set(null); // Limpa em caso de erro.
    }
  }
}
