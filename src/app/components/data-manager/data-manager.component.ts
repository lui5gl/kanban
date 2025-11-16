import { Component } from '@angular/core';
import { NgOptimizedImage, NgIf } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { BoardService } from '../../services/board.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-data-manager',
  standalone: true,
  templateUrl: './data-manager.component.html',
  imports: [NgOptimizedImage, NgIf],
})
export class DataManagerComponent {
  isExpanded = false;

  constructor(
    private boardService: BoardService,
    private dialog: Dialog
  ) {}

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  exportData(): void {
    this.boardService.downloadJSON();
  }

  async importData(): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      const confirmed = await this.openConfirmDialog({
        title: 'Importar datos',
        description: 'Esto reemplazará todos los datos actuales. ¿Deseas continuar?',
        confirmLabel: 'Importar',
      });

      if (!confirmed) return;

      const success = await this.boardService.importFromFile(file);

      if (success) {
        alert('Datos importados correctamente. Recarga la página para ver los cambios.');
        window.location.reload();
      } else {
        alert('Error al importar datos. Verifica que el archivo sea válido.');
      }
    };

    input.click();
  }

  async clearAllData(): Promise<void> {
    const confirmed = await this.openConfirmDialog({
      title: 'Eliminar todos los datos',
      description: 'Esta acción eliminará todas las tarjetas del tablero. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar todo',
    });

    if (!confirmed) return;

    this.boardService.clearAllData();
    alert('Todos los datos han sido eliminados. Recargando página...');
    window.location.reload();
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
