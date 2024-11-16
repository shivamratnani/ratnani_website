import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-field">
      @for (star of stars; track star) {
        <div class="star-{{star}}"></div>
      }
    </div>
    <div class="content-container">
      <h2>RESUME</h2>
      <div class="resume-wrapper">
        <iframe
          src="assets/Shivam Ratnani - Resume.pdf#zoom=100"
          title="Resume"
          class="resume-frame">
        </iframe>
        <a href="assets/Shivam Ratnani - Resume.pdf"
           download="Shivam Ratnani - Resume.pdf"
           class="download-button">
          <i class="bi bi-download"></i> Download PDF
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent {
  stars = Array.from({ length: 63 }, (_, i) => i + 1);
}
