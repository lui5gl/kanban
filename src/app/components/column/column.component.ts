import { Component, Input, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styles: [],
  imports: [CardComponent],
})
export class ColumnComponent implements OnInit {
  @Input() column_name = 'Default column name';
  cards: {
    id: number;
    title: string;
    description: string;
    lock_state: boolean;
    created_at: string;
  }[] = [];

  ngOnInit(): void {
    const storedCards = localStorage.getItem(this.column_name);
    if (storedCards) {
      this.cards = JSON.parse(storedCards);
    }
  }

  addCard(): void {
    const newTitle = 'New Title';
    const newDescription = 'New Description';
    let createdAt = new Date();

    if (newTitle && newDescription) {
      const newId = this.cards.length
        ? Math.max(...this.cards.map((item) => item.id)) + 1
        : 1;
      this.cards.push({
        id: newId,
        title: newTitle,
        description: newDescription,
        lock_state: false,
        created_at: `${createdAt.getFullYear()}/${createdAt.getMonth()}/${createdAt.getDay()}`,
      });
      this.saveCards();
    }
  }

  removeCard(id: number): void {
    this.cards = this.cards.filter((item) => item.id !== id);
    this.saveCards();
  }

  updateCard(item: {
    id: number;
    title: string;
    description: string;
    lock_state: boolean;
  }): void {
    const index = this.cards.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.cards[index].title = item.title;
      this.cards[index].description = item.description;
      this.cards[index].lock_state = item.lock_state;
      this.saveCards();
    }
  }

  saveCards(): void {
    localStorage.setItem(this.column_name, JSON.stringify(this.cards));
  }
}
