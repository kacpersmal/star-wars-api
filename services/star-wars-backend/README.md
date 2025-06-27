# Star Wars API Backend

A NestJS-based REST API for managing Star Wars universe data including characters, episodes, and species. And some totally overengineered stuff :)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start infrastructure services:**

```bash
docker-compose up -d
```

4. **Update db:**

```bash
npm run db:push
```

5. **Start the application:**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📋 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run db:generate        # Generate database migrations
npm run db:migrate         # Run database migrations
npm run db:studio          # Open Drizzle Studio

# Testing
npm test                   # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format code with Prettier
```

## 🏗️ Architecture

The project follows a modular architecture with three main directories:

- **[`src/features/`](src/features/README.md)** - Business logic modules (characters, episodes, species)
- **[`src/shared/`](src/shared/README.md)** - Infrastructure and utilities (database, redis, config, errors)
- **[`src/system/`](src/system/README.md)** - System-level modules (health checks, swagger)

### Feature Modules

This project showcases two different architectural patterns:

- **Traditional Service Pattern** - Simple controller → service → repository flow
- **CQRS Pattern** - Command/Query separation with dedicated handlers

See [Features README](src/features/README.md) for detailed comparison.

## 📚 API Documentation

Once running, visit:

- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **Validation**: Joi + class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

Development with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```
