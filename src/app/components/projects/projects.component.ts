import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  id: number;
  title: string;
  mainImage: string;
  overview: string;
  githubLink: string;
  isExpanded: boolean;
  detailedDescription: string;
  additionalImages: string[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-container">
      <h2>Projects</h2>
      <div class="projects-grid">
        <div class="project-card" *ngFor="let project of projects" [class.expanded]="project.isExpanded">
          <div class="project-content">
            <div class="project-header">
              <img [src]="project.mainImage" [alt]="project.title" class="project-image">
              <h3>{{ project.title }}</h3>
              <p class="overview">{{ project.overview }}</p>
            </div>

            <div class="project-actions">
              <a [href]="project.githubLink" target="_blank" class="github-link">View on GitHub</a>
              <button class="toggle-btn" (click)="toggleProject(project)">
                {{ project.isExpanded ? 'Show Less' : 'Show More' }}
              </button>
            </div>

            <div class="expanded-content" *ngIf="project.isExpanded">
              <div class="detailed-description" [innerHTML]="project.detailedDescription"></div>
              <div class="additional-images">
                <img *ngFor="let image of project.additionalImages"
                     [src]="image"
                     alt="Additional project image"
                     (click)="openImageModal(image)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      id: 1,
      title: 'Stock Market Analysis Tool',
      mainImage: 'assets/images/stock-analysis-main.jpg',
      overview: 'A sophisticated Python-based stock market analysis tool leveraging real-time data and advanced visualization techniques to provide comprehensive market insights and trading analytics.',
      githubLink: 'https://github.com/shivamratnani/Stock-Volatility-Analyzer',
      isExpanded: false,
      detailedDescription: `
        Built with Python and modern data analysis libraries, this tool offers real-time market analysis and visualization capabilities for both individual stocks and broader market trends.<br><br>

        <strong>Key Features:</strong>
        <ul>
          <li>Real-time stock data analysis with concurrent processing</li>
          <li>Technical indicator calculations (SMA20, SMA50, RSI, MACD)</li>
          <li>Custom date range analysis with historical data support</li>
          <li>Interactive visualization of price movements and volume data</li>
          <li>Automated market calendar integration for trading day validation</li>
          <li>Support for both S&P 500 and broader market analysis</li>
          <li>Efficient data caching system for optimized performance</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Utilized yfinance API for real-time market data retrieval</li>
          <li>Implemented concurrent processing using Python's concurrent.futures</li>
          <li>Built interactive charts using matplotlib with custom styling</li>
          <li>Developed robust error handling and logging system</li>
          <li>Created flexible data caching mechanism for improved performance</li>
          <li>Integrated pandas_market_calendars for accurate market timing</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Handling API rate limits and data consistency</li>
          <li>Implementing efficient concurrent processing</li>
          <li>Managing real-time data streams</li>
          <li>Optimizing performance for large datasets</li>
          <li>Building reliable error recovery systems</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Machine learning-based trend prediction</li>
          <li>Advanced options trading analysis</li>
          <li>Real-time alert system</li>
          <li>Custom indicator development</li>
          <li>Web-based user interface</li>
        </ul>`,
      additionalImages: [
        'assets/images/stock-analysis-chart.jpg',
        'assets/images/stock-analysis-technical.jpg'
      ]
    },
    {
      id: 2,
      title: 'Connect Four AI',
      mainImage: 'assets/images/connect4-main.jpg',
      overview: 'A sophisticated Python-based implementation of Connect Four featuring an AI opponent powered by the Minimax algorithm with alpha-beta pruning, combining strategic gameplay with a graphical interface for an engaging player-versus-computer experience.',
      githubLink: 'https://github.com/shivamratnani/Connect4-AI',
      isExpanded: false,
      detailedDescription: `
        Built using Python and leveraging advanced algorithms, this implementation of Connect Four offers an intelligent AI opponent and an interactive gaming experience.<br><br>

        <strong>Key Features:</strong>
        <ul>
          <li>Intelligent AI opponent using Minimax algorithm with alpha-beta pruning</li>
          <li>Real-time graphical interface using Pygame</li>
          <li>Dynamic board evaluation system</li>
          <li>Advanced move prediction and strategy</li>
          <li>Interactive player controls</li>
          <li>Win detection across multiple directions</li>
          <li>Visual feedback and game state display</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>NumPy-based board representation for efficient operations</li>
          <li>Minimax algorithm with configurable depth (currently set to 5 moves)</li>
          <li>Position evaluation heuristics for strategic decision making</li>
          <li>Pygame-based graphics system for smooth visualization</li>
          <li>Real-time piece movement and board updates</li>
          <li>Optimized win detection algorithms</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Implementing efficient minimax algorithm with pruning</li>
          <li>Balancing AI difficulty for engaging gameplay</li>
          <li>Creating responsive and intuitive UI</li>
          <li>Optimizing win detection across all directions</li>
          <li>Managing game state transitions smoothly</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Adjustable AI difficulty levels</li>
          <li>Multiplayer support</li>
          <li>Custom board sizes</li>
          <li>Score tracking system</li>
          <li>Game replay functionality</li>
          <li>Advanced visual effects</li>
        </ul>`,
      additionalImages: [
        'assets/images/connect4-gameplay.jpg',
        'assets/images/connect4-ai-move.jpg'
      ]
    },
    {
      id: 3,
      title: 'Earnings Call Analysis Tool',
      mainImage: 'assets/images/earnings-analysis-main.jpg',
      overview: 'A sophisticated Python-based earnings call analyzer that processes earnings transcripts and provides comprehensive financial insights through natural language processing and AI, enabling automated analysis of earnings calls, extracting key financial metrics, strategic initiatives, and sentiment analysis.',
      githubLink: 'https://github.com/shivamratnani/StockEarningsReportAnalysis',
      isExpanded: false,
      detailedDescription: `
        Built with Python and leveraging OpenAI's GPT-4, this tool automates the analysis of earnings call transcripts, providing deep insights into company performance and strategic direction.<br><br>

        <strong>Key Features:</strong>
        <ul>
          <li>Automated PDF transcript processing and text extraction</li>
          <li>Multiple analysis categories including financial results, strategic initiatives, and risks</li>
          <li>Natural language processing for sentiment analysis</li>
          <li>Integration with OpenAI's GPT-4 for advanced summarization</li>
          <li>Customizable analysis categories and metrics tracking</li>
          <li>Interactive command-line interface for analysis selection</li>
          <li>Comprehensive report generation with key insights</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Implemented PyPDF2 for robust PDF text extraction</li>
          <li>Integrated OpenAI API for advanced text analysis</li>
          <li>Built pattern matching system for financial data extraction</li>
          <li>Developed modular analysis framework for different metrics</li>
          <li>Created flexible reporting and output formatting system</li>
          <li>Implemented sentiment analysis across multiple categories</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Handling various PDF formats and structures</li>
          <li>Implementing accurate pattern matching</li>
          <li>Managing API rate limits and costs</li>
          <li>Optimizing text processing efficiency</li>
          <li>Building robust error handling systems</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Advanced visualization capabilities</li>
          <li>Historical trend analysis</li>
          <li>Comparative analysis across companies</li>
          <li>Real-time transcript processing</li>
          <li>Export functionality for different formats</li>
          <li>Web-based user interface</li>
        </ul>`,
      additionalImages: [
        'assets/images/earnings-analysis-results.jpg',
        'assets/images/earnings-analysis-sentiment.jpg'
      ]
    },
    {
      id: 4,
      title: 'Personal Portfolio Website',
      mainImage: 'assets/images/portfolio-main.jpg',
      overview: 'A modern, interactive portfolio website built with Angular 17, featuring a responsive design, smooth animations, and dedicated sections for showcasing projects, photography, and professional experience. The website implements a unique star-field background animation and includes an integrated contact system.',
      githubLink: 'https://github.com/shivamratnani/ratnani_website',
      isExpanded: false,
      detailedDescription: `
        Built using Angular 17 and modern web technologies, this portfolio website showcases my projects and professional experience through an engaging, interactive interface.<br><br>

        <strong>Key Features:</strong>
        <ul>
          <li>Responsive single-page application design</li>
          <li>Interactive navigation with smooth scrolling</li>
          <li>Dynamic star-field background animation</li>
          <li>Section-based content organization</li>
          <li>Project showcase with expandable details</li>
          <li>Photography portfolio with gallery view</li>
          <li>Interactive resume viewer with download option</li>
          <li>Integrated contact form with email functionality</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Built with Angular 17 standalone components</li>
          <li>Implemented Intersection Observer for section tracking</li>
          <li>Created custom animations using SCSS and Angular animations</li>
          <li>Developed responsive layouts using CSS Grid and Flexbox</li>
          <li>Integrated Node.js backend with Express for form handling</li>
          <li>Implemented lazy loading for optimal performance</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Implementing smooth section transitions</li>
          <li>Creating responsive layouts for all screen sizes</li>
          <li>Managing form state and validation</li>
          <li>Optimizing performance and load times</li>
          <li>Handling server-side email functionality</li>
          <li>Ensuring cross-browser compatibility</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Blog section integration</li>
          <li>Dark/Light theme toggle</li>
          <li>Multi-language support</li>
          <li>Advanced animation effects</li>
          <li>Project filtering system</li>
          <li>Interactive timeline for experience</li>
        </ul>`,
      additionalImages: [
        'assets/images/portfolio-projects.jpg',
        'assets/images/portfolio-photography.jpg'
      ]
    }
  ];

  selectedImage: string | null = null;
  showModal: boolean = false;

  toggleProject(project: Project) {
    project.isExpanded = !project.isExpanded;
  }

  openImageModal(image: string) {
    this.selectedImage = image;
    this.showModal = true;
  }

  closeImageModal() {
    this.selectedImage = null;
    this.showModal = false;
  }
}
