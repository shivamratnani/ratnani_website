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
    <div class="star-field">
      @for (star of stars; track star) {
        <div class="star-{{star}}"></div>
      }
    </div>
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
            <a href="https://github.com/yourusername" target="_blank" class="social-link">
              <i class="bi bi-github"></i>
            </a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" class="social-link">
              <i class="bi bi-linkedin"></i>
            </a>
          </div>
        </div>

        <form class="contact-form" (submit)="onSubmit($event)">
          <div class="form-row">
            <input type="text" placeholder="Name" [(ngModel)]="formData.name" name="name">
            <input type="email" placeholder="Email" [(ngModel)]="formData.email" name="email">
            <input type="tel" placeholder="Phone" [(ngModel)]="formData.phone" name="phone">
          </div>

          <input type="text" placeholder="Subject" [(ngModel)]="formData.subject" name="subject">

          <textarea placeholder="Message" [(ngModel)]="formData.message" name="message" rows="4"></textarea>

          <button type="submit" class="send-button">SEND</button>
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

  stars = Array.from({ length: 63 }, (_, i) => i + 1);

  constructor(private http: HttpClient) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    try {
      const response = await this.http.post('http://localhost:3000/api/send-email', this.formData).toPromise();

      // Clear form and show success message
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };

      alert("Message sent successfully!");

    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
}
