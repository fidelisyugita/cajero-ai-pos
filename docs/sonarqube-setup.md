# SonarQube Setup with Podman for Mobile Code Quality

This guide explains how to run SonarQube locally using **Podman** and analyze code quality, security hotspots, code smells, and test coverage for the React Native mobile app (`mobile/`).

---

## 🏗 Architecture Overview

- **Engine**: SonarQube Community Edition (`sonarqube:lts-community`)
- **Container Runtime**: Podman
- **Persistence**: Named Podman volumes (`cajero_sonarqube_data`, `cajero_sonarqube_extensions`, `cajero_sonarqube_logs`)
- **Port**: `9000` (`http://localhost:9000`)
- **Scanner**: `sonarqube-scanner` in `mobile/` configured via `mobile/sonar-project.properties`
- **Coverage Source**: Jest LCOV report (`mobile/coverage/lcov.info`)

---

## 🚀 Quick Start

### 1. Start the SonarQube Container

From the repository root, start SonarQube with:

```bash
yarn sonarqube:start
# or directly:
./scripts/sonarqube.sh start
```

> [!NOTE]
> On macOS, the script will automatically check if the Podman VM (`podman machine`) is running and start it if needed. Initial startup takes ~30-60 seconds for Elasticsearch and built-in plugins to initialize.

You can monitor startup progress with:

```bash
yarn sonarqube:logs
```

---

### 2. Initial SonarQube Login & Token Generation

1. Open your browser and navigate to **[http://localhost:9000](http://localhost:9000)**.
2. Log in with the default credentials:
   - **Login**: `admin`
   - **Password**: `admin`
3. You will be prompted to change the administrator password.
4. Generate an Analysis Token:
   - Click on your avatar in top-right corner -> **My Account** -> **Security**.
   - Under **Generate Tokens**:
     - Name: `cajero-mobile-scanner`
     - Type: `User Token` (or `Project Analysis Token`)
     - Expires in: No expiration (or your preference)
   - Click **Generate** and copy the generated token (e.g. `sqp_1234567890abcdef...`).

---

### 3. Configure Your Environment

Add your token to `mobile/.env` (or root `.env`):

```bash
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=sqp_your_generated_token_here
```

---

### 4. Run Mobile Code Quality Analysis

To execute Jest unit tests with coverage and trigger the SonarQube scanner in one step:

```bash
# From mobile/ directory:
cd mobile
yarn sonar

# Or from repository root:
yarn sonar:mobile
```

If you already have a fresh coverage report and want to run **only** the scanner:

```bash
cd mobile
yarn sonar:scan
```

Alternatively, pass the token directly as a CLI argument without editing `.env`:

```bash
cd mobile
yarn sonar:scan --token=sqp_your_generated_token_here
```

---

### 5. View Analysis Results

After the scan finishes, open your project dashboard:

👉 **[http://localhost:9000/dashboard?id=cajero-mobile](http://localhost:9000/dashboard?id=cajero-mobile)**

The dashboard displays:
- **Quality Gate Status** (Passed / Failed)
- **Bugs, Vulnerabilities & Security Hotspots**
- **Code Smells & Maintainability Rating**
- **Cognitive Complexity & Duplications**
- **Line & Branch Test Coverage** (from `mobile/coverage/lcov.info`)

---

## 🛠 Container Management Commands

| Command | Action |
| :--- | :--- |
| `yarn sonarqube:start` | Starts the SonarQube container (and Podman machine if needed) |
| `yarn sonarqube:stop` | Stops the SonarQube container |
| `yarn sonarqube:status` | Shows container running status and port mapping |
| `yarn sonarqube:logs` | Streams real-time container logs |
| `yarn sonarqube:clean` | Stops and removes container and persistent volumes (Full reset) |

---

## ⚙️ Configuration Details

- **`mobile/sonar-project.properties`**:
  - `sonar.projectKey`: `cajero-mobile`
  - `sonar.sources`: `app,components,db,hooks,lib,services,store,utils,index.ts`
  - `sonar.tests`: `app,components,db,hooks,lib,services,store,utils`
  - `sonar.test.inclusions`: `**/*.test.ts,**/*.test.tsx,**/__tests__/**`
  - `sonar.exclusions`: `node_modules/**,android/**,ios/**,.expo/**,coverage/**,dist/**,builds/**,...`
  - `sonar.javascript.lcov.reportPaths`: `coverage/lcov.info`
