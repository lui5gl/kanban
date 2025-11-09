import { NgOptimizedImage } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterContentChecked, Component, Input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styles: [],
  imports: [CardComponent, NgOptimizedImage, DragDropModule],
})
export class ColumnComponent implements AfterContentChecked {
  private readonly boardColumns = ['Todo', 'In progress', 'Done'];
  @Input() column_name = 'Undefined column name';
  cards: {
    id: number;
    title: string;
    description: string;
    priority: string;
    column_name: string;
    is_editable: boolean;
  }[] = [];

  ngAfterContentChecked(): void {
    this.loadCards();
  }

  loadCards(): void {
    const columnStoredCards = localStorage.getItem(this.column_name);
    this.cards = columnStoredCards ? JSON.parse(columnStoredCards) : [];
  }

  saveCards(): void {
    localStorage.setItem(this.column_name, JSON.stringify(this.cards));
    this.loadCards();
  }

  addCard(): void {
    const newId = this.cards.length
      ? Math.max(...this.cards.map((item) => item.id)) + 1
      : 1;

    this.cards.push({
      id: newId,
      title: 'New Title',
      description: 'New Description',
      column_name: this.column_name,
      is_editable: false,
      priority: 'low',
    });
    this.saveCards();
  }

  removeCard(id: number): void {
    this.cards = this.cards.filter((item) => item.id !== id);
    this.saveCards();
  }

  updateCard(item: {
    id: number;
    title: string;
    description: string;
    is_editable: boolean;
    column_name: string;
    priority: string;
  }): void {
    const index = this.cards.findIndex((i) => i.id === item.id);

    if (index === -1)
      return console.error('The card you are trying to update does not exist.');

    this.cards[index] = { ...item };
    this.saveCards();
  }

  drop(event: CdkDragDrop<
    {
      id: number;
      title: string;
      description: string;
      priority: string;
      column_name: string;
      is_editable: boolean;
    }[]
  >): void {
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

    const previousColumnName = this.getColumnNameFromDropListId(
      event.previousContainer.id,
    );

    if (previousColumnName) {
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

  private persistColumn(
    columnName: string,
    cards: {
      id: number;
      title: string;
      description: string;
      priority: string;
      column_name: string;
      is_editable: boolean;
    }[],
  ): void {
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
}
