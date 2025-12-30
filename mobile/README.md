# Cajero Expo

A modern Point of Sale (POS) mobile application built with Expo and React Native, featuring offline capabilities with SQLite and comprehensive management features.

## Features

- **Dashboard**: Real-time sales overview and analytics.
- **Product Management**: Manage products, categories, and ingredients.
- **Stock Management**: Track inventory and ingredient usage.
- **Expense Tracking**: Record and monitor business expenses.
- **Transaction Processing**: Efficient checkout flow with various payment methods.
- **Offline First**: Local SQLite database ensuring functionality without internet.

## Tech Stack

- **Core**: [Expo](https://expo.dev) (~53), [React Native](https://reactnative.dev) (0.79)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Database**: [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [Drizzle ORM](https://orm.drizzle.team)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [Unistyles](https://github.com/jpudysz/react-native-unistyles)
- **Forms**: [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev)
- **Tooling**: [Biome](https://biomejs.dev)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Yarn or npm
- iOS Simulator or Android Emulator (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd cajero-expo
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

## Usage

### Running the App

Start the development server:

```bash
yarn start
```

Run on specific platforms:

```bash
# Run on iOS
yarn ios

# Run on Android
yarn android

# Run on Web
yarn web
```

### Linting & Formatting

This project uses Biome for linting and formatting.

```bash
# Check for linting errors
yarn lint

# Format code
yarn format
```

## Project Structure

```
cajero-expo/
├── app/              # Expo Router pages and layouts
├── components/       # Reusable UI components
├── db/               # Database schema and migrations (Drizzle)
├── services/         # API services and mutations
├── store/            # Global state stores (Zustand)
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
└── ...
```
