import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.component.html',
  styles: ``,
})
export class ListComponent {
  @Input() title = '';
}
