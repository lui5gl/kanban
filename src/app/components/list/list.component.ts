import { NgForOf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styles: [],
  imports: [NgForOf, CardComponent],
})
export class ListComponent implements OnInit {
  @Input() title = '';
  items: { id: number; title: string; description: string }[] = [];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    const storedItems = localStorage.getItem(this.title);
    if (storedItems) {
      this.items = JSON.parse(storedItems);
    }
  }

  addItem(): void {
    let newTitle = 'Nuevo Título';
    let newDescription = 'Nueva Descripción';

    if (newTitle && newDescription) {
      const newId = this.items.length
        ? Math.max(...this.items.map((item) => item.id)) + 1
        : 1;
      this.items.push({
        id: newId,
        title: newTitle,
        description: newDescription,
      });
      this.saveItems();
    }
  }

  removeItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveItems();
  }

  saveItem(item: { id: number; title: string; description: string }): void {
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.items[index].title = item.title;
      this.items[index].description = item.description;
      this.saveItems();
    }
  }

  saveItems(): void {
    localStorage.setItem(this.title, JSON.stringify(this.items));
  }
}
