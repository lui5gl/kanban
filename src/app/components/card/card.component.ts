import { AsyncPipe, DatePipe } from "@angular/common";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { ButtonModule } from "primeng/button";
import { ConfirmationService } from "primeng/api";
import { DateToggleService } from "../../services/date-toggle.service";
import { Card as CardModel } from "../../models/card.model";

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
    ButtonModule,
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

  @Output() save = new EventEmitter<CardModel>();
  @Output() delete = new EventEmitter<number>();

  private readonly confirmationService = inject(ConfirmationService);
  readonly dateToggle = inject(DateToggleService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["dueDate"]) {
      const val = changes["dueDate"].currentValue;
      this.dueDateObj = val ? this.parseISODate(val) : null;
    }
  }

  @HostListener("document:click")
  closeMenu(): void {
    this.isActionMenuOpen = false;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isActionMenuOpen = !this.isActionMenuOpen;
  }

  deleteCard(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isActionMenuOpen = false;

    this.confirmationService.confirm({
      header: "Eliminar tarjeta",
      message: "Esta acción no se puede deshacer.",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => this.delete.emit(this.id),
    });
  }

  saveCard(forceUpdate = false): void {
    const titleElement = document.getElementById(
      this.getElementId("title"),
    ) as HTMLElement;
    const descriptionElement = document.getElementById(
      this.getElementId("description"),
    ) as HTMLElement;

    const newTitle = titleElement?.innerText ?? this.title;
    const newDescription = descriptionElement?.innerText ?? this.description;

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

  toggleArchiveState(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isActionMenuOpen = false;

    const isArchiving = !this.is_archived;

    this.confirmationService.confirm({
      header: isArchiving ? "Archivar tarjeta" : "Desarchivar tarjeta",
      message: isArchiving
        ? "La tarjeta se ocultará en la sección de archivadas."
        : "La tarjeta volverá a estar visible y editable.",
      acceptLabel: isArchiving ? "Archivar" : "Desarchivar",
      rejectLabel: "Cancelar",
      accept: () => {
        this.is_archived = !this.is_archived;
        this.saveCard(true);
      },
    });
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

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < now.getTime();
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
}
