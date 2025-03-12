# URL Shortener - Full Stack Application

A scalable URL shortener web application with a modern UI, secure authentication, and analytics.

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM for database interactions
- PostgreSQL for data storage
- JWT for authentication
- Swagger for API documentation
- Docker for containerization

## Features

- User registration and authentication with JWT
- Create, manage, and delete shortened URLs
- Track URL usage with analytics
- RESTful API with Swagger documentation
- Rate limiting to prevent abuse
- Containerized with Docker

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ and npm (for local development without Docker)
- PostgreSQL (for local development without Docker)

### Installation & Setup

#### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Create a `.env` file in the backend directory from the example:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Build and start the containers:
   ```bash
   docker compose up
   ```

4. The application should now be running at:
    - Backend API: http://localhost:3001/api
    - Swagger Documentation: http://localhost:3001/api

#### Option 2: Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. Configure your PostgreSQL connection in the `.env` file

4. Start the backend server:
   ```bash
   npm run start:dev
   ```

5. The backend should now be running at http://localhost:3001/api

## API Documentation

The API documentation is available via Swagger UI at:
- http://localhost:3001/api

## Backend API Endpoints

| Method | Endpoint                  | Description                  | Authentication |
|--------|---------------------------|------------------------------|----------------|
| POST   | /api/auth/register        | Register a new user          | Public         |
| POST   | /api/auth/login           | Login and get JWT tokens     | Public         |
| POST   | /api/auth/refresh         | Refresh access token         | JWT Refresh    |
| POST   | /api/auth/logout          | Logout                       | JWT            |
| GET    | /api/auth/me              | Get current user info        | JWT            |
| POST   | /api/shorten              | Create a shortened URL       | JWT            |
| GET    | /api/auth/google          | Initial google OAuth         | JWT            |
| GET    | /api/auth/google/callback | Google OAuth callback        | JWT            |
| GET    | /api/urls                 | List all user's URLs         | JWT            |
| DELETE | /api/urls/:shortCode      | Delete a shortened URL       | JWT            |
| GET    | /api/analytics/:shortCode | Get URL analytics            | JWT            |
| GET    | /api/analytics            | Get user's overall analytics | JWT            |

## Testing with Postman

1. Register a new user
2. Login to get your JWT tokens
3. Set the Authorization header for authenticated requests
4. Create and manage your shortened URLs

## Running Tests

Make sure you have the test scripts in your package.json:

```
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

```bash
# Run unit tests
npm run test

```

## Docker Environment

The Docker setup includes:
- NestJS backend service
- PostgreSQL database
- (Frontend service to be added)

To customize ports or environment variables, edit the `docker-compose.yml` and `.env` files.

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
    - Check PostgreSQL credentials in `.env`
    - If using Docker, ensure the PostgreSQL container is running

2. **JWT Token Issues**:
    - Set strong, unique secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
    - Ensure proper token inclusion in Authorization header

3. **CORS Issues**:
    - Add your frontend URL to FRONTEND_URL in `.env`

4. **Docker Architecture Issues**:
    - If experiencing `Exec format error` with native modules like argon2, try rebuilding with:
      ```bash
      docker compose build --no-cache
      ```

## Deployment

The application can be deployed to various cloud platforms:

### Railway (Recommended for Backend)
1. Connect your GitHub repository to Railway
2. Configure environment variables
3. Deploy the application

