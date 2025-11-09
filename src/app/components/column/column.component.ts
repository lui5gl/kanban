import { NgOptimizedImage } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AfterContentChecked, Component, Input } from '@angular/core';
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
};

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styles: [],
  imports: [CardComponent, NgOptimizedImage, DragDropModule],
})
export class ColumnComponent implements AfterContentChecked {
  private readonly boardColumns = ['Por hacer', 'En progreso', 'Hecho'];
  @Input() column_name = 'Columna sin nombre';
  cards: ColumnCard[] = [];

  ngAfterContentChecked(): void {
    this.loadCards();
  }

  loadCards(): void {
    const columnStoredCards = localStorage.getItem(this.column_name);
    this.cards = columnStoredCards
      ? (JSON.parse(columnStoredCards) as ColumnCard[]).map((card) => {
          const fallback = card.createdAt ?? card.updatedAt ?? new Date().toISOString();
          return {
            ...card,
            is_archived: card.is_archived ?? false,
            createdAt: card.createdAt ?? fallback,
            updatedAt: card.updatedAt ?? fallback,
          };
        })
      : [];
    this.moveArchivedToBottom(this.cards);
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
    });
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
    this.moveArchivedToBottom(this.cards);
    this.saveCards();
  }

  drop(event: CdkDragDrop<ColumnCard[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
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
    this.moveArchivedToBottom(event.container.data);

    const previousColumnName = this.getColumnNameFromDropListId(
      event.previousContainer.id,
    );

    if (previousColumnName) {
      this.moveArchivedToBottom(event.previousContainer.data);
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

  private moveArchivedToBottom(cards: ColumnCard[]): void {
    if (!cards.length) return;

    const active: ColumnCard[] = [];
    const archived: ColumnCard[] = [];

    cards.forEach((card) =>
      card.is_archived ? archived.push(card) : active.push(card),
    );

    cards.splice(0, cards.length, ...active, ...archived);
  }
}
