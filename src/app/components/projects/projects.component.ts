import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  id: number;
  title: string;
  mainImage: string;
  overview: string;
  githubLink: string;
  isExpanded: boolean;
  detailedDescription: string;
  additionalImages: string[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-field">
      @for (star of stars; track star) {
        <div class="star-{{star}}"></div>
      }
    </div>
    <div class="content-container">
      <h2>PROJECTS</h2>

      <div class="projects-grid">
        <div class="project-card" *ngFor="let project of projects" [class.expanded]="project.isExpanded">
          <img [src]="project.mainImage" [alt]="project.title" class="project-image">

          <div class="project-content">
            <h3>{{ project.title }}</h3>
            <p class="overview">{{ project.overview }}</p>

            <div class="project-actions">
              <a [href]="project.githubLink" target="_blank" class="github-link">View on GitHub</a>
              <button class="toggle-btn" (click)="toggleProject(project)">
                {{ project.isExpanded ? 'Show Less' : 'Show More' }}
              </button>
            </div>

            <div class="expanded-content" *ngIf="project.isExpanded">
              <p class="detailed-description">{{ project.detailedDescription }}</p>
              <div class="additional-images">
                <img *ngFor="let image of project.additionalImages"
                     [src]="image"
                     alt="Additional project image"
                     (click)="openImageModal(image)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      id: 1,
      title: 'Project 1',
      mainImage: 'assets/images/project1-main.jpg',
      overview: 'Brief overview of project 1',
      githubLink: 'https://github.com/yourusername/project1',
      isExpanded: false,
      detailedDescription: 'Detailed description of project 1...',
      additionalImages: ['image1.jpg', 'image2.jpg']
    },
    {
      id: 2,
      title: 'Project 2',
      mainImage: 'assets/images/project2-main.jpg',
      overview: 'Brief overview of project 2',
      githubLink: 'https://github.com/yourusername/project1',
      isExpanded: false,
      detailedDescription: 'Detailed description of project 2...',
      additionalImages: ['image1.jpg', 'image2.jpg']
    },
    {
      id: 3,
      title: 'Project 3',
      mainImage: 'assets/images/project3-main.jpg',
      overview: 'Brief overview of project 3',
      githubLink: 'https://github.com/yourusername/project1',
      isExpanded: false,
      detailedDescription: 'Detailed description of project 3...',
      additionalImages: ['image1.jpg', 'image2.jpg']
    },
    {
      id: 4,
      title: 'Project 4',
      mainImage: 'assets/images/project4-main.jpg',
      overview: 'Brief overview of project 4',
      githubLink: 'https://github.com/yourusername/project1',
      isExpanded: false,
      detailedDescription: 'Detailed description of project 4...',
      additionalImages: ['image1.jpg', 'image2.jpg']
    },
    // Add other projects similarly
  ];

  selectedImage: string | null = null;
  showModal: boolean = false;
  stars = Array.from({ length: 63 }, (_, i) => i + 1);

  toggleProject(project: Project) {
    project.isExpanded = !project.isExpanded;
  }

  openImageModal(image: string) {
    this.selectedImage = image;
    this.showModal = true;
  }

  closeImageModal() {
    this.selectedImage = null;
    this.showModal = false;
  }
}
