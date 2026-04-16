import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private refreshEstoque = new Subject<void>();
  refreshEstoque$ = this.refreshEstoque.asObservable();

  triggerRefreshEstoque() {
    this.refreshEstoque.next();
  }
}