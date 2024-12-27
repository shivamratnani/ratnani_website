import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Photo {
  id: number;
  src: string;
  alt: string;
}

@Component({
  selector: 'app-photography',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-container">
      <h2>Photography</h2>
      <div class="photo-grid">
        <div class="photo-card"
             *ngFor="let photo of photos"
             [class.expanded]="selectedPhoto === photo"
             (click)="togglePhoto(photo)">
          <img [src]="photo.src" [alt]="photo.alt">
        </div>
      </div>

      <!-- Full screen overlay -->
      <div class="photo-overlay"
           *ngIf="selectedPhoto"
           (click)="closePhoto()">
        <div class="overlay-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closePhoto()">&times;</button>
          <img [src]="selectedPhoto.src" [alt]="selectedPhoto.alt">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./photography.component.scss']
})
export class PhotographyComponent {
  photos: Photo[] = [
    { id: 1, src: 'assets/photography_images/1.jpg', alt: 'Photo 1' },
    { id: 2, src: 'assets/photography_images/2.jpg', alt: 'Photo 2' },
    { id: 3, src: 'assets/photography_images/3.jpg', alt: 'Photo 3' },
    { id: 4, src: 'assets/photography_images/4.jpg', alt: 'Photo 4' },
    { id: 5, src: 'assets/photography_images/5.jpg', alt: 'Photo 5' },
    { id: 6, src: 'assets/photography_images/6.jpg', alt: 'Photo 6' },
    { id: 7, src: 'assets/photography_images/7.jpg', alt: 'Photo 7' },
    { id: 8, src: 'assets/photography_images/8.jpg', alt: 'Photo 8' },
    { id: 9, src: 'assets/photography_images/9.jpg', alt: 'Photo 9' },
    { id: 10, src: 'assets/photography_images/10.jpg', alt: 'Photo 10' },
    { id: 11, src: 'assets/photography_images/11.jpg', alt: 'Photo 11' },
    { id: 12, src: 'assets/photography_images/12.jpg', alt: 'Photo 12' },
    { id: 13, src: 'assets/photography_images/13.jpg', alt: 'Photo 13' },
    { id: 14, src: 'assets/photography_images/14.jpg', alt: 'Photo 14' },

  ];

  selectedPhoto: Photo | null = null;

  togglePhoto(photo: Photo) {
    this.selectedPhoto = this.selectedPhoto === photo ? null : photo;
  }

  closePhoto() {
    this.selectedPhoto = null;
  }
}
