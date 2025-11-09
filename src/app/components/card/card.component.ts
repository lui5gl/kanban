import { DatePipe, NgOptimizedImage } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [NgOptimizedImage, CdkDrag, CdkDragHandle, DatePipe],
})
export class CardComponent {
  @Input() id: number = 0;
  @Input() title: string = 'Titulo sin definir';
  @Input() description: string = 'Descripcion sin definir';
  @Input() priority: string = 'low';
  @Input() column_name: string = 'Columna sin nombre';
  @Input() is_archived: boolean = false;
  @Input() createdAt: string = new Date().toISOString();
  @Input() updatedAt: string = new Date().toISOString();

  @Output() save = new EventEmitter<{
    id: number;
    title: string;
    description: string;
    column_name: string;
    priority: string;
    is_archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>();
  @Output() delete = new EventEmitter<number>();

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

    this.updatedAt = new Date().toISOString();

    this.save.emit({
      id: this.id,
      title: titleElement?.innerText ?? this.title,
      description: descriptionElement?.innerText ?? this.description,
      column_name: this.column_name,
      priority: priorityElement?.value ?? this.priority,
      is_archived: this.is_archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  toggleArchiveState() {
    this.is_archived = !this.is_archived;
    this.saveCard();
  }

  getElementId(field: 'title' | 'description' | 'priority'): string {
    return `${this.columnIdPrefix}-${field}-${this.id}`;
  }

  private get columnIdPrefix(): string {
    return this.column_name.toLowerCase().replace(/\s+/g, '-');
  }
}
