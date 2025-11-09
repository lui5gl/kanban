import { NgOptimizedImage } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AfterContentChecked, Component, Input } from '@angular/core';
import { SortDirection, SortOption } from '../../types/sort-option';
import { CardComponent } from '../card/card.component';

type ColumnCard = {
  id: number;
  title: string;
  description: string;
  priority: string;
  column_name: string;
  is_archived: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
};

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styles: [],
  imports: [CardComponent, NgOptimizedImage, DragDropModule],
})
export class ColumnComponent implements AfterContentChecked {
  private readonly boardColumns = ['Por hacer', 'En progreso', 'Hecho'];
  private _sortOption: SortOption = 'createdAt';
  private _sortDirection: SortDirection = 'asc';
  @Input() column_name = 'Columna sin nombre';
  @Input()
  set sortOption(value: SortOption) {
    if (this._sortOption === value) return;
    this._sortOption = value;
    this.arrangeCards(this.cards);
  }
  get sortOption(): SortOption {
    return this._sortOption;
  }
  @Input()
  set sortDirection(value: SortDirection) {
    if (this._sortDirection === value) return;
    this._sortDirection = value;
    this.arrangeCards(this.cards);
  }
  get sortDirection(): SortDirection {
    return this._sortDirection;
  }
  cards: ColumnCard[] = [];

  ngAfterContentChecked(): void {
    this.loadCards();
  }

  loadCards(): void {
    const columnStoredCards = localStorage.getItem(this.column_name);
    this.cards = columnStoredCards
      ? (JSON.parse(columnStoredCards) as ColumnCard[]).map((card) => {
          const fallback =
            card.createdAt ?? card.updatedAt ?? new Date().toISOString();
          return {
            ...card,
            is_archived: card.is_archived ?? false,
            createdAt: card.createdAt ?? fallback,
            updatedAt: card.updatedAt ?? fallback,
            dueDate: card.dueDate ?? null,
          };
        })
      : [];
    this.arrangeCards(this.cards);
  }

  saveCards(): void {
    localStorage.setItem(this.column_name, JSON.stringify(this.cards));
    this.loadCards();
  }

  addCard(): void {
    const newId = this.cards.length
      ? Math.max(...this.cards.map((item) => item.id)) + 1
      : 1;
    const timestamp = new Date().toISOString();

    this.cards.push({
      id: newId,
      title: 'Nuevo titulo',
      description: 'Nueva descripcion',
      column_name: this.column_name,
      priority: 'low',
      is_archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      dueDate: null,
    });
    this.arrangeCards();
    this.saveCards();
  }

  removeCard(id: number): void {
    this.cards = this.cards.filter((item) => item.id !== id);
    this.saveCards();
  }

  updateCard(item: ColumnCard): void {
    const index = this.cards.findIndex((i) => i.id === item.id);

    if (index === -1)
      return console.error('La tarjeta que intentas actualizar no existe.');

    this.cards[index] = { ...item };
    this.arrangeCards();
    this.saveCards();
  }

  drop(event: CdkDragDrop<ColumnCard[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
      this.arrangeCards();
      this.saveCards();
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const movedCard = event.container.data[event.currentIndex];
    movedCard.column_name = this.column_name;
    movedCard.updatedAt = new Date().toISOString();
    this.arrangeCards(event.container.data);

    const previousColumnName = this.getColumnNameFromDropListId(
      event.previousContainer.id,
    );

    if (previousColumnName) {
      this.arrangeCards(event.previousContainer.data);
      this.persistColumn(previousColumnName, event.previousContainer.data);
    }

    this.saveCards();
  }

  get dropListId(): string {
    return this.toDropListId(this.column_name);
  }

  get connectedDropLists(): string[] {
    return this.boardColumns
      .filter((column) => column !== this.column_name)
      .map((column) => this.toDropListId(column));
  }

  private persistColumn(columnName: string, cards: ColumnCard[]): void {
    localStorage.setItem(columnName, JSON.stringify(cards));
  }

  private toDropListId(columnName: string): string {
    return `drop-list-${columnName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private getColumnNameFromDropListId(id: string): string | undefined {
    return this.boardColumns.find(
      (column) => this.toDropListId(column) === id,
    );
  }

  private arrangeCards(cards: ColumnCard[] = this.cards): void {
    if (!cards.length) return;

    const comparator = this.getComparator();
    const active: ColumnCard[] = [];
    const archived: ColumnCard[] = [];

    cards.forEach((card) =>
      card.is_archived ? archived.push(card) : active.push(card),
    );

    active.sort(comparator);
    archived.sort(comparator);

    cards.splice(0, cards.length, ...active, ...archived);
  }

  private getComparator(): (a: ColumnCard, b: ColumnCard) => number {
    const directionFactor = this._sortDirection === 'asc' ? 1 : -1;
    return (a, b) => {
      let comparison = 0;
      switch (this._sortOption) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'es', {
            sensitivity: 'base',
          });
          break;
        case 'priority':
          comparison =
            this.priorityWeight(a.priority) - this.priorityWeight(b.priority);
          break;
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'createdAt':
        default:
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return comparison * directionFactor;
    };
  }

  private priorityWeight(priority: string): number {
    const order: Record<string, number> = { low: 1, medium: 2, high: 3 };
    return order[priority] ?? 99;
  }
}
