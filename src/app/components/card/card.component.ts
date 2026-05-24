import { AsyncPipe, DatePipe } from "@angular/common";
import { Dialog } from "@angular/cdk/dialog";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { firstValueFrom } from "rxjs";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { DateToggleService } from "../../services/date-toggle.service";
import { Card } from "../../models/card.model";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  imports: [
    CdkDrag,
    CdkDragHandle,
    AsyncPipe,
    DatePipe,
    FormsModule,
    Select,
    DatePicker,
  ],
})
export class CardComponent implements OnChanges {
  @Input() id: number = 0;
  @Input() title: string = "Titulo sin definir";
  @Input() description: string = "Descripcion sin definir";
  @Input() priority: "low" | "medium" | "high" = "low";
  @Input() column_name: string = "Columna sin nombre";
  @Input() is_archived: boolean = false;
  @Input() createdAt: string = new Date().toISOString();
  @Input() updatedAt: string = new Date().toISOString();
  @Input() dueDate: string | null = null;
  dueDateObj: Date | null = null;

  readonly priorityOptions = [
    { label: "Baja", value: "low" },
    { label: "Media", value: "medium" },
    { label: "Alta", value: "high" },
  ];

  isActionMenuOpen = false;

  @Output() save = new EventEmitter<Card>();
  @Output() delete = new EventEmitter<number>();

  constructor(
    private dialog: Dialog,
    readonly dateToggle: DateToggleService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["dueDate"]) {
      const val = changes["dueDate"].currentValue;
      this.dueDateObj = val ? this.parseISODate(val) : null;
    }
  }

  @HostListener("document:click")
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
      title: "Eliminar tarjeta",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
    });

    this.isActionMenuOpen = false;

    if (confirmed) this.delete.emit(this.id);
  }

  saveCard(forceUpdate = false) {
    const titleElement = document.getElementById(
      this.getElementId("title"),
    ) as HTMLElement;
    const descriptionElement = document.getElementById(
      this.getElementId("description"),
    ) as HTMLElement;

    const newTitle = titleElement?.innerText ?? this.title;
    const newDescription = descriptionElement?.innerText ?? this.description;

    // Sync date from picker back to string
    this.syncDueDateFromPicker();

    const titleChanged = newTitle !== this.title;
    const descChanged = newDescription !== this.description;

    if (!forceUpdate && !titleChanged && !descChanged) return;

    this.title = newTitle;
    this.description = newDescription;

    if (titleChanged || descChanged || forceUpdate) {
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
      dueDate: this.dueDate,
    });
  }

  async toggleArchiveState(event?: MouseEvent) {
    event?.stopPropagation();
    const confirmed = await this.openConfirmDialog({
      title: this.is_archived ? "Desarchivar tarjeta" : "Archivar tarjeta",
      description: this.is_archived
        ? "La tarjeta volverá a estar visible y editable."
        : "La tarjeta se ocultará en la sección de archivadas.",
      confirmLabel: this.is_archived ? "Desarchivar" : "Archivar",
    });

    if (!confirmed) return;

    this.isActionMenuOpen = false;
    this.is_archived = !this.is_archived;
    this.saveCard(true);
  }

  private parseISODate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  private syncDueDateFromPicker(): void {
    if (this.dueDateObj) {
      const y = this.dueDateObj.getFullYear();
      const m = String(this.dueDateObj.getMonth() + 1).padStart(2, "0");
      const d = String(this.dueDateObj.getDate()).padStart(2, "0");
      this.dueDate = `${y}-${m}-${d}`;
    } else {
      this.dueDate = null;
    }
  }

  getElementId(field: "title" | "description"): string {
    return `${this.columnIdPrefix}-${field}-${this.id}`;
  }

  private get columnIdPrefix(): string {
    return this.column_name.toLowerCase().replace(/\s+/g, "-");
  }

  get daysUntilDue(): string {
    if (!this.dueDate) return "Sin fecha";
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return `${diffDays} días restantes`;
    if (diffDays === 1) return "1 día restante";
    if (diffDays === 0) return "Entrega hoy";
    return `Atrasado por ${Math.abs(diffDays)} días`;
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
      panelClass: "app-dialog-panel",
      backdropClass: "app-dialog-backdrop",
    });

    return !!(await firstValueFrom(dialogRef.closed));
  }
}
