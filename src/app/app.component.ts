import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ColumnComponent } from './components/column/column.component';
import { SortDirection, SortOption } from './types/sort-option';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, ColumnComponent, NgOptimizedImage],
})
export class AppComponent {
  sortOption: SortOption = 'createdAt';
  sortDirection: SortDirection = 'asc';

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title', label: 'Título' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'updatedAt', label: 'Última actualización' },
    { value: 'priority', label: 'Prioridad' },
  ];

  onSortChange(event: Event) {
    this.sortOption = (event.target as HTMLSelectElement).value as SortOption;
  }

  toggleDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
}
