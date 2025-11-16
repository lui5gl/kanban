import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage, NgIf } from '@angular/common';
import { BoardService } from '../../services/board.service';
import { BoardFilters } from '../../models/card.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  templateUrl: './filters.component.html',
  imports: [FormsModule, NgOptimizedImage, NgIf],
})
export class FiltersComponent implements OnInit {
  searchTerm = '';
  selectedPriorities: { low: boolean; medium: boolean; high: boolean } = {
    low: false,
    medium: false,
    high: false,
  };
  showArchived = false;
  dueDateFilter: BoardFilters['dueDateFilter'] = 'all';
  isExpanded = false;

  readonly dueDateOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'overdue', label: 'Atrasadas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'none', label: 'Sin fecha' },
  ];

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    const filters = this.boardService.getFilters();
    this.searchTerm = filters.searchTerm;
    this.showArchived = filters.showArchived;
    this.dueDateFilter = filters.dueDateFilter;

    filters.priorities.forEach(priority => {
      this.selectedPriorities[priority] = true;
    });
  }

  onSearchChange(): void {
    this.updateFilters();
  }

  onPriorityChange(): void {
    this.updateFilters();
  }

  onShowArchivedChange(): void {
    this.updateFilters();
  }

  onDueDateFilterChange(): void {
    this.updateFilters();
  }

  private updateFilters(): void {
    const priorities: ('low' | 'medium' | 'high')[] = [];
    if (this.selectedPriorities.low) priorities.push('low');
    if (this.selectedPriorities.medium) priorities.push('medium');
    if (this.selectedPriorities.high) priorities.push('high');

    this.boardService.setFilters({
      searchTerm: this.searchTerm,
      priorities,
      showArchived: this.showArchived,
      dueDateFilter: this.dueDateFilter,
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedPriorities = { low: false, medium: false, high: false };
    this.showArchived = false;
    this.dueDateFilter = 'all';
    this.boardService.resetFilters();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.selectedPriorities.low ||
      this.selectedPriorities.medium ||
      this.selectedPriorities.high ||
      this.showArchived ||
      this.dueDateFilter !== 'all'
    );
  }
}
