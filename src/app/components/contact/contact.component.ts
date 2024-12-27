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
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-container">
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

          <button
            type="submit"
            class="send-button"
            [disabled]="!contactForm.form.valid">
            SEND
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  formData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  async onSubmit() {
    try {
      const emailBody = {
        subject: this.formData.subject,
        body: `
Name: ${this.formData.name}

Email: ${this.formData.email}

Phone Number: ${this.formData.phone}

Message:
${this.formData.message}
        `
      };

      const response = await this.http.post('http://localhost:3000/api/send-email', emailBody).toPromise();

      // Reset form after successful submission
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };

      alert('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  }
}
