import { DialogModule, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';

interface ConfirmDialogData {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="flex w-80 flex-col gap-4 p-4 text-slate-700">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">{{ data.title }}</h2>
        <p class="mt-1 text-sm text-slate-600">
          {{ data.description }}
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          (click)="dialogRef.close(false)"
        >
          {{ data.cancelLabel || 'Cancelar' }}
        </button>
        <button
          type="button"
          class="rounded-sm bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500"
          (click)="dialogRef.close(true)"
        >
          {{ data.confirmLabel || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  imports: [DialogModule],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmDialogData,
  ) {}
}
