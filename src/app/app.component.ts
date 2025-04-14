import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
  styles: []
})
export class AppComponent {
  title = 'medisense-client';
}
