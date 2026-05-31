import { Component, inject } from "@angular/core";
import { ThemeService, ThemeMode } from "../../services/theme.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-theme-switch",
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: "./theme-switch.component.html",
})
export class ThemeSwitchComponent {
  private readonly themeService = inject(ThemeService);

  theme$ = this.themeService.theme$;

  readonly modes: { value: ThemeMode; icon: string; label: string }[] = [
    { value: "auto", icon: "ti ti-brightness-auto", label: "Auto" },
    { value: "light", icon: "ti ti-sun", label: "Claro" },
    { value: "dark", icon: "ti ti-moon", label: "Oscuro" },
  ];

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }
}
