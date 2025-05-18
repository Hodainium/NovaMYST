# NovaMyst: Gamified Task Manager

NovaMyst is a gamified productivity web app designed to help users build better habits and complete tasks in a more engaging way. The system integrates a point-based XP system, leaderboards, character customization, and AI-assisted task difficulty classification using Google Gemini.

## Table of Contents

- [Technologies and Packages](#technologies)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Deployment](#deployment)

## Technologies and Packages

### React  
Frontend framework that handles client-side routing (`react-router-dom`) and UI.

### Vite  
Build tool and development server to run the website locally for testing.

### Firebase  
Backend cloud computing service used to authenticate users and host our database.

### Node.js  
Tool that uses JavaScript to build server-side applications.

### Express  
Lightweight web framework for Node.js that simplifies building APIs and handling HTTP requests and responses.

### TypeScript  
A strongly typed programming language that builds on JavaScript by adding static type definitions.

### Firebase Admin  
A backend SDK that allows server-side applications to securely interact with Firebase services, such as managing users, reading/writing to Firestore, and sending notifications, without relying on client-side permissions.

#### Firestore  
A scalable, flexible NoSQL cloud database from Firebase that stores data in collections and documents, allowing for real-time updates, offline support, and efficient querying for web and mobile apps.

## Dependencies

### Backend (Runtime)

- **bcrypt** – Library for hashing passwords securely.
- **bcryptjs** – JavaScript implementation of bcrypt for environments where native bindings aren’t available.
- **cors** – Middleware to enable Cross-Origin Resource Sharing for secure API consumption.
- **dotenv** – Loads environment variables from a `.env` file into `process.env`.
- **express** – Web framework for handling HTTP requests and building APIs.
- **firebase-admin** – Admin SDK for securely accessing Firebase services from server environments.
- **node-cron** – Allows scheduling of tasks (e.g., monthly resets) using cron syntax.
- **node-fetch** – Lightweight `fetch` API implementation for Node.js (used to call external services like Gemini AI).

### Backend (Development)

- **@types/\*** – TypeScript type definitions for the above libraries to support IntelliSense and type safety.
- **concurrently** – Allows running multiple commands in parallel (e.g., `tsc` and `nodemon`).
- **nodemon** – Monitors file changes and restarts the server automatically during development.
- **ts-node** – Allows running TypeScript files directly without compiling.
- **typescript** – Compiler for writing typed JavaScript code.

### Frontend (Runtime)

- **axios** – Promise-based HTTP client used to make API requests to the backend.
- **bootstrap** – CSS framework for responsive design and prebuilt UI components.
- **firebase** – Client SDK to handle user authentication and interaction with Firebase services.
- **lucide-react** – Icon library for clean, customizable SVG icons.
- **react** – Library for building user interfaces with component-based architecture.
- **react-dom** – Allows React to interact with the browser DOM.
- **react-modal** – Provides modal dialog components in React.
- **react-router-dom** – Handles client-side routing/navigation for React apps.

### Frontend (Development)

- **@vitejs/plugin-react** – Adds React support to Vite.
- **@types/\*** – TypeScript definitions for React and DOM elements.
- **eslint** – Linter for maintaining consistent code style and catching errors.
- **eslint-plugin-react / react-hooks / react-refresh** – ESLint plugins for React and hot module reloading.
- **globals** – Provides global variables used in ESLint rules.
- **vite** – Development server and bundler optimized for speed and modularity.


## Installation

To run the project locally, you'll need to install dependencies for both the frontend and backend.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

---

### 1. Set up the Frontend

```bash
cd frontend
npm install
npm run dev
```
### 2. Set up the Backend
```bash
cd backend
npm install
npm run build      # This will create the dist/ directory to run typescript files as javascript
npm run dev        # Runs server with live reload using ts-node and nodemon
```
## Deployment
