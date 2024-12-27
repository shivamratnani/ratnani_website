import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <div class="overview-content">
        <h2>About Me</h2>
        <div class="content-grid">
          <!-- Left Column -->
          <div class="image-column">
            <div class="image-placeholder">
            <img src="assets/portrait.jpeg" alt="Portrait" />
            </div>
            <div class="social-icons">
              <span class="icon">•</span>
              <span class="icon">•</span>
              <span class="icon">•</span>
            </div>
          </div>

          <!-- Right Column -->
          <div class="text-column">
            <div class="text-editor">
              <div class="editor-toolbar">
                <button class="toolbar-btn">B</button>
                <button class="toolbar-btn">I</button>
                <button class="toolbar-btn">U</button>
                <button class="toolbar-btn">S</button>
                <button class="toolbar-btn">🔗</button>
                <button class="toolbar-btn">≡</button>
                <button class="toolbar-btn">≣</button>
                <button class="toolbar-btn">⚏</button>
                <button class="toolbar-btn">&lt;/&gt;</button>
              </div>
              <div class="editor-content">
                <p class="overview-text">
                As a Computer Science and Data Science double major at UW-Madison graduating in May 2025, I'm passionate about building scalable solutions at the intersection of software engineering and AI. Currently, I'm driving innovation as a Software Engineer Intern at Rightworks, where I enhance web applications for 300,000+ users, while also volunteering at Couillard Solar Foundation to develop renewable energy visualization platforms. My experience spans full-stack development, cloud applications, and AI/ML, with expertise in technologies like React, AngularJS, Node.js, and various cloud platforms. Through projects like developing a stock volatility analyzer and implementing AI algorithms for game development, I continually push the boundaries of what's possible in technology. I'm always eager to connect with fellow technologists and innovators who share my passion for creating impactful solutions through code.
                </p>
              </div>
              <div class="editor-actions">
                <button class="action-btn" (click)="downloadResume()">
                  <span class="icon">📎</span>
                </button>
                <button class="action-btn" (click)="triggerEmojiAnimation()">
                  <span class="icon">😊</span>
                </button>
                <button class="action-btn" (click)="triggerTrashAnimation()">
                  <span class="icon">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Falling Items Container -->
        <div class="falling-items-container" *ngIf="isTrashAnimating || isEmojiAnimating">
          <ng-container *ngFor="let item of fallingItems">
            <div class="falling-item"
                 [style.left.%]="item.x"
                 [style.animation-delay.ms]="item.delay"
                 [style.transform]="'rotate(' + item.rotation + 'deg)'">
              {{ item.content }}
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  isTrashAnimating = false;
  isEmojiAnimating = false;
  fallingItems: Array<{x: number, delay: number, content: string, rotation: number}> = [];

  private emojis = ['😊', '😂', '🥳', '😎', '🤩', '😄', '🥰', '😋', '🤪', '😇',
                    '🌟', '✨', '💫', '⭐', '🎈', '🎉', '🎊', '💝', '💖', '💕'];

  downloadResume() {
    const link = document.createElement('a');
    link.href = 'assets/Shivam Ratnani - Resume.pdf';
    link.download = 'Shivam_Ratnani_Resume.pdf';
    link.click();
  }

  triggerEmojiAnimation() {
    this.isEmojiAnimating = true;
    this.createFallingItems(null);
  }

  triggerTrashAnimation() {
    this.isTrashAnimating = true;
    this.createFallingItems('🗑️');
  }

  private createFallingItems(specificContent: string | null) {
    this.fallingItems = Array(20).fill(null).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 1000,
      content: specificContent || this.emojis[Math.floor(Math.random() * this.emojis.length)],
      rotation: Math.random() * 360
    }));

    setTimeout(() => {
      this.isTrashAnimating = false;
      this.isEmojiAnimating = false;
      this.fallingItems = [];
    }, 5000);
  }
}
