# Cajero Backend API

A comprehensive Spring Boot backend for a point-of-sale (POS) system with Oracle Cloud integration.

## Features

- **User Management**: Role-based authentication and authorization
- **Product Management**: CRUD operations with variants and categories
- **Transaction Processing**: Complete sales transaction handling
- **AI Chat Integration**: LLM-powered assistant with real-time business context (Groq)
- **Scalable Analytics**: High-performance cached data aggregation for AI context
- **File Storage**: Oracle Cloud Object Storage integration
- **Security**: JWT-based authentication with Spring Security
- **API Documentation**: Swagger/OpenAPI 3.0 documentation
- **Docker Support**: Containerized deployment ready

## Technology Stack

- **Backend**: Java 17, Spring Boot 3.5.0
- **Database**: PostgreSQL 15
- **AI Engine**: Groq API (Llama 3.1 8B Instant)
- **Caching**: Caffeine (In-Memory)
- **Security**: Spring Security, JWT
- **Cloud**: Oracle Cloud Infrastructure (OCI)
- **Documentation**: Swagger/OpenAPI 3.0
- **Build**: Gradle 8.4

## Prerequisites

- Java 17 or higher
- PostgreSQL 15
- Docker (optional)
- Oracle Cloud account (for file storage)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Or manually create PostgreSQL database
createdb cajero
```

### 3. Run Application

#### Option A: Using Docker Compose (Recommended)
```bash
docker-compose up
```

#### Option B: Local Development
```bash
# Install dependencies
./gradlew dependencies

# Run tests
./gradlew test

# Run application
./gradlew bootRun
```

#### Option C: Using JAR
```bash
./gradlew build -x test
java -jar build/libs/app.jar
```

## API Documentation

Once the application is running:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

Credentials for Swagger UI (from .env):
- Username: admin
- Password: admin123

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATASOURCE_URL` | PostgreSQL connection URL | jdbc:postgresql://localhost:5432/cajero |
| `POSTGRES_USER` | Database username | postgres |
| `POSTGRES_PASSWORD` | Database password | password |
| `JWT_SECRET_KEY` | JWT signing secret | - |
| `JWT_EXPIRATION_MS` | JWT expiration time | 86400000 |
| `ORACLE_CLOUD_BUCKET_NAME` | OCI Object Storage bucket | - |
| `ORACLE_CLOUD_COMPARTMENT_ID` | OCI compartment ID | - |
| `GROQ_API_KEY` | Groq API Key for AI service | - |

### Oracle Cloud Setup

1. Create an Oracle Cloud account
2. Set up Object Storage bucket
3. Configure OCI CLI and generate config file
4. Update environment variables in `.env`

## Development

### Project Structure

```
src/main/java/com/huzakerna/cajero/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data transfer objects
├── exception/      # Custom exceptions
├── filter/         # Security filters
├── model/          # JPA entities
├── repository/     # Data repositories
├── security/       # Security components
├── service/        # Business logic
└── util/           # Utilities
```

### Testing

```bash
# Run all tests
./gradlew test

# Run with coverage
./gradlew jacocoTestReport

# View coverage report
open build/reports/jacoco/test/html/index.html
```

### Code Quality

```bash
# Check code style
./gradlew checkstyleMain

# Run static analysis
./gradlew spotbugsMain
```

## Production Deployment

### Using Docker

```bash
# Build production image
docker build -t cajero-backend .

# Run with environment variables
docker run -d \
  --name cajero-backend \
  -p 8080:8080 \
  --env-file .env \
  cajero-backend
```

### Using Docker Compose

```bash
# Production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

- **Health endpoint**: http://localhost:8080/actuator/health
- **Metrics**: http://localhost:8080/actuator/metrics

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify connection string in `.env`

2. **Oracle Cloud authentication failed**
   - Verify OCI config file exists at `~/.oci/config`
   - Check compartment ID and bucket name

3. **JWT authentication issues**
   - Ensure `JWT_SECRET_KEY` is at least 256 bits
   - Check token expiration settings

### Logs

```bash
# View application logs
tail -f logs/cajero.log

# Docker logs
docker-compose logs -f app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.