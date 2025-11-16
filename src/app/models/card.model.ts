export interface Card {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  column_name: string;
  is_archived: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

export interface BoardFilters {
  searchTerm: string;
  priorities: ('low' | 'medium' | 'high')[];
  showArchived: boolean;
  dueDateFilter: 'all' | 'overdue' | 'today' | 'week' | 'none';
}

export interface BoardStats {
  totalCards: number;
  cardsByColumn: Record<string, number>;
  cardsByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  overdueCards: number;
  completedCards: number;
  archivedCards: number;
}

export interface BoardData {
  cards: Record<string, Card[]>;
  exportDate: string;
  version: string;
}
