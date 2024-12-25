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
  @Input() is_editable: boolean = false;

  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    is_editable: boolean;
  }>();
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {
    this.loadLockState();
  }

  loadLockState() {
    let titleElement = document.getElementById(`title-${this.id}`);
    let descriptionElement = document.getElementById(`description-${this.id}`);

    const contentEditable = this.is_editable ? 'false' : 'true';
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
    let titleElement = document.getElementById(`title-${this.id}`);
    let descriptionElement = document.getElementById(`description-${this.id}`);

    this.save.emit({
      id: this.id,
      title: titleElement?.textContent ?? this.title,
      description: descriptionElement?.textContent ?? this.description,
      is_editable: this.is_editable,
    });
  }
}
