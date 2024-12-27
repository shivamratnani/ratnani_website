import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-container">
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
export class ResumeComponent {}
