import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgOptimizedImage, NgIf, KeyValuePipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { BoardService } from '../../services/board.service';
import { BoardStats } from '../../models/card.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.component.html',
  imports: [NgOptimizedImage, NgIf, KeyValuePipe],
})
export class StatsComponent implements OnInit, OnDestroy {
  stats: BoardStats = {
    totalCards: 0,
    cardsByColumn: {},
    cardsByPriority: { low: 0, medium: 0, high: 0 },
    overdueCards: 0,
    completedCards: 0,
    archivedCards: 0,
  };

  isExpanded = false;
  private refreshSubscription?: Subscription;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.updateStats();
    // Actualizar estadísticas cada 5 segundos
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.updateStats();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  updateStats(): void {
    this.stats = this.boardService.getStats();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get completionPercentage(): number {
    if (this.stats.totalCards === 0) return 0;
    return Math.round((this.stats.completedCards / this.stats.totalCards) * 100);
  }

  get activeCards(): number {
    return this.stats.totalCards - this.stats.archivedCards;
  }
}
