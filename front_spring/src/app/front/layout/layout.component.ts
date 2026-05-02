import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  standalone: false
})
export class LayoutComponent {

  currentRole: string | null = null;
  currentUserId: number | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentRole = this.authService.getUserRole();
    this.currentUserId = this.authService.getUserId();
    console.log('current role', this.currentRole);
    console.log('current user id', this.currentUserId);
  }
}