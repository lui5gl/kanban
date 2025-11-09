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
  @Input() title: string = 'Titulo sin definir';
  @Input() description: string = 'Descripcion sin definir';
  @Input() priority: string = 'low';
  @Input() column_name: string = 'Columna sin nombre';
  @Input() is_editable: boolean = false;
  @Input() is_archived: boolean = false;

  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    is_editable: boolean;
    column_name: string;
    priority: string;
    is_archived: boolean;
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

    const contentEditable =
      this.is_archived || !this.is_editable ? 'false' : 'true';
    titleElement?.setAttribute('contenteditable', contentEditable);
    descriptionElement?.setAttribute('contenteditable', contentEditable);
  }

  toggleLockState() {
    if (this.is_archived) return;

    this.is_editable = !this.is_editable;
    this.saveCard();
    this.loadLockState();
  }

  deleteCard() {
    if (confirm('Estas seguro de eliminar esta tarjeta?'))
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
      title: titleElement?.innerText ?? this.title,
      description: descriptionElement?.innerText ?? this.description,
      is_editable: this.is_editable,
      column_name: this.column_name,
      priority: priorityElement?.value ?? this.priority,
      is_archived: this.is_archived,
    });
  }

  toggleArchiveState() {
    this.is_archived = !this.is_archived;
    if (this.is_archived && this.is_editable) {
      this.is_editable = false;
    }
    this.loadLockState();
    this.saveCard();
  }

  getElementId(field: 'title' | 'description' | 'priority'): string {
    return `${this.columnIdPrefix}-${field}-${this.id}`;
  }

  private get columnIdPrefix(): string {
    return this.column_name.toLowerCase().replace(/\s+/g, '-');
  }
}
