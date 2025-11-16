import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Card, BoardFilters, BoardStats, BoardData } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly STORAGE_PREFIX = '';
  private readonly BOARD_COLUMNS = ['Por hacer', 'En progreso', 'Hecho'];

  private filtersSubject = new BehaviorSubject<BoardFilters>({
    searchTerm: '',
    priorities: [],
    showArchived: false,
    dueDateFilter: 'all',
  });

  public filters$: Observable<BoardFilters> = this.filtersSubject.asObservable();

  constructor() {}

  // Gestión de tarjetas
  getCards(columnName: string): Card[] {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${columnName}`);
    if (!stored) return [];

    const cards = JSON.parse(stored) as Card[];
    return cards.map(card => this.normalizeCard(card));
  }

  saveCards(columnName: string, cards: Card[]): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}${columnName}`, JSON.stringify(cards));
  }

  getAllCards(): Card[] {
    return this.BOARD_COLUMNS.flatMap(column => this.getCards(column));
  }

  private normalizeCard(card: Card): Card {
    const fallback = card.createdAt ?? card.updatedAt ?? new Date().toISOString();
    return {
      ...card,
      is_archived: card.is_archived ?? false,
      createdAt: card.createdAt ?? fallback,
      updatedAt: card.updatedAt ?? fallback,
      dueDate: card.dueDate ?? null,
    };
  }

  // Filtros
  setFilters(filters: Partial<BoardFilters>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.value,
      ...filters,
    });
  }

  getFilters(): BoardFilters {
    return this.filtersSubject.value;
  }

  resetFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      priorities: [],
      showArchived: false,
      dueDateFilter: 'all',
    });
  }

  filterCards(cards: Card[]): Card[] {
    const filters = this.filtersSubject.value;
    let filtered = [...cards];

    // Filtrar archivadas
    if (!filters.showArchived) {
      filtered = filtered.filter(card => !card.is_archived);
    }

    // Filtrar por búsqueda
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchLower) ||
        card.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por prioridad
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(card =>
        filters.priorities.includes(card.priority)
      );
    }

    // Filtrar por fecha de vencimiento
    if (filters.dueDateFilter !== 'all') {
      filtered = this.filterByDueDate(filtered, filters.dueDateFilter);
    }

    return filtered;
  }

  private filterByDueDate(cards: Card[], filter: string): Card[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return cards.filter(card => {
      if (filter === 'none') {
        return !card.dueDate;
      }

      if (!card.dueDate) return false;

      const dueDate = new Date(card.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filter) {
        case 'overdue':
          return diffDays < 0;
        case 'today':
          return diffDays === 0;
        case 'week':
          return diffDays >= 0 && diffDays <= 7;
        default:
          return true;
      }
    });
  }

  // Estadísticas
  getStats(): BoardStats {
    const allCards = this.getAllCards();
    const now = new Date();

    const stats: BoardStats = {
      totalCards: allCards.length,
      cardsByColumn: {},
      cardsByPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
      overdueCards: 0,
      completedCards: 0,
      archivedCards: 0,
    };

    // Contar por columna
    this.BOARD_COLUMNS.forEach(column => {
      stats.cardsByColumn[column] = 0;
    });

    allCards.forEach(card => {
      // Por columna
      if (stats.cardsByColumn[card.column_name] !== undefined) {
        stats.cardsByColumn[card.column_name]++;
      }

      // Por prioridad
      if (stats.cardsByPriority[card.priority] !== undefined) {
        stats.cardsByPriority[card.priority]++;
      }

      // Archivadas
      if (card.is_archived) {
        stats.archivedCards++;
      }

      // Completadas (columna "Hecho")
      if (card.column_name === 'Hecho') {
        stats.completedCards++;
      }

      // Atrasadas
      if (card.dueDate) {
        const dueDate = new Date(card.dueDate);
        if (dueDate < now && card.column_name !== 'Hecho') {
          stats.overdueCards++;
        }
      }
    });

    return stats;
  }

  // Exportar/Importar
  exportData(): BoardData {
    const cards: Record<string, Card[]> = {};

    this.BOARD_COLUMNS.forEach(column => {
      cards[column] = this.getCards(column);
    });

    return {
      cards,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
  }

  exportToJSON(): string {
    const data = this.exportData();
    return JSON.stringify(data, null, 2);
  }

  downloadJSON(): void {
    const json = this.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importData(data: BoardData): boolean {
    try {
      // Validar estructura
      if (!data.cards || typeof data.cards !== 'object') {
        throw new Error('Estructura de datos inválida');
      }

      // Importar datos
      Object.entries(data.cards).forEach(([column, cards]) => {
        if (this.BOARD_COLUMNS.includes(column)) {
          this.saveCards(column, cards);
        }
      });

      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }

  async importFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BoardData;
      return this.importData(data);
    } catch (error) {
      console.error('Error al leer archivo:', error);
      return false;
    }
  }

  clearAllData(): void {
    this.BOARD_COLUMNS.forEach(column => {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${column}`);
    });
  }
}
