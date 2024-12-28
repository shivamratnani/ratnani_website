import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  access_key: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-container">
      <div class="contact-content">
        <h2>Contact Me</h2>
        <div class="contact-wrapper">
          <div class="contact-info">
            <div class="info-item">
              <span class="label">EMAIL</span>
              <a href="mailto:shiv&#64;ratnani.org" class="value">
                <i class="bi bi-envelope"></i>
                shiv&#64;ratnani.org
              </a>
            </div>

            <div class="social-links">
              <a href="https://github.com/shivamratnani" target="_blank" class="social-link">
                <i class="bi bi-github"></i>
              </a>
              <a href="https://linkedin.com/in/shivamratnani" target="_blank" class="social-link">
                <i class="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <form class="contact-form" (ngSubmit)="onSubmit()" #contactForm="ngForm">
            <div class="form-row">
              <input
                type="text"
                placeholder="Name"
                [(ngModel)]="formData.name"
                name="name"
                required>
              <input
                type="email"
                placeholder="Email"
                [(ngModel)]="formData.email"
                name="email"
                required
                email>
              <input
                type="tel"
                placeholder="Phone"
                [(ngModel)]="formData.phone"
                name="phone"
                required>
            </div>

            <input
              type="text"
              placeholder="Subject"
              [(ngModel)]="formData.subject"
              name="subject"
              required>

            <textarea
              placeholder="Message"
              [(ngModel)]="formData.message"
              name="message"
              rows="4"
              required></textarea>

            <div class="submit-section">
              <button
                type="submit"
                class="send-button"
                [disabled]="!contactForm.form.valid || isSubmitting">
                {{ isSubmitting ? 'SENDING...' : 'SEND' }}
              </button>
              <div class="result-message" *ngIf="resultMessage">{{ resultMessage }}</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  isSubmitting = false;
  resultMessage = '';

  formData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    access_key: 'a453ef2c-a49d-4966-99be-6e0d2e27ce1f'
  };

  constructor(private http: HttpClient) {}

  async onSubmit() {
    this.isSubmitting = true;
    this.resultMessage = 'Please wait...';

    try {
      const response = await this.http.post('https://api.web3forms.com/submit', this.formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).toPromise();

      this.resultMessage = 'Message sent successfully!';

      // Reset form
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        access_key: 'a453ef2c-a49d-4966-99be-6e0d2e27ce1f'
      };

    } catch (error) {
      console.error('Failed to send message:', error);
      this.resultMessage = 'Something went wrong! Please try again.';
    } finally {
      this.isSubmitting = false;
      setTimeout(() => {
        this.resultMessage = '';
      }, 3000);
    }
  }
}
