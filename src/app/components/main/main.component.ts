import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="star-field">
        @for (star of stars; track star) {
          <div class="star-{{star}}"></div>
        }
      </div>
      <div class="content-area">
        <div class="main-content">
          <div class="text-container">
            <h1 class="title">Welcome to ratnani.org!!</h1>
            <p class="subtitle">By Shivam Ratnani</p>
          </div>
        </div>
      </div>

      <div class="scroll-indicator" (click)="scrollToSection('overview')">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="down-arrow">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M16.916 27.8125C17.5498 26.9307 21.2148 21.7914 21.5662 21.316C22.4962 20.0691 22.3791 19.8556 21.015 20.2551C18.4523 20.9991 17.7841 21.0336 17.7634 21.0405C18.411 16.5213 18.8174 13.249 19.093 6.40127C19.1826 4.18989 19.1619 4.059 18.7279 4.25878C18.3559 4.4379 18.2594 4.83746 18.163 6.75262C17.915 11.7127 16.9712 20.5238 16.5441 21.8465C16.3512 22.4527 16.737 22.4527 19.1895 21.8465C19.775 21.7018 20.271 21.6054 20.2917 21.6261C20.3881 21.7225 15.0767 29.018 15.0491 29.018C15.0354 29.018 14.7322 28.5495 14.3809 27.9778C12.9687 25.6837 11.6391 24.1061 9.89614 22.1841C13.6162 22.6112 13.6024 22.9143 13.7127 18.0093C13.7953 14.2754 14.0571 7.28996 14.0365 5.58837C14.0158 3.52854 12.7482 4.06589 12.7138 7.93064C12.7 9.34978 12.4657 18.8843 12.4726 19.649C12.4863 21.2197 12.4795 21.2128 11.8801 21.1232C10.9363 20.9786 9.91681 20.9923 9.20723 21.1232C8.0361 21.3436 8.06366 21.7156 8.82834 22.5767C9.90991 23.7961 9.9788 23.989 13.2718 28.7011C14.7736 30.8643 14.8837 30.6714 16.916 27.8125Z" fill="white"/>
        </svg>
      </div>
    </div>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  stars: number[] = [];

  ngOnInit() {
    this.stars = Array.from({length: 50}, (_, i) => i + 1);
  }

  scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
