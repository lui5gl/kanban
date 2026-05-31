import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { BoardFilters } from "../../models/card.model";

@Component({
  selector: "app-filter-bar",
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: "./filter-bar.component.html",
})
export class FilterBarComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() searchTerm = "";

  @Output() filtersChange = new EventEmitter<BoardFilters>();

  filterPriorities: ("low" | "medium" | "high")[] = [];
  showArchived = false;
  dueDateFilter: BoardFilters["dueDateFilter"] = "all";

  readonly priorityOptions = [
    { label: "Baja", value: "low" as const },
    { label: "Media", value: "medium" as const },
    { label: "Alta", value: "high" as const },
  ];

  readonly dueDateOptions = [
    { label: "Todas", value: "all" as const },
    { label: "Atrasadas", value: "overdue" as const },
    { label: "Hoy", value: "today" as const },
    { label: "Esta semana", value: "week" as const },
    { label: "Sin fecha", value: "none" as const },
  ];

  ngOnInit(): void {
    this.emitFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchTerm"] && !changes["searchTerm"].firstChange) {
      this.emitFilters();
    }
  }

  togglePriority(priority: "low" | "medium" | "high"): void {
    const idx = this.filterPriorities.indexOf(priority);
    if (idx === -1) {
      this.filterPriorities.push(priority);
    } else {
      this.filterPriorities.splice(idx, 1);
    }
    this.emitFilters();
  }

  onDueDateFilterChange(): void {
    this.emitFilters();
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    this.emitFilters();
  }

  resetFilters(): void {
    this.filterPriorities = [];
    this.showArchived = false;
    this.dueDateFilter = "all";
    this.filtersChange.emit({
      searchTerm: this.searchTerm,
      priorities: [],
      showArchived: false,
      dueDateFilter: "all",
    });
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== "" ||
      this.filterPriorities.length > 0 ||
      this.showArchived ||
      this.dueDateFilter !== "all"
    );
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      searchTerm: this.searchTerm,
      priorities: [...this.filterPriorities],
      showArchived: this.showArchived,
      dueDateFilter: this.dueDateFilter,
    });
  }
}
