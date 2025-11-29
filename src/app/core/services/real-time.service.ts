import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  private hubConnection: signalR.HubConnection | undefined;
  public notifications$ = new Subject<Notification>();
  public bookingCancelled$ = new Subject<{ bookingId: string }>(); // Exemplo para outro evento

  constructor() {}

  public get conn() {
    return this.hubConnection;
  }

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
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Conexão SignalR iniciada com sucesso.');
        this.addRealTimeEventListeners();
      })
      .catch((err) => console.error('Erro ao iniciar a conexão SignalR: ', err));
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
    this.hubConnection?.on('Notifications', (data: Notification) => {
      console.log('Evento BookingConfirmed recebido:', data);
      this.notifications$.next(data);
    });
  }
}
