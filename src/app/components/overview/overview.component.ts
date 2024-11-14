import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <div class="star-field">
        @for (star of stars; track star) {
          <div class="star-{{star}}"></div>
        }
      </div>
      <div class="content-grid">
        <!-- Left Column -->
        <div class="image-column">
          <div class="image-placeholder">
            Insert picture of me here
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
                Insert Overview Here (Extend bottom section including attachments, emoji, and trash button to contain full text, make them functional. The attachments button should allow them to download my resume. The emojis button should show emojis, and the trash button should make a trash animation where small trash cans fall down the screen.)
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
  `,
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  stars: number[] = [];
  isTrashAnimating = false;
  isEmojiAnimating = false;
  fallingItems: Array<{x: number, delay: number, content: string, rotation: number}> = [];

  private emojis = ['😊', '😂', '🥳', '😎', '🤩', '😄', '🥰', '😋', '🤪', '😇',
                    '🌟', '✨', '💫', '⭐', '🎈', '🎉', '🎊', '💝', '💖', '💕'];

  ngOnInit() {
    this.stars = Array.from({length: 50}, (_, i) => i + 1);
  }

  downloadResume() {
    const link = document.createElement('a');
    link.href = 'assets/resume.pdf';
    link.download = 'resume.pdf';
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
