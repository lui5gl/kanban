import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputText } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { ThemeSwitchComponent } from "../theme-switch/theme-switch.component";

@Component({
  selector: "app-board-header",
  standalone: true,
  imports: [FormsModule, InputText, ButtonModule, ThemeSwitchComponent],
  templateUrl: "./board-header.component.html",
})
export class BoardHeaderComponent {
  @Input() showFilters = false;
  @Input() showSortBar = false;
  @Input() searchTerm = "";

  @Output() showFiltersToggle = new EventEmitter<void>();
  @Output() showSortBarToggle = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() importClick = new EventEmitter<void>();
  @Output() exportClick = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTermChange.emit(value);
  }

  toggleFilters(): void {
    this.showFiltersToggle.emit();
  }

  toggleSortBar(): void {
    this.showSortBarToggle.emit();
  }

  onImport(): void {
    this.importClick.emit();
  }

  onExport(): void {
    this.exportClick.emit();
  }
}
