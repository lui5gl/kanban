import { Component } from '@angular/core';
import { CardComponent } from './components/card/card.component';
import { ListComponent } from './components/list/list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, CardComponent, ListComponent],
})
export class AppComponent {
  title = 'kanban-angular';
}
