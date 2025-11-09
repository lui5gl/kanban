import { DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [NgOptimizedImage, CdkDrag, CdkDragHandle, DatePipe, NgIf],
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
  isActionMenuOpen = false;

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

  @HostListener('document:click')
  closeMenu() {
    this.isActionMenuOpen = false;
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isActionMenuOpen = !this.isActionMenuOpen;
  }

  async deleteCard(event?: MouseEvent) {
    event?.stopPropagation();
    const confirmed = await this.openConfirmDialog({
      title: 'Eliminar tarjeta',
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });

    this.isActionMenuOpen = false;

    if (confirmed) this.delete.emit(this.id);
  }

  saveCard(forceUpdate = false) {
    let titleElement = document.getElementById(
      this.getElementId('title'),
    ) as HTMLElement;
    let descriptionElement = document.getElementById(
      this.getElementId('description'),
    ) as HTMLElement;
    let priorityElement = document.getElementById(
      this.getElementId('priority'),
    ) as HTMLSelectElement;

    const newTitle = titleElement?.innerText ?? this.title;
    const newDescription = descriptionElement?.innerText ?? this.description;
    const newPriority = priorityElement?.value ?? this.priority;

    const hasContentChange =
      newTitle !== this.title ||
      newDescription !== this.description ||
      newPriority !== this.priority;

    if (!forceUpdate && !hasContentChange) return;

    this.title = newTitle;
    this.description = newDescription;
    this.priority = newPriority;

    if (hasContentChange || forceUpdate) {
      this.updatedAt = new Date().toISOString();
    }

    this.save.emit({
      id: this.id,
      title: this.title,
      description: this.description,
      column_name: this.column_name,
      priority: this.priority,
      is_archived: this.is_archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  async toggleArchiveState(event?: MouseEvent) {
    event?.stopPropagation();
    const confirmed = await this.openConfirmDialog({
      title: this.is_archived ? 'Desarchivar tarjeta' : 'Archivar tarjeta',
      description: this.is_archived
        ? 'La tarjeta volverá a estar visible y editable.'
        : 'La tarjeta se ocultará en la sección de archivadas.',
      confirmLabel: this.is_archived ? 'Desarchivar' : 'Archivar',
    });

    if (!confirmed) return;

    this.isActionMenuOpen = false;
    this.is_archived = !this.is_archived;
    this.saveCard(true);
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
