import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CoreModule } from './core/core.module';
import { FrontModule } from './front/front.module';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [RouterOutlet, RouterModule,  HttpClientModule ,    FrontModule,
    CoreModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'front';
}
