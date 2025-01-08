import { Component, Input, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styles: [],
  imports: [CardComponent],
})
export class ColumnComponent implements OnInit {
  @Input() column_name = 'Undefined column name';
  cards: {
    id: number;
    title: string;
    description: string;
    priority: string;
    ends_at: string;
    is_editable: boolean;
  }[] = [];

  ngOnInit(): void {
    const columnStoredCards = localStorage.getItem(this.column_name);
    this.cards = columnStoredCards ? JSON.parse(columnStoredCards) : [];
  }

  addCard(): void {
    const newId = this.cards.length
      ? Math.max(...this.cards.map((item) => item.id)) + 1
      : 1;

    const today = new Date();

    this.cards.push({
      id: newId,
      title: 'New Title',
      description: 'New Description',
      is_editable: false,
      priority: 'low',
      ends_at: today.toISOString().split('T')[0],
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
    ends_at: string;
    is_editable: boolean;
    priority: string;
  }): void {
    const index = this.cards.findIndex((i) => i.id === item.id);

    if (index === -1)
      return console.error('The card you are trying to update does not exist.');

    this.cards[index] = { ...item };
    this.saveCards();
  }

  saveCards(): void {
    localStorage.setItem(this.column_name, JSON.stringify(this.cards));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const id = parseInt(event.dataTransfer?.getData('text/plain') || '', 10);

    const cardIndex = this.cards.findIndex((card) => card.id === id);
    if (cardIndex !== -1) {
      return;
    }

    const allColumns = ['Todo', 'In progress', 'Done'];
    let cardToMove: any = null;

    allColumns.forEach((columnName) => {
      if (columnName !== this.column_name) {
        const columnCards = JSON.parse(
          localStorage.getItem(columnName) || '[]',
        );
        const card = columnCards.find((item: any) => item.id === id);

        if (card) {
          cardToMove = card;

          const updatedCards = columnCards.filter(
            (item: any) => item.id !== id,
          );
          localStorage.setItem(columnName, JSON.stringify(updatedCards));
        }
      }
    });

    if (cardToMove) {
      this.cards.push(cardToMove);
      this.saveCards();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}
