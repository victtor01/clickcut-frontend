import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Booking } from '../models/Booking';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private hubConnection: signalR.HubConnection | undefined;
  public bookingConfirmed$ = new Subject<Booking>();
  public bookingCancelled$ = new Subject<{ bookingId: string }>(); // Exemplo para outro evento

  constructor() { }

  /**
   * Inicia a conexão com o Hub do SignalR.
   * Deve ser chamado após o login do usuário.
   */
  public startConnection(): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/notificationHub`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Conexão SignalR iniciada com sucesso.');
        this.addRealTimeEventListeners();
      })
      .catch(err => console.error('Erro ao iniciar a conexão SignalR: ', err));
  }

  /**
   * Para a conexão com o Hub.
   * Deve ser chamado durante o logout do usuário.
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('Conexão SignalR finalizada.'));
    }
  }

  /**
   * Registra os 'listeners' para os eventos enviados pelo servidor.
   */
  private addRealTimeEventListeners(): void {
    // Ouve pelo evento 'BookingConfirmed'
    this.hubConnection?.on('BookingConfirmed', (data: Booking) => {
      console.log('Evento BookingConfirmed recebido:', data);
      this.bookingConfirmed$.next(data);
    });
  }
}