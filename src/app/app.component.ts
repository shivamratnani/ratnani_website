import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { OverviewComponent } from './components/overview/overview.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PhotographyComponent } from './components/photography/photography.component';
import { ResumeComponent } from './components/resume/resume.component';
import { ContactComponent } from './components/contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MainComponent,
    OverviewComponent,
    ProjectsComponent,
    PhotographyComponent,
    ResumeComponent,
    ContactComponent
  ],
  template: `
    <div class="stars">
      @for (star of stars; track $index) {
        <div class="star-{{$index + 1}}"></div>
      }
    </div>

    <nav class="navigation">
      <div class="nav-content">
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <i class="bi bi-list"></i>
        </button>
        <div class="nav-items" [class.mobile-menu-open]="isMobileMenuOpen">
          @for (tab of tabs; track tab.name) {
            <a (click)="scrollToSection(tab.id); closeMobileMenu()"
               class="nav-item"
               [class.active]="activeSection === tab.id">
              {{tab.name}}
            </a>
          }
        </div>
      </div>
    </nav>

    <main>
      <section id="main" class="section">
        <app-main></app-main>
      </section>

      <section id="overview" class="section">
        <app-overview></app-overview>
      </section>

      <section id="projects" class="section">
        <app-projects></app-projects>
      </section>

      <section id="photography" class="section">
        <app-photography></app-photography>
      </section>

      <section id="resume" class="section">
        <app-resume></app-resume>
      </section>

      <section id="contact" class="section">
        <app-contact></app-contact>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  tabs = [
    { name: 'Main', id: 'main' },
    { name: 'Overview', id: 'overview' },
    { name: 'Projects', id: 'projects' },
    { name: 'Photography', id: 'photography' },
    { name: 'Resume', id: 'resume' },
    { name: 'Contact + Links', id: 'contact' }
  ];

  activeSection = 'main';
  title = 'ratnani_website';
  stars = Array(100).fill(0);
  isMobileMenuOpen = false;

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.section').forEach((section) => {
        observer.observe(section);
      });
    }
  }

  scrollToSection(id: string) {
    if (typeof window !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
