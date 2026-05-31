import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import {
  AfterContentChecked,
  Component,
  Input,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Subscription } from "rxjs";
import { ButtonModule } from "primeng/button";
import { SortDirection, SortOption } from "../../types/sort-option";
import { CardComponent } from "../card/card.component";
import { BoardService } from "../../services/board.service";
import { Card as CardModel, COLUMNS } from "../../models/card.model";

type ColumnCard = CardModel;

@Component({
  selector: "app-column",
  templateUrl: "./column.component.html",
  imports: [CardComponent, DragDropModule, ButtonModule],
})
export class ColumnComponent implements AfterContentChecked, OnInit, OnDestroy {
  private _sortOption: SortOption = "createdAt";
  private _sortDirection: SortDirection = "asc";
  private filtersSubscription?: Subscription;

  @Input() column_name = "Columna sin nombre";
  @Input()
  set sortOption(value: SortOption) {
    if (this._sortOption === value) return;
    this._sortOption = value;
    this.cards = this.arrangeCards(this.cards);
  }
  get sortOption(): SortOption {
    return this._sortOption;
  }
  @Input()
  set sortDirection(value: SortDirection) {
    if (this._sortDirection === value) return;
    this._sortDirection = value;
    this.cards = this.arrangeCards(this.cards);
  }
  get sortDirection(): SortDirection {
    return this._sortDirection;
  }

  allCards: ColumnCard[] = [];
  cards: ColumnCard[] = [];

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.filtersSubscription = this.boardService.filters$.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.filtersSubscription?.unsubscribe();
  }

  ngAfterContentChecked(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.allCards = this.boardService.getCards(this.column_name);
    this.applyFilters();
  }

  applyFilters(): void {
    this.cards = this.arrangeCards(
      this.boardService.filterCards(this.allCards),
    );
  }

  saveCards(): void {
    this.boardService.saveCards(this.column_name, this.allCards);
    this.loadCards();
  }

  addCard(): void {
    const newId = this.allCards.length
      ? Math.max(...this.allCards.map((item) => item.id)) + 1
      : 1;
    const timestamp = new Date().toISOString();

    this.allCards = [
      ...this.allCards,
      {
        id: newId,
        title: "Nuevo titulo",
        description: "Nueva descripcion",
        column_name: this.column_name,
        priority: "low",
        is_archived: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        dueDate: null,
      },
    ];
    this.saveCards();
  }

  removeCard(id: number): void {
    this.allCards = this.allCards.filter((item) => item.id !== id);
    this.saveCards();
  }

  updateCard(item: ColumnCard): void {
    this.allCards = this.allCards.map((c) =>
      c.id === item.id ? { ...item } : c,
    );
    this.saveCards();
  }

  drop(event: CdkDragDrop<ColumnCard[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
      this.cards = this.arrangeCards(this.cards);
      this.saveCards();
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const movedCard = event.container.data[event.currentIndex];
    movedCard.column_name = this.column_name;
    movedCard.updatedAt = new Date().toISOString();
    this.cards = this.arrangeCards([...event.container.data]);

    const previousColumnName = this.getColumnNameFromDropListId(
      event.previousContainer.id,
    );

    if (previousColumnName) {
      const previousCards = this.arrangeCards([
        ...event.previousContainer.data,
      ]);
      this.persistColumn(previousColumnName, previousCards);
    }

    this.saveCards();
  }

  get dropListId(): string {
    return this.toDropListId(this.column_name);
  }

  get connectedDropLists(): string[] {
    return COLUMNS.filter((column) => column !== this.column_name).map(
      (column) => this.toDropListId(column),
    );
  }

  private persistColumn(columnName: string, cards: ColumnCard[]): void {
    this.boardService.saveCards(columnName, cards);
  }

  private toDropListId(columnName: string): string {
    return `drop-list-${columnName.toLowerCase().replace(/\s+/g, "-")}`;
  }

  private getColumnNameFromDropListId(id: string): string | undefined {
    return COLUMNS.find((column) => this.toDropListId(column) === id);
  }

  private arrangeCards(cards: ColumnCard[]): ColumnCard[] {
    if (!cards.length) return cards;
    const comparator = this.getComparator();
    const active = cards.filter((c) => !c.is_archived).sort(comparator);
    const archived = cards.filter((c) => c.is_archived).sort(comparator);
    return [...active, ...archived];
  }

  private getComparator(): (a: ColumnCard, b: ColumnCard) => number {
    const directionFactor = this._sortDirection === "asc" ? 1 : -1;
    return (a, b) => {
      let comparison = 0;
      switch (this._sortOption) {
        case "title":
          comparison = a.title.localeCompare(b.title, "es", {
            sensitivity: "base",
          });
          break;
        case "priority":
          comparison =
            this.priorityWeight(a.priority) - this.priorityWeight(b.priority);
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "createdAt":
        default:
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return comparison * directionFactor;
    };
  }

  private priorityWeight(priority: string): number {
    const order: Record<string, number> = { low: 1, medium: 2, high: 3 };
    return order[priority] ?? 99;
  }
}
