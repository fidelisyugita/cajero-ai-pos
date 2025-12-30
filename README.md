# Cajero AI POS System

![Project Architecture](docs/architecture.png)

A modern Point-of-Sale system with AI-powered analytics, built as a monorepo.

## 🚀 Services

| Service    | Tech Stack     | Port | Description                  |
| ---------- | -------------- | ---- | ---------------------------- |
| Backend    | Spring Boot    | 8080 | Core POS logic + AI Chat     |
| Frontend   | React Native   | -    | Mobile POS Application       |
| Database   | PostgreSQL     | 5432 | Persistent data storage      |

## 🛠 Setup

### Prerequisites

- Docker 20+
- Java 17 (for backend dev)
- Node 20+ (for frontend)

### Quick Start

```bash
# Start backend and database
docker-compose up --build -d

# Access services:
# - Backend API: http://localhost:8080/api
# - Swagger UI: http://localhost:8080/swagger-ui.html
```
