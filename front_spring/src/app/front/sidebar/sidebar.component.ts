import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
    standalone: false

})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() role!: string | null;

  ngOnInit(): void {
    console.log('Sidebar initialized - Role:', this.role);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role']) {
      console.log('Role changed:', changes['role'].currentValue);
    }
  }

}
