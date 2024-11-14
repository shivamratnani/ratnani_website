import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { OverviewComponent } from './components/overview/overview.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PhotographyComponent } from './components/photography/photography.component';
import { ResumeComponent } from './components/resume/resume.component';
import { ClickMeComponent } from './components/click-me/click-me.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'photography', component: PhotographyComponent },
  { path: 'resume', component: ResumeComponent },
  { path: 'click-me', component: ClickMeComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '/main' } // Catch all route
];
