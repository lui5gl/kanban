import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export type ThemeMode = "auto" | "light" | "dark";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly STORAGE_KEY = "kanban-theme";

  private themeSubject = new BehaviorSubject<ThemeMode>(this.loadStoredTheme());
  private systemDarkSubject = new BehaviorSubject<boolean>(
    this.detectSystemDark(),
  );

  /** Current theme mode preference (`'auto'` | `'light'` | `'dark'`). */
  theme$: Observable<ThemeMode> = this.themeSubject.asObservable();

  /** Whether dark mode is effectively active, resolving `'auto'` to the system preference. */
  isDark$: Observable<boolean> = this.resolveIsDark$();

  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.applyTheme();
    this.listenToSystemChanges();
  }

  /** Change the theme mode and persist the choice. */
  setTheme(mode: ThemeMode): void {
    this.themeSubject.next(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
    this.applyTheme();
  }

  // ── Private helpers ────────────────────────────────────────────────

  private loadStoredTheme(): ThemeMode {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === "auto" || stored === "light" || stored === "dark") {
      return stored;
    }
    return "auto";
  }

  private detectSystemDark(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  private listenToSystemChanges(): void {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemDarkSubject.next(this.mediaQuery.matches);

    this.mediaQuery.addEventListener("change", (e: MediaQueryListEvent) => {
      this.systemDarkSubject.next(e.matches);
      this.applyTheme();
    });
  }

  private isDarkActive(): boolean {
    const mode = this.themeSubject.value;
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return this.systemDarkSubject.value;
  }

  private applyTheme(): void {
    const dark = this.isDarkActive();
    document.documentElement.classList.toggle("dark", dark);
  }

  private resolveIsDark$(): Observable<boolean> {
    // Combine both the user-preference stream and the system-preference stream
    // so that components always get the latest resolved value.
    return new Observable<boolean>((subscriber) => {
      const emit = () => subscriber.next(this.isDarkActive());

      const themeSub = this.themeSubject.subscribe(emit);
      const systemSub = this.systemDarkSubject.subscribe(emit);

      emit(); // initial value

      return () => {
        themeSub.unsubscribe();
        systemSub.unsubscribe();
      };
    });
  }
}
