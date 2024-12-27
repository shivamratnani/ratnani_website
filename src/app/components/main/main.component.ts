import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="content-area">
        <div class="main-content">
          <div class="text-container">
            <h1 class="title">Welcome to ratnani.org!!</h1>
            <p class="subtitle">By Shivam Ratnani</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
