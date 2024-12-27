# Personal Portfolio Website (ratnani.org)

## Overview
A dynamic portfolio website built with Angular 17, showcasing professional experience, projects, and photography. The site features an immersive star-field animation background, smooth section transitions, and interactive components. The platform includes dedicated sections for project showcases, a photography portfolio, resume display, and a contact system with email integration.

Live Site: [ratnani.org](https://ratnani.org)  
Repository: [github.com/shivamratnani/ratnani_website](https://github.com/shivamratnani/ratnani_website)

## Features
### Core Features
- 🌟 Interactive star-field background with 100 dynamic animated stars
- 📱 Responsive design with mobile-first approach and hamburger menu
- 🔄 Smooth section transitions using IntersectionObserver
- 📸 Dynamic photography portfolio with expandable gallery view
- 📝 Integrated contact form with email functionality using Nodemailer
- 📄 PDF resume viewer with direct download option
- 🎨 Custom animations including falling emojis and UI transitions
- 🔗 Integrated social media links and professional connections

### Interactive Elements
- Expandable project cards with detailed information
- Real-time form validation with error messaging
- Mobile-responsive navigation menu
- Interactive image gallery with full-screen mode
- Custom emoji animation system
- Smooth scrolling between sections

## Tech Stack
### Frontend
- Angular 17.0.8
- TypeScript 5.2.2
- SCSS for styling
- Bootstrap Icons for UI elements
- Angular Material UI components
- Zone.js for performance optimization
- RxJS for reactive programming

### Backend
- Node.js
- Express 4.21.2
- Nodemailer 6.9.16
- CORS middleware
- dotenv for environment management

### Development Tools
- Angular CLI 17.0.8
- Angular DevKit
- TypeScript compiler
- Karma & Jasmine for testing
- ESLint for code quality
- npm 9.8.0+
- Node.js 18.19.1+

## Project Structure
```
ratnani_website/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── main/
│   │   │   │   ├── main.component.ts
│   │   │   │   └── main.component.scss
│   │   │   ├── overview/
│   │   │   ├── projects/
│   │   │   ├── photography/
│   │   │   ├── resume/
│   │   │   └── contact/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── photos/
│   │   ├── images/
│   │   └── Shivam Ratnani - Resume.pdf
│   └── styles/
├── server/
│   └── server.ts
└── package.json
```

## Setup and Installation
### Prerequisites
- Node.js (>= 18.19.1)
- npm (>= 9.8.0)
- Angular CLI (17.0.8)

### Installation Steps
1. Clone the repository
```bash
git clone https://github.com/shivamratnani/ratnani_website.git
cd ratnani_website
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
PORT=3000
```

4. Start development server
```bash
# Frontend
npm run start

# Backend
node server.ts
```

5. Build for production
```bash
npm run build -- --configuration production
```

## Component Details

### Navigation System
```typescript
export class AppComponent implements AfterViewInit {
  tabs = [
    { name: 'Main', id: 'main' },
    { name: 'Overview', id: 'overview' },
    { name: 'Projects', id: 'projects' },
    { name: 'Photography', id: 'photography' },
    { name: 'Resume', id: 'resume' },
    { name: 'Contact + Links', id: 'contact' }
  ];

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
}
```

### Star-field Animation
```typescript
export class AppComponent {
  stars = Array(100).fill(0);
  // Creates 100 stars with random positions and animations
}
```

### Contact System
```typescript
interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export class ContactComponent {
  async onSubmit() {
    try {
      const response = await this.http.post('http://localhost:3000/api/send-email', 
        this.formData).toPromise();
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
}
```

## Development Guidelines

### Code Style
- Follow Angular style guide practices
- Use TypeScript strict mode for type safety
- Implement comprehensive error handling
- Write clear documentation and comments
- Use SCSS with BEM methodology

### Testing
- Unit tests with Jasmine framework
- Component testing with Angular TestBed
- Integration testing for API endpoints
- End-to-end testing with Protractor
- Coverage reporting with Karma

### Performance Optimization
- Implement lazy loading for components
- Optimize images and assets
- Minimize bundle sizes
- Use efficient caching strategies
- Enable Angular production mode

## Deployment

### Production Build
```bash
npm run build -- --configuration production
```

### Server Configuration
- Configure CORS policies for security
- Set up SSL certificate for HTTPS
- Enable HTTP/2 for improved performance
- Configure email service securely
- Set up proper error logging

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact
Shivam Ratnani  
Email: ratnani@wisc.edu  
Website: [ratnani.org](https://ratnani.org)  
LinkedIn: [linkedin.com/in/shivamratnani](https://linkedin.com/in/shivamratnani)  
GitHub: [github.com/shivamratnani](https://github.com/shivamratnani)
