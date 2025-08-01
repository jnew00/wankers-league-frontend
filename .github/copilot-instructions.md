---
applyTo: "**/*.{js,jsx,css,html}"
---

# GitHub Copilot Instructions for Wankers League Frontend

## Project Stack

- React 19 (Create React App)
- Tailwind CSS 3
- React Router v7
- Axios for API calls
- Day.js for date utilities
- html2canvas, html-to-image, and jspdf for DOM exports
- UI libraries: sweetalert2, tippy.js, react-select
- Backend API proxied at http://localhost:4000

## Tailwind and Styling Guidelines

- Use Tailwind utility classes over custom CSS
- Group classes logically (layout, spacing, color, effects)
- Use print.css for print/export views
- Minimize global CSS in App.css

## Routing and Component Structure

- Route declarations live in App.jsx using react-router-dom
- Pages are stored in the /pages directory
- Use dedicated components for each route
- Prefer lazy loading for large or infrequently accessed pages

## React Development Practices

- Use functional components and React hooks
- Manage local state with useState; use context or reducers for shared state
- Use useEffect for lifecycle behavior and side effects
- Break large components into smaller, focused units
- Use controlled components for forms
- Avoid anonymous inline functions in JSX when possible
- Use semantic HTML and ARIA attributes for accessibility
- Use Suspense and lazy() for code splitting
- Handle errors with try/catch and fallback UI

## API and Data Handling

- Use Axios for all API calls
- All requests should point to /api/* (proxied to backend)
- Wrap API logic in helper functions when possible
- Include error handling with user feedback via modals or toasts

## Feedback and User Experience

- Use sweetalert2 or similar libraries for UI feedback
- Avoid browser-native alerts unless necessary
- Ensure DOM elements are fully rendered before exporting to image or PDF

## Dev Server Restart Policy

- Copilot must never restart the frontend server automatically
- If a change requires restarting the dev server, prompt the developer with:
  “Please restart the development server manually and confirm when complete before continuing.”
- Wait for confirmation before proceeding

## AI Code Generation Preferences

- Generate complete code with correct imports
- Include inline comments for non-obvious logic
- Follow the existing code style and patterns
- Suggest optimizations or improvements when relevant
- Include error handling and edge cases
- Follow accessibility and semantic HTML standards
- Generate appropriate unit tests when adding new logic

## Code Style and Clean Code Principles

- Use camelCase for variables and functions; PascalCase for components
- Write self-documenting code with clear, meaningful names
- Keep functions small and focused
- Avoid deeply nested or complex conditionals
- Eliminate magic numbers/strings by using constants
- Refactor repeated logic into shared helpers
- Use version control branches for features and fixes
- Write clear commit messages explaining the why, not just the what
- Use linters and formatters for consistent code style
- Document complex components or utilities separately when needed