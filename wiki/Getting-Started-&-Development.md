# 🚀 Getting Started & Local Development

This guide provides step-by-step instructions for configuring your local development workstation, launching services via Docker Compose, running native clients, and adhering to monorepo engineering standards.

---

## 📋 System Prerequisites

Before contributing to the repository, ensure your environment meets the following requirements:

| Tool | Version Requirement | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (LTS recommended) | JavaScript/TypeScript runtime for Web & Mobile |
| **Yarn Berry** | `v4.x` (configured in repo) | Strict package manager for `/frontend` and `/mobile` |
| **Java Development Kit (JDK)** | `JDK 17` (e.g. Eclipse Temurin) | Backend service and Android native compilation |
| **Docker & Docker Compose** | Latest Desktop version | Containerized database and backend services |
| **Android Studio** | Latest (API 34+ SDK) | Android Emulator & build tools for POS testing |
| **Xcode** | Latest (macOS only) | iOS / iPad simulator testing |

> [!CAUTION]
> **Strict Package Manager Guardrail**:
> - Always use **`yarn`** for all operations in `/mobile` and `/frontend`.
> - **NEVER** run `npm`, `npx`, or `pnpm` in this repository.
> - Never commit `package-lock.json` or `pnpm-lock.yaml`.

---

## 🐳 Quick Start with Docker Compose

The fastest way to stand up the complete backend ecosystem (PostgreSQL database and Spring Boot API) is using Docker Compose:

```bash
# From the repository root
docker-compose up --build -d
```

### Inspecting Local Endpoints
- **API Base URL**: `http://localhost:8080/api`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html` (Default credentials: `admin` / `admin123`)
- **OpenAPI v3 Specification**: `http://localhost:8080/v3/api-docs`
- **PostgreSQL Database**: `localhost:5432` (Database: `cajero`, User: `postgres`, Password: `password`)

---

## 🛠️ Service-by-Service Development

### 1. ⚙️ Backend API (`/backend`)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Run all unit and integration tests
./gradlew test

# Start the Spring Boot application locally
./gradlew bootRun

# Build executable JAR without running tests
./gradlew clean build -x test
```

### 2. 💻 Web Admin Portal (`/frontend`)

```bash
cd frontend

# Install dependencies with Yarn Berry
yarn install

# Start Vite hot-reloading dev server (http://localhost:5173)
yarn dev

# Run typecheck and ESLint
yarn lint

# Build production bundle for deployment
yarn build
```

### 3. 📱 Mobile POS Terminal (`/mobile`)

> [!IMPORTANT]
> **Native Dev Client Required**: Because the mobile application uses native Bluetooth Low Energy (`react-native-ble-plx`) and SQLite (`expo-sqlite`), it **must** be run using the Expo Dev Client / prebuild (`yarn android` or `yarn ios`), rather than plain Expo Go.

```bash
cd mobile

# Install dependencies with Yarn Berry
yarn install

# Copy environment template
cp .env.example .env

# Start Expo Metro bundler
yarn start

# Launch on Android Emulator or connected USB device
yarn android

# Launch on iOS Simulator (macOS only)
yarn ios

# Clean native Android cache and rebuild
yarn android:clean
```

---

## 🔐 Environment Variables Master Reference

### Backend (`/backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/cajero` |
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database user password | `password` |
| `JWT_SECRET_KEY` | 256-bit secret string for signing JWT tokens | `<strong-random-key>` |
| `JWT_EXPIRATION_MS` | JWT validity duration in milliseconds | `86400000` (24 hours) |
| `GROQ_API_KEY` | Groq Cloud API Key for AI service | `gsk_...` |
| `ORACLE_CLOUD_BUCKET_NAME` | OCI Object Storage bucket name | `cajero-assets` |
| `ORACLE_CLOUD_COMPARTMENT_ID` | OCI Compartment ID | `ocid1.compartment...` |

### Web Admin (`/frontend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API gateway URL | `http://localhost:8080/api` |

### Mobile POS (`/mobile/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | API endpoint for native app | `http://10.0.2.2:8080/api` *(Android Emulator)* |
| `EXPO_PUBLIC_DEV_STAFF_EMAIL` | Default cashier email for quick dev login | `staff@cajero.local` |
| `EXPO_PUBLIC_DEV_STAFF_PASSWORD` | Default cashier password | `password123` |
| `EXPO_PUBLIC_DEV_OWNER_EMAIL` | Default owner email for quick dev login | `owner@cajero.local` |
| `EXPO_PUBLIC_DEV_OWNER_PASSWORD` | Default owner password | `password123` |

---

## 🧹 Code Hygiene & Standards

### Mobile Linting & Formatting (Biome)
The mobile workspace uses [Biome](https://biomejs.dev) for sub-second formatting and linting:

```bash
cd mobile

# Check formatting and linting
yarn lint

# Auto-fix lint and formatting violations
yarn lint:fix

# Check formatting without modifying files
yarn format:check

# Run unit tests with Jest
yarn test
```

### Strict Quality Rules
1. **No Raw Console Logs**: Use centralized `Logger` from `@/services/logger` instead of `console.log` in mobile production code.
2. **Responsive Scaling**: Never hardcode raw pixel values. Always wrap spacing and dimensions with `@/utils/Scale` helpers (`s()`, `vs()`, `ms()`).
3. **Design Tokens**: Never use ad-hoc hex colors. Always reference theme tokens (`theme.colors.*`).
4. **Centralized Date Helper**: Never import `dayjs` or `moment` directly. Always import date utilities from `@/utils/Date`.
5. **Cognitive Complexity**: Max complexity threshold is **10** for business logic and **15** for UI components.
