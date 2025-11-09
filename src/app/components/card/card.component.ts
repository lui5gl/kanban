import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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

  constructor(private dialog: Dialog) {}

  async deleteCard() {
    const confirmed = await this.openConfirmDialog({
      title: 'Eliminar tarjeta',
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });

    if (confirmed) this.delete.emit(this.id);
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

  async toggleArchiveState() {
    const confirmed = await this.openConfirmDialog({
      title: this.is_archived ? 'Desarchivar tarjeta' : 'Archivar tarjeta',
      description: this.is_archived
        ? 'La tarjeta volverá a estar visible y editable.'
        : 'La tarjeta se ocultará en la sección de archivadas.',
      confirmLabel: this.is_archived ? 'Desarchivar' : 'Archivar',
    });

    if (!confirmed) return;

    this.is_archived = !this.is_archived;
    this.saveCard();
  }

  getElementId(field: 'title' | 'description' | 'priority'): string {
    return `${this.columnIdPrefix}-${field}-${this.id}`;
  }

  private get columnIdPrefix(): string {
    return this.column_name.toLowerCase().replace(/\s+/g, '-');
  }

  private async openConfirmDialog(data: {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data,
      disableClose: true,
      panelClass: 'app-dialog-panel',
      backdropClass: 'app-dialog-backdrop',
    });

    return !!(await firstValueFrom(dialogRef.closed));
  }
}
