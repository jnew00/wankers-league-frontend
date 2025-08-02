# Wankers League - Frontend

A React-based golf league management system frontend that provides a modern, responsive interface for managing golf events, player data, scoring, and fantasy golf features.

## Overview

The Wankers League Frontend is a React 19 application built with Create React App that serves as the user interface for a comprehensive golf league management system. It features player management, event tracking, scoring, fantasy golf, and administrative tools.

## Features

### Core Functionality
- **Player Management**: View player profiles, statistics, and handicap information
- **Event Management**: Browse upcoming events, view past results, manage event signups
- **Leaderboard**: Real-time scoring and rankings with point-based system
- **Administrative Tools**: Admin interface for managing players, events, and scoring

### Fantasy Golf System
- **Season-long Fantasy**: Tier-based player selection system
- **Weekly Picks**: Select players from different tiers for each event
- **Fantasy Leaderboard**: Track fantasy scores and standings
- **Player Performance**: Detailed breakdowns of fantasy player performance

### Authentication & User Management
- **OAuth Integration**: Google, Apple, and Facebook login
- **Magic Link Authentication**: Passwordless login via email
- **User Profiles**: Profile management with picture uploads
- **Player Linking**: Connect user accounts to golf league players

### Additional Features
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **PDF Export**: Generate and download event scorecards
- **Print Functionality**: Optimized printing for leaderboards and scorecards
- **Weather Integration**: Event weather information
- **Course Information**: Golf course details with scorecards

## Technology Stack

- **React 19**: Latest React version with concurrent features
- **React Router v7**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API communication
- **jsPDF & html2canvas**: PDF generation and image capture
- **Context API**: State management for authentication and app state

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── EventSignup.js
│   │   ├── LoginModal.js
│   │   ├── Navbar.js
│   │   ├── PlayerProfileModal.js
│   │   └── UserProfile.js
│   ├── context/          # React Context providers
│   │   ├── AuthContext.js
│   │   ├── UnifiedAuthContext.js
│   │   └── UserContext.js
│   ├── pages/            # Page components
│   │   ├── AdminPage.js
│   │   ├── EventsPage.js
│   │   ├── FantasyGolf.js
│   │   ├── FantasyLeaderboard.js
│   │   ├── LeaderboardPage.js
│   │   └── PastEventsPage.js
│   ├── utils/            # Utility functions
│   │   ├── apiConfig.js
│   │   ├── calculateQuota.js
│   │   └── generatePDF.js
│   ├── css/              # Stylesheets
│   │   └── print.css
│   └── App.js            # Main application component
├── .env                  # Environment variables
├── .env.production       # Production environment variables
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API server running
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wankers-league-frontend/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy and edit environment file
   cp .env.example .env
   
   # Set API base URL
   REACT_APP_API_BASE_URL=http://localhost:4000/api
   ```

4. **Start development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

### Development Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject
```

## Configuration

### Environment Variables

#### Development (.env)
```bash
REACT_APP_API_BASE_URL=https://signin.gulfcoasthackers.com/api
```

#### Production (.env.production)
```bash
REACT_APP_API_BASE_URL=/api
```

### API Configuration

The frontend dynamically configures API endpoints based on the environment:

- **Production**: Uses relative paths (`/api`) for same-origin requests
- **Development**: Uses full URLs to backend server
- **Tunnel Access**: Automatically detects tunnel domains

## Key Components

### Authentication System
- **UnifiedAuthContext**: Main authentication provider
- **LoginModal**: OAuth and email login interface
- **UserProfile**: User account management

### Event Management
- **EventsPage**: Event listing and management
- **EventSignup**: Player registration for events
- **AdminPage**: Administrative event management

### Fantasy Golf
- **FantasyGolf**: Fantasy player selection interface
- **FantasyLeaderboard**: Fantasy scoring and standings

### Scoring & Leaderboards
- **LeaderboardPage**: Main scoring display
- **PastEventsPage**: Historical event results

## Production Deployment

### Docker Production
```bash
# Build and start services
docker-compose up -d

# Backend will be available at port 4000
# Frontend will be available at port 3000
# Nginx proxy handles routing
```

### Environment Configuration
Production uses relative API paths and is configured for the domain `wankers.jnew.us`.

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `REACT_APP_API_BASE_URL` environment variable
   - Verify backend server is running
   - Check CORS configuration

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Check OAuth provider configuration
   - Verify JWT token expiration

3. **Build Failures**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## Security

- OAuth tokens handled securely
- No sensitive data in localStorage
- CSRF protection through SameSite cookies
- Production build removes all debug logging

## License

This project is proprietary software for the Wankers League golf organization.

---

**Last Updated**: January 2025
**Version**: 2.0.0
