import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ColumnComponent } from "./components/column/column.component";
import { BoardHeaderComponent } from "./components/board-header/board-header.component";
import { BoardFooterComponent } from "./components/board-footer/board-footer.component";
import { FilterBarComponent } from "./components/filter-bar/filter-bar.component";
import { BoardService } from "./services/board.service";
import { BoardFilters, BoardStats } from "./models/card.model";
import { SortDirection, SortOption } from "./types/sort-option";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [
    ColumnComponent,
    BoardHeaderComponent,
    BoardFooterComponent,
    FilterBarComponent,
    FormsModule,
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

  ngOnInit(): void {
    this.refreshStats();
    this.boardService.filters$.subscribe(() => this.refreshStats());
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  onFiltersChange(filters: BoardFilters): void {
    this.boardService.setFilters(filters);
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

  private refreshStats(): void {
    this.stats = this.boardService.getStats();
  }
}
