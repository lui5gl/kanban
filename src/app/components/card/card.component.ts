import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styles: [],
})
export class CardComponent implements OnInit {
  @Input() id: number = 0;
  @Input() title: string = 'Default Title';
  @Input() description: string = 'Default description';
  @Input() created_at: string = '0000/00/00';
  @Input() lock_state: boolean = false;

  @Output() delete = new EventEmitter<number>();
  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    lock_state: boolean;
  }>();

  ngOnInit(): void {
    this.loadLockState();
  }

  loadLockState() {
    const titleElement = document.getElementById(`title-${this.id}`);
    const descriptionElement = document.getElementById(
      `description-${this.id}`
    );

    if (this.lock_state) {
      titleElement?.setAttribute('contenteditable', 'false');
      descriptionElement?.setAttribute('contenteditable', 'false');
    } else {
      titleElement?.setAttribute('contenteditable', 'true');
      descriptionElement?.setAttribute('contenteditable', 'true');
    }
  }

  toggleLockState() {
    this.lock_state = !this.lock_state;
    this.saveItem();
    this.loadLockState();
  }

  deleteItem() {
    let confirm = window.confirm('Are you sure you want to delete this item?');
    if (confirm) this.delete.emit(this.id);
  }

  saveItem() {
    const titleElement = document.getElementById(`title-${this.id}`);
    const descriptionElement = document.getElementById(
      `description-${this.id}`
    );

    this.title = titleElement?.textContent ?? '';
    this.description = descriptionElement?.textContent ?? '';

    this.save.emit({
      id: this.id,
      title: this.title,
      description: this.description,
      lock_state: this.lock_state,
    });
  }
}
