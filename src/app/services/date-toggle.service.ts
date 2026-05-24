import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class DateToggleService implements OnDestroy {
  private intervalId?: ReturnType<typeof setInterval>;
  private readonly _showCreated = new BehaviorSubject<boolean>(true);
  readonly showCreated$ = this._showCreated.asObservable();

  constructor() {
    this.intervalId = setInterval(() => {
      this._showCreated.next(!this._showCreated.value);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
