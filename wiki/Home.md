# 🤖 Welcome to the Cajero AI POS Wiki

> **Cajero AI POS** is an enterprise-ready, full-stack Point of Sale (POS) ecosystem powered by Artificial Intelligence. It combines an offline-first mobile cashier terminal, a web administration dashboard, and a robust Spring Boot microservice backend integrated with Large Language Models (LLMs) for real-time business insights.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg)](https://react.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.79.5-61DAFB.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_53-000020.svg)](https://expo.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2F16-336791.svg)](https://www.postgresql.org)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.1-F55036.svg)](https://groq.com)

---

## 🗺️ Ecosystem Architecture Overview

The repository is structured as a cohesive monorepo housing three core engineering sub-workspaces:

```mermaid
graph TB
    subgraph MobileTerminal["📱 Mobile POS Client (/mobile)"]
        UI[Expo Router UI / Unistyles]
        SQLite[(Offline SQLite DB / Drizzle)]
        BLE[BLE Thermal Printer Engine]
        SyncQ[Sync Queue & Retry Buffer]
    end

    subgraph WebAdmin["💻 Web Admin Portal (/frontend)"]
        ReactUI[React 19 + Vite + Tailwind]
        AdminState[Zustand & TanStack Query]
    end

    subgraph CoreBackend["⚙️ Core Backend Service (/backend)"]
        SpringBoot[Spring Boot 3.5 API]
        Security[Spring Security + JWT]
        AIConnector[Groq LLM Connector]
        Caffeine[Caffeine In-Memory Cache]
    end

    subgraph DataAndCloud["☁️ Data & Cloud Infrastructure"]
        Postgres[(PostgreSQL Database)]
        OCI[Oracle Cloud Object Storage]
        GroqCloud[Groq Cloud AI Llama 3.1]
    end

    UI --> SQLite
    UI --> BLE
    UI --> SyncQ
    SyncQ -->|REST / HTTPS| SpringBoot

    ReactUI --> AdminState
    AdminState -->|REST / HTTPS| SpringBoot

    SpringBoot --> Security
    SpringBoot --> Postgres
    SpringBoot --> Caffeine
    SpringBoot --> AIConnector
    SpringBoot --> OCI
    AIConnector --> GroqCloud
```

---

## 📚 Wiki Documentation Chapters

Explore the deep-dive documentation for each subsystem:

### 🏛️ Core Architecture & Setup
- **[[System-Architecture]]** — High-level topology, monorepo breakdown, cross-tier communication protocols, and technology stack matrix.
- **[[Getting-Started-&-Development]]** — Prerequisites, Docker Compose one-step setup, workspace developer commands, environment variables, and code hygiene rules.

### 📱 Subsystem Deep Dives
- **[[Mobile-POS-Terminal]]** — React Native & Expo SDK 53 New Architecture, offline Drizzle SQLite sync, BLE ESC/POS thermal printing, Unistyles design system, and Sentry telemetry.
- **[[Backend-&-AI-Services]]** — Spring Boot 3.5 REST API, Spring Security JWT authentication, Groq AI analytics integration, PostgreSQL schema, and OCI Object Storage.
- **[[Web-Admin-Portal]]** — React 19, Vite, Tailwind CSS v4, feature-sliced store management (catalog, inventory, petty cash, transactions, audit logs).

### 🚀 Operations & Troubleshooting
- **[[DevOps-&-CI-CD]]** — GitHub Actions pipelines, multi-package SemVer release tagging, standalone Android APK generation, and Sentry sourcemap uploads.
- **[[Troubleshooting-&-FAQ]]** — Android emulator networking (`10.0.2.2`), BLE printer pairing on Android 12+, Drizzle Studio database inspection, and common developer FAQs.

---

## ⚡ Quick Navigation Matrix

| Component | Directory | Primary Framework | Key Commands |
| :--- | :--- | :--- | :--- |
| **Backend** | `/backend` | Java 17 + Spring Boot 3.5 | `./gradlew bootRun` • `./gradlew test` |
| **Admin Web** | `/frontend` | React 19 + Vite + Tailwind | `yarn dev` • `yarn build` • `yarn lint` |
| **Mobile POS** | `/mobile` | Expo SDK 53 + React Native 0.79 | `yarn start` • `yarn android` • `yarn test` |
| **Ecosystem** | Root `/` | Docker Compose & Monorepo Tooling | `docker-compose up --build -d` |
