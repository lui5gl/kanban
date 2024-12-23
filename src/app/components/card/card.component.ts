import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styles: [],
})
export class CardComponent implements OnInit {
  @Input() id: number = 0;
  @Input() title: string = 'Undefined Title';
  @Input() description: string = 'Undefined description';
  @Input() created_at: string = 'Undefined';
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
    let titleElement = document.getElementById(`title-${this.id}`);
    let descriptionElement = document.getElementById(`description-${this.id}`);

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
    this.saveCard();
    this.loadLockState();
  }

  deleteCard() {
    let confirm = window.confirm('Are you sure you want to delete this item?');
    if (confirm) this.delete.emit(this.id);
  }

  saveCard() {
    let titleElement = document.getElementById(`title-${this.id}`);
    let descriptionElement = document.getElementById(`description-${this.id}`);

    this.save.emit({
      id: this.id,
      title: titleElement?.textContent ?? '',
      description: descriptionElement?.textContent ?? '',
      lock_state: this.lock_state,
    });
  }
}
