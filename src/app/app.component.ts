import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { OverviewComponent } from './components/overview/overview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MainComponent,
    OverviewComponent
  ],
  template: `
    <nav class="navigation">
      <div class="nav-content">
        @for (tab of tabs; track tab.name) {
          <a (click)="scrollToSection(tab.id)" class="nav-item" [class.active]="activeSection === tab.id">
            {{tab.name}}
          </a>
        }
      </div>
    </nav>

    <main>
      <section id="main" class="section">
        <app-main></app-main>
      </section>

      <section id="overview" class="section">
        <app-overview></app-overview>
      </section>

      <!-- Other sections will go here -->
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
    { name: 'Click Me!!', id: 'click-me' },
    { name: 'Contact + Links', id: 'contact' }
  ];

  activeSection = 'main';
  title = 'ratnani_website';

  ngAfterViewInit() {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      }, { threshold: 0.5 });

      // Observe all sections
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
}
