import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ColumnComponent } from "./components/column/column.component";
import { BoardService } from "./services/board.service";
import { BoardFilters, BoardStats } from "./models/card.model";
import { SortDirection, SortOption } from "./types/sort-option";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [
    ColumnComponent,
    FormsModule,
    InputText,
    Select,
    ButtonModule,
    ConfirmDialog,
  ],
})
export class AppComponent implements OnInit {
  private readonly boardService = inject(BoardService);

  sortOption: SortOption = "createdAt";
  sortDirection: SortDirection = "asc";

  searchTerm = "";
  filterPriorities: ("low" | "medium" | "high")[] = [];
  showArchived = false;
  dueDateFilter: BoardFilters["dueDateFilter"] = "all";

  showFilters = false;
  showSortBar = false;

  stats: BoardStats = {
    totalCards: 0,
    cardsByColumn: {},
    cardsByPriority: { low: 0, medium: 0, high: 0 },
    overdueCards: 0,
    completedCards: 0,
    archivedCards: 0,
  };

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: "title", label: "Título" },
    { value: "createdAt", label: "Creación" },
    { value: "updatedAt", label: "Actualización" },
    { value: "priority", label: "Prioridad" },
  ];

  priorityOptions = [
    { label: "Baja", value: "low" as const },
    { label: "Media", value: "medium" as const },
    { label: "Alta", value: "high" as const },
  ];

  dueDateOptions = [
    { label: "Todas", value: "all" as const },
    { label: "Atrasadas", value: "overdue" as const },
    { label: "Hoy", value: "today" as const },
    { label: "Esta semana", value: "week" as const },
    { label: "Sin fecha", value: "none" as const },
  ];

  ngOnInit(): void {
    this.refreshStats();
    this.boardService.filters$.subscribe(() => this.refreshStats());
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  togglePriority(priority: "low" | "medium" | "high"): void {
    const idx = this.filterPriorities.indexOf(priority);
    if (idx === -1) {
      this.filterPriorities.push(priority);
    } else {
      this.filterPriorities.splice(idx, 1);
    }
    this.applyFilters();
  }

  toggleDirection(): void {
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
  }

  exportData(): void {
    this.boardService.downloadJSON();
  }

  async importData(): Promise<void> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await this.boardService.importFromFile(file);
        if (success) this.refreshStats();
      }
    };
    input.click();
  }

  resetFilters(): void {
    this.searchTerm = "";
    this.filterPriorities = [];
    this.showArchived = false;
    this.dueDateFilter = "all";
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== "" ||
      this.filterPriorities.length > 0 ||
      this.showArchived ||
      this.dueDateFilter !== "all"
    );
  }

  applyFilters(): void {
    this.boardService.setFilters({
      searchTerm: this.searchTerm,
      priorities: this.filterPriorities,
      showArchived: this.showArchived,
      dueDateFilter: this.dueDateFilter,
    });
  }

  private refreshStats(): void {
    this.stats = this.boardService.getStats();
  }
}
