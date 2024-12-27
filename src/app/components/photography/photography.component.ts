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
    { id: 1, src: 'assets/photos/photo1.jpg', alt: 'Photo 1' },
    { id: 2, src: 'assets/photos/photo2.jpg', alt: 'Photo 2' },
    { id: 3, src: 'assets/photos/photo3.jpg', alt: 'Photo 3' },
    { id: 4, src: 'assets/photos/photo4.jpg', alt: 'Photo 4' },
    // Add more photos as needed
  ];

  selectedPhoto: Photo | null = null;

  togglePhoto(photo: Photo) {
    this.selectedPhoto = this.selectedPhoto === photo ? null : photo;
  }

  closePhoto() {
    this.selectedPhoto = null;
  }
}
