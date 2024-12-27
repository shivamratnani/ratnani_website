import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-container">
      <div class="resume-wrapper">
        <h2>Resume</h2>
        <div class="pdf-container">
          <iframe
            [src]="resumeUrl"
            frameborder="0"
            width="100%"
            height="100%"
          ></iframe>
        </div>
        <div class="resume-actions">
          <a href="assets/Shivam Ratnani - Resume.pdf"
             target="_blank"
             class="view-button">
            <i class="bi bi-eye"></i> View PDF in New Tab
          </a>
          <a href="assets/Shivam Ratnani - Resume.pdf"
             download="Shivam Ratnani - Resume.pdf"
             class="download-button">
            <i class="bi bi-download"></i> Download PDF
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  resumeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.resumeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/Shivam Ratnani - Resume.pdf');
  }

  ngOnInit() {}
}
