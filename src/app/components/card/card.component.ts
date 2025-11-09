import { NgOptimizedImage } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [NgOptimizedImage, CdkDrag, CdkDragHandle],
})
export class CardComponent implements OnInit {
  @Input() id: number = 0;
  @Input() title: string = 'Undefined Title';
  @Input() description: string = 'Undefined description';
  @Input() priority: string = 'low';
  @Input() column_name: string = 'Undefined column name';
  @Input() is_editable: boolean = false;

  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    is_editable: boolean;
    column_name: string;
    priority: string;
  }>();
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {
    this.loadLockState();
  }

  loadLockState() {
    let titleElement = document.getElementById(this.getElementId('title'));
    let descriptionElement = document.getElementById(
      this.getElementId('description'),
    );

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
      this.getElementId('title'),
    ) as HTMLElement;
    let descriptionElement = document.getElementById(
      this.getElementId('description'),
    ) as HTMLElement;
    let priorityElement = document.getElementById(
      this.getElementId('priority'),
    ) as HTMLSelectElement;

    this.save.emit({
      id: this.id,
      title: titleElement.innerText,
      description: descriptionElement.innerText,
      is_editable: this.is_editable,
      column_name: this.column_name,
      priority: priorityElement.value,
    });
  }

  getElementId(field: 'title' | 'description' | 'priority'): string {
    return `${this.columnIdPrefix}-${field}-${this.id}`;
  }

  private get columnIdPrefix(): string {
    return this.column_name.toLowerCase().replace(/\s+/g, '-');
  }
}
