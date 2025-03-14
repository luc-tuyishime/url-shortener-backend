# URL Shortener

A modern URL shortening service built with React, Vite, and NestJS.

## Live Demo

Frontend: [https://url-shortener-frontend-wine.vercel.app](https://url-shortener-frontend-wine.vercel.app)

Backend API: [https://url-shortener-backend-production-bb28.up.railway.app](https://url-shortener-backend-production-bb28.up.railway.app)

## Features

- Create shortened URLs
- Track URL click analytics
- User authentication
- Custom short URL slugs
- QR code generation

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Deployed on Vercel

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Deployed on Railway

## Local Development

### Prerequisites
- Docker and Docker Compose (for containerized setup)
- Node.js (v16+)
- npm or yarn
- PostgreSQL (for local development without Docker)

### Option 1: Using Docker Compose (Recommended)

This approach runs both the backend and database in containers, simplifying setup.

1. Ensure Docker and Docker Compose are installed and running on your system.

2. Clone the repository:
   ```bash
   git clone https://github.com/luc-tuyishime/url-shortener-backend.git
   cd url-shortener-backend
   ```

3. Create a `.env` file in the backend directory from the example:
   ```bash
   cp backend/.env.example backend/.env
   ```

4. Start the Docker containers:
   ```bash
   docker compose up
   ```

   For detached mode (running in background):
   ```bash
   docker compose up -d
   ```

5. To rebuild containers after making changes:
   ```bash
   docker compose up --build
   ```

6. To stop all containers:
   ```bash
   docker compose down
   ```

7. The application will be available at:
   - Backend API: http://localhost:3001/api
   - Swagger Documentation: http://localhost:3001/api/docs

### Option 2: Local Development Setup

## Docker Environment

The Docker setup includes:
- NestJS backend service
- PostgreSQL database

Docker Compose configuration (`docker-compose.yml`):
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    depends_on:
      - postgres
    environment:
      - NODE_ENV=development
      - PORT=3001
      - BASE_URL=http://localhost:3001
      - FRONTEND_URL=http://localhost:5173
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=url_shortener
      - JWT_ACCESS_SECRET=dev_access_secret
      - JWT_REFRESH_SECRET=dev_refresh_secret
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=url_shortener
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Environment Variables

### Frontend
Create a `.env` file in the frontend directory with:
```
VITE_API_URL=http://localhost:3001
```

### Backend
Create a `.env` file in the backend directory with:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=url_shortener
DB_SSL=false

# Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# Application
PORT=3001
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
SHORT_URL_LENGTH=6

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Deployment

- Frontend is deployed on Vercel
- Backend is deployed on Railway

### Railway Deployment (Backend)
1. Connect your GitHub repository to Railway
2. Configure all required environment variables
3. Deploy the application

## CORS Configuration

The backend is configured to accept requests from the following origins:
- http://localhost:5173 (development)
- https://url-shortener-frontend-wine.vercel.app (production)

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL credentials in `.env`
   - If using Docker, ensure the PostgreSQL container is running

2. **JWT Token Issues**:
   - Set strong, unique secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
   - Ensure proper token inclusion in Authorization header

3. **CORS Issues**:
   - Verify your frontend URL is correctly added to the allowed origins list

4. **Docker Architecture Issues**:
   - If experiencing `Exec format error` with native modules like argon2, try rebuilding with:
     ```bash
     docker compose build --no-cache
     ```

5. **Missing Dependencies in Docker**:
   - If you see errors about missing modules, ensure your Dockerfile properly installs all dependencies:
     ```bash
     docker compose exec backend npm install <package-name>
     ```
   - Or update your Dockerfile to explicitly install the missing package

## License

[MIT](LICENSE)