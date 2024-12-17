import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styles: [],
})
export class CardComponent {
  @Input() id: number = 0;
  @Input() title = '';
  @Input() content = '';
  @Input() lock_state = false;

  @Output() delete = new EventEmitter<number>();
  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    content: string;
  }>();

  changeLockState() {
    this.lock_state = !this.lock_state;
    this.updateInputsByLockState();
  }

  updateInputsByLockState() {
    const titleElement = document.getElementById(`title-${this.id}`);
    const contentElement = document.getElementById(`content-${this.id}`);
    if (this.lock_state) {
      titleElement?.setAttribute('contenteditable', 'false');
      contentElement?.setAttribute('contenteditable', 'false');
    } else {
      titleElement?.setAttribute('contenteditable', 'true');
      contentElement?.setAttribute('contenteditable', 'true');
    }
  }

  deleteItem() {
    this.delete.emit(this.id);
  }

  saveItem() {
    const titleElement = document.getElementById(`title-${this.id}`);
    const contentElement = document.getElementById(`content-${this.id}`);

    this.title = titleElement?.textContent ?? '';
    this.content = contentElement?.textContent ?? '';

    this.save.emit({
      id: this.id,
      title: this.title,
      content: this.content,
    });
  }
}
