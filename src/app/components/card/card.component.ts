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
  @Input() priority: string = 'low';
  @Input() ends_at: string = new Date().toISOString();
  @Input() created_at: string = 'Undefined';
  @Input() is_editable: boolean = false;

  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    ends_at: string;
    is_editable: boolean;
    priority: string;
  }>();
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {
    this.loadLockState();
  }

  loadLockState() {
    let titleElement = document.getElementById(`title-${this.id}`);
    let descriptionElement = document.getElementById(`description-${this.id}`);

    const contentEditable = this.is_editable ? 'true' : 'false';
    titleElement?.setAttribute('contenteditable', contentEditable);
    descriptionElement?.setAttribute('contenteditable', contentEditable);
  }

  toggleLockState() {
    this.is_editable = !this.is_editable;
    this.saveCard();
    this.loadLockState();
  }

  deleteCard() {
    if (confirm('Are you sure you want to delete this item?'))
      this.delete.emit(this.id);
  }

  saveCard() {
    let titleElement = document.getElementById(
      `title-${this.id}`,
    ) as HTMLElement;
    let descriptionElement = document.getElementById(`description-${this.id}`);
    let priorityElement = document.getElementById(
      `priority-${this.id}`,
    ) as HTMLSelectElement;
    let endsAtElement = document.getElementById(
      `ends-at-${this.id}`,
    ) as HTMLInputElement;

    this.save.emit({
      id: this.id,
      title: titleElement?.textContent ?? this.title,
      description: descriptionElement?.textContent ?? this.description,
      priority: priorityElement.value,
      ends_at: endsAtElement.value,
      is_editable: this.is_editable,
    });
  }
}
