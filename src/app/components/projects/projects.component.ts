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
              <h3>{{ project.title }}</h3>
              <p class="overview">{{ project.overview }}</p>
            </div>

            <div class="project-actions">
              <a [href]="project.githubLink" target="_blank" class="github-link">
                <i class="bi bi-github"></i> View on GitHub
              </a>
              <button class="github-link" (click)="toggleProject(project)">
                <i class="bi" [ngClass]="project.isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                {{ project.isExpanded ? 'Show Less' : 'Show More' }}
              </button>
            </div>

            <div class="expanded-content" *ngIf="project.isExpanded">
              <div class="detailed-description" [innerHTML]="project.detailedDescription"></div>
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
      mainImage: '',
      overview: 'A sophisticated Python-based stock market analysis tool leveraging real-time data and advanced visualization techniques to provide comprehensive market insights and trading analytics.',
      githubLink: 'https://github.com/shivamratnani/Stock-Volatility-Analyzer',
      isExpanded: false,
      detailedDescription: `
        A Python-based tool for analyzing stock market data and visualizing market trends. This application provides real-time and historical stock data analysis with an interactive command-line interface.<br><br>

        <strong>Market Gainers and Losers Analysis:</strong>
        <ul>
          <li>Analyze top gainers and losers for any specified time period</li>
          <li>Support for both S&P 500 stocks and full market analysis</li>
          <li>Flexible time periods from 1-minute intervals to 10-year historical data</li>
          <li>Configurable limit for number of stocks to display</li>
        </ul>

        <strong>Custom Period Analysis:</strong>
        <ul>
          <li>Analyze stock performance between any two dates</li>
          <li>Automatic adjustment to last trading day if end date falls on non-trading day</li>
          <li>Dynamic interval selection based on date range</li>
          <li>Comprehensive performance metrics including price changes and volume</li>
        </ul>

        <strong>Stock Information:</strong>
        <ul>
          <li>Access basic company information including sector and industry</li>
          <li>View key metrics like market cap, current price, and trading volumes</li>
          <li>Display 52-week price ranges</li>
          <li>Show average trading volumes and market trends</li>
        </ul>

        <strong>Technical Analysis:</strong>
        <ul>
          <li>Generate price charts with customizable time periods</li>
          <li>Display moving averages (20-day and 50-day SMA when applicable)</li>
          <li>Volume analysis and visualization</li>
          <li>Interactive charts with matplotlib integration</li>
        </ul>

        <strong>Market-Aware Features:</strong>
        <ul>
          <li>Automatic detection of market trading hours</li>
          <li>Intraday data options only available during market hours</li>
          <li>Fallback to last trading day for non-trading periods</li>
          <li>Real-time market status updates</li>
        </ul>

        <strong>Technical Requirements:</strong>
        <ul>
          <li>Python 3.7+</li>
          <li>yfinance for data retrieval</li>
          <li>pandas for data processing</li>
          <li>matplotlib for visualization</li>
          <li>pandas_market_calendars for market timing</li>
          <li>pytz for timezone handling</li>
          <li>requests for API communication</li>
        </ul>

        <strong>Error Handling:</strong>
        <ul>
          <li>Failed analysis attempts are logged to 'failed_analysis.txt'</li>
          <li>Automatic retry mechanism for API calls</li>
          <li>Graceful handling of market closures and invalid dates</li>
          <li>Comprehensive input validation for tickers and dates</li>
          <li>Rate limiting protection for API requests</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>GUI interface for improved user experience</li>
          <li>Advanced technical indicators</li>
          <li>Portfolio tracking capabilities</li>
          <li>Export functionality for analysis results</li>
          <li>Enhanced data visualization options</li>
          <li>Real-time price alerts</li>
          <li>Custom watchlist feature</li>
        </ul>`,
      additionalImages: [
        ''
      ]
    },
    {
      id: 2,
      title: 'Connect Four AI',
      mainImage: '',
      overview: 'A sophisticated Python-based implementation of Connect Four featuring an AI opponent powered by the Minimax algorithm with alpha-beta pruning, combining strategic gameplay with a graphical interface for an engaging player-versus-computer experience.',
      githubLink: 'https://github.com/shivamratnani/Connect4-AI',
      isExpanded: false,
      detailedDescription: `
        Built using Python, Pygame, and the Minimax algorithm, this Connect Four implementation showcases AI strategy through an engaging, interactive interface.<br><br>

        <strong>Key Technical Features:</strong>
        <ul>
          <li>Minimax algorithm with alpha-beta pruning</li>
          <li>Real-time graphical interface with Pygame</li>
          <li>Dynamic board evaluation system</li>
          <li>NumPy-based game state management</li>
          <li>Win detection across multiple directions</li>
          <li>Position-based heuristic evaluation</li>
          <li>Advanced move prediction strategy</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Custom position evaluation algorithms</li>
          <li>Performance-optimized minimax search</li>
          <li>Strategic depth-limited game tree search</li>
          <li>Event-driven Pygame graphics system</li>
          <li>Efficient board state representation</li>
          <li>Multi-directional win detection</li>
          <li>Modular component architecture</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Optimizing minimax algorithm efficiency</li>
          <li>Balancing AI difficulty and response time</li>
          <li>Implementing smooth graphics rendering</li>
          <li>Managing complex game state transitions</li>
          <li>Creating responsive player controls</li>
          <li>Ensuring consistent game logic</li>
          <li>Handling edge cases in move validation</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Adjustable AI difficulty levels</li>
          <li>Multiplayer network support</li>
          <li>Custom board size options</li>
          <li>Advanced animation system</li>
          <li>Game replay functionality</li>
          <li>Move suggestion system</li>
          <li>Performance analytics tracking</li>
        </ul>`,
      additionalImages: [
        ''
      ]
    },
    {
      id: 3,
      title: 'Earnings Call Analysis Tool',
      mainImage: '',
      overview: 'A sophisticated Python-based earnings call analyzer that processes earnings transcripts and provides comprehensive financial insights through natural language processing and AI, enabling automated analysis of earnings calls, extracting key financial metrics, strategic initiatives, and sentiment analysis.',
      githubLink: 'https://github.com/shivamratnani/StockEarningsReportAnalysis',
      isExpanded: false,
      detailedDescription: `
        Built using Python and OpenAI's GPT-4, this tool provides automated analysis of earnings call transcripts with intelligent insights and sentiment evaluation.<br><br>

        <strong>Key Technical Features:</strong>
        <ul>
          <li>GPT-4 powered text analysis</li>
          <li>PDF transcript processing</li>
          <li>Multi-category financial analysis</li>
          <li>Sentiment evaluation system</li>
          <li>Pattern-based metric extraction</li>
          <li>Interactive command interface</li>
          <li>Comprehensive report generation</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Custom text preprocessing pipeline</li>
          <li>Intelligent pattern recognition system</li>
          <li>OpenAI API integration</li>
          <li>Regular expression matching engine</li>
          <li>Modular analysis framework</li>
          <li>Structured output formatting</li>
          <li>Error handling system</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Managing API rate limits</li>
          <li>Optimizing text processing efficiency</li>
          <li>Implementing accurate pattern matching</li>
          <li>Handling various PDF formats</li>
          <li>Creating consistent analysis metrics</li>
          <li>Ensuring accurate sentiment analysis</li>
          <li>Building robust error recovery</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Advanced visualization features</li>
          <li>Historical trend analysis</li>
          <li>Company comparison system</li>
          <li>Real-time processing capability</li>
          <li>Custom report templates</li>
          <li>Interactive web interface</li>
          <li>Data export functionality</li>
        </ul>`,
      additionalImages: [
        ''
      ]
    },
    {
      id: 4,
      title: 'Personal Portfolio Website',
      mainImage: '',
      overview: 'A modern, interactive portfolio website built with Angular 17, featuring a responsive design, smooth animations, and dedicated sections for showcasing projects, photography, and professional experience. The website implements a unique star-field background animation and includes an integrated contact system.',
      githubLink: 'https://github.com/shivamratnani/ratnani_website',
      isExpanded: false,
      detailedDescription: `
        Built using Angular 17 and modern web technologies, this portfolio website showcases technical expertise through an engaging, interactive interface.<br><br>

        <strong>Key Technical Features:</strong>
        <ul>
          <li>Angular 17 standalone components with TypeScript 5.2.2</li>
          <li>Dynamic star-field animation with parallax scrolling</li>
          <li>Intersection Observer API for precise scroll tracking</li>
          <li>Custom animation system for UI elements</li>
          <li>Mobile-responsive design with smooth transitions</li>
          <li>Real-time form validation with error handling</li>
          <li>Secure email system using Nodemailer</li>
        </ul>

        <strong>Technical Implementation:</strong>
        <ul>
          <li>Custom IntersectionObserver for section tracking</li>
          <li>Performance-optimized star animation system</li>
          <li>Lazy loading implementation for component modules</li>
          <li>Mobile-first approach with CSS Grid and Flexbox</li>
          <li>Bundle size optimization through tree shaking</li>
          <li>Secure backend integration with Express</li>
          <li>Advanced state management using RxJS</li>
        </ul>

        <strong>Development Challenges:</strong>
        <ul>
          <li>Optimizing star-field animation performance</li>
          <li>Implementing smooth section transitions</li>
          <li>Creating responsive layouts for all devices</li>
          <li>Managing complex component state</li>
          <li>Optimizing bundle sizes and load times</li>
          <li>Ensuring cross-browser compatibility</li>
          <li>Building secure email handling system</li>
        </ul>

        <strong>Future Enhancements:</strong>
        <ul>
          <li>Progressive Web App (PWA) implementation</li>
          <li>Advanced dark/light theme system</li>
          <li>Multi-language support</li>
          <li>Dynamic blog system with markdown</li>
          <li>Enhanced SEO optimization</li>
          <li>Real-time chat functionality</li>
          <li>Advanced analytics integration</li>
        </ul>`,
      additionalImages: [
        ''
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
