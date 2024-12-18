import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ColumnComponent } from './components/column/column.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, ColumnComponent],
})
export class AppComponent {
  title = 'kanban-angular';
}
