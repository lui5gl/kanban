import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListComponent } from './components/list/list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, ListComponent],
})
export class AppComponent {
  title = 'kanban-angular';
}
