import { Component, Input, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styles: [],
  imports: [CardComponent],
})
export class ListComponent implements OnInit {
  @Input() title = 'Undefined title';
  items: {
    id: number;
    title: string;
    description: string;
    lock_state: boolean;
    created_at: string;
  }[] = [];

  ngOnInit(): void {
    const storedItems = localStorage.getItem(this.title);
    if (storedItems) {
      this.items = JSON.parse(storedItems);
    }
  }

  addItem(): void {
    const newTitle = 'New Title';
    const newDescription = 'New Description';
    let createdAt = new Date();

    if (newTitle && newDescription) {
      const newId = this.items.length
        ? Math.max(...this.items.map((item) => item.id)) + 1
        : 1;
      this.items.push({
        id: newId,
        title: newTitle,
        description: newDescription,
        lock_state: false,
        created_at: `${createdAt.getFullYear()}/${createdAt.getMonth()}/${createdAt.getDay()}`,
      });
      this.saveItems();
    }
  }

  removeItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveItems();
  }

  saveItem(item: {
    id: number;
    title: string;
    description: string;
    lock_state: boolean;
  }): void {
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.items[index].title = item.title;
      this.items[index].description = item.description;
      this.items[index].lock_state = item.lock_state;
      this.saveItems();
    }
  }

  saveItems(): void {
    localStorage.setItem(this.title, JSON.stringify(this.items));
  }
}
