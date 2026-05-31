import { Component, Input } from "@angular/core";
import { BoardStats } from "../../models/card.model";

@Component({
  selector: "app-board-footer",
  standalone: true,
  imports: [],
  templateUrl: "./board-footer.component.html",
})
export class BoardFooterComponent {
  @Input() stats: BoardStats = {
    totalCards: 0,
    cardsByColumn: {},
    cardsByPriority: { low: 0, medium: 0, high: 0 },
    overdueCards: 0,
    completedCards: 0,
    archivedCards: 0,
  };
}
