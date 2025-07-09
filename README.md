# Cajero AI POS System

![Project Architecture](docs/architecture.png)

A modern Point-of-Sale system with AI-powered analytics, built as a monorepo.

## 🚀 Services

| Service    | Tech Stack     | Port | Description                  |
| ---------- | -------------- | ---- | ---------------------------- |
| Backend    | Spring Boot    | 8080 | Core POS business logic      |
| Frontend   | Next.js        | 3000 | Admin dashboard & cashier UI |
| AI Service | FastAPI/Python | 8000 | Recommendation & analytics   |
| Database   | PostgreSQL     | 5432 | Persistent data storage      |

## 🛠 Setup

### Prerequisites

- Docker 20+
- Java 17 (for local backend dev)
- Node 18+ (for frontend)
- Python 3.10+ (for AI service)

### Quick Start

```bash
# Start all services
docker-compose up --build

# Access services:
# - Backend: http://localhost:8080/api
# - Frontend: http://localhost:3000
# - AI Service: http://localhost:8000/docs
```
