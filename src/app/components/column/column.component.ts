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
    created_at: string;
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

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    this.cards.push({
      id: newId,
      title: 'New Title',
      description: 'New Description',
      is_editable: false,
      priority: 'low',
      ends_at: today.toISOString(),
      created_at: `${year}/${month}/${day}`,
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

    this.cards[index].title = item.title;
    this.cards[index].description = item.description;
    this.cards[index].priority = item.priority;
    this.cards[index].ends_at = item.ends_at;
    this.cards[index].is_editable = item.is_editable;
    this.saveCards();
  }

  saveCards(): void {
    localStorage.setItem(this.column_name, JSON.stringify(this.cards));
  }
}
