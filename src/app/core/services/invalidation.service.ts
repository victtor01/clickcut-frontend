import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Disponível para toda a aplicação
})
export class InvalidationService {
  private invalidationChannel = new Subject<string>();

  public readonly INVALIDATE_KEYS = {
    service: 'services',
  };

  public invalidation$ = this.invalidationChannel.asObservable();

  public invalidate(key: string): void {
    console.log(`[InvalidationService] Invalidando a chave: ${key}`);
    this.invalidationChannel.next(key);
  }

}
