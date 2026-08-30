# 📱 Mobile POS Terminal

The **Cajero Mobile POS** application is a landscape-first, touch-optimized Point of Sale client built with **React Native (New Architecture)** and **Expo SDK 53**. Designed for fast-paced retail and dining environments, it guarantees zero-latency cashier operations through a local-first SQLite database and Bluetooth ESC/POS thermal printing.

---

## 🏗️ Core Architecture & Data Flows

### 1. Offline-First Architecture & Sync Queue

The mobile application operates on a **local-first principle**: all product catalog lookups, cart modifications, and transaction completions write directly to the local SQLite database first to ensure zero UI delay. Syncing with the Spring Boot backend occurs asynchronously in the background.

```mermaid
flowchart TD
    Cashier([👤 Cashier]) -->|Touch / Scan / Cart Action| UI[Expo Router UI]
    
    UI -->|Immediate Reactive Read/Write| Zustand[Zustand Store + MMKV Cache]
    UI -->|Persist Order & Inventory Deduction| SQLite[(Local SQLite DB via Drizzle ORM)]
    
    SQLite -->|Immediate Success Feedback| UI
    SQLite -->|Enqueue Sync Task| SyncQueue[Sync Queue Manager]
    
    SyncQueue -->|Network Connected| CloudAPI[Spring Boot Core API]
    CloudAPI -->|Sync Acknowledgement| SyncQueue
    SyncQueue -->|Update Sync Status: COMPLETED| SQLite
    
    SyncQueue -.->|Offline / Connection Error| RetryBuffer[Persistent Retry Buffer]
    RetryBuffer -.->|When Online Reconnected| CloudAPI
```

### 2. Checkout & ESC/POS Bluetooth Thermal Printing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Cashier
    participant Screen as POS Checkout Screen
    participant DB as Local Drizzle SQLite
    participant Encoder as esc-pos-encoder
    participant BLE as Bluetooth Manager (ble-plx)
    participant Printer as Thermal Printer (58mm/80mm)

    Cashier->>Screen: Tap 'Confirm Payment' (Cash/Card/QRIS)
    Screen->>DB: Save Order, Update Shift Summary, Decrement Stock
    DB-->>Screen: Transaction Saved (#ORD-XXXX)
    
    alt Auto-Print Enabled
        Screen->>Encoder: Format Receipt Byte Stream (Header, Items, Taxes, Discounts, Cut)
        Encoder-->>Screen: Raw ESC/POS Commands (Uint8Array)
        Screen->>BLE: Send Byte Stream in Chunks (MTU Size: 20-512 bytes)
        BLE->>Printer: Write Characteristic Packets
        Printer-->>Cashier: Physical Receipt Output
    end

    Screen-->>Cashier: Show Success Dialog & Clear Active Cart
```

---

## 💾 State & Storage Hierarchy

```mermaid
graph LR
    subgraph StorageLayers["State & Storage Layers"]
        MMKV["1. MMKV Storage\nTokens, Sessions, Printer UUIDs\nSynchronous C++ JSI Speed"]
        ZustandStore["2. Zustand Reactive Stores\nCart, Active User, Dynamic Discounts\nFine-grained Subscriptions"]
        DrizzleSQLite["3. Drizzle ORM + SQLite\nFull Product Catalog, Orders, Shift History\nRelational & Offline-Resilient"]
        TanStackQuery["4. TanStack Query Cache\nRemote Server Mutations & REST Cache\nOptimistic Updates & Stale-While-Revalidate"]
    end
    
    MMKV <--> ZustandStore
    ZustandStore <--> DrizzleSQLite
    DrizzleSQLite <--> TanStackQuery
```

1. **`react-native-mmkv` (v3)**: High-speed, synchronous key-value storage used for persistent authentication tokens, active cashier sessions, selected printer UUIDs, and UI preferences.
2. **`zustand` (v5)**: Reactive state management stores:
   - `useOrderStore`: Current cart items, dynamic discount calculations, tax/service fees.
   - `useAuthStore`: Active employee profile and session tokens.
   - `usePrinterStore`: Connected BLE printer device, paper width (58mm vs. 80mm), and auto-cut settings.
   - `useAIStore`: AI assistant chat sessions and prompt context.
3. **`drizzle-orm` (v0.44.4) + `expo-sqlite` (v16)**: Strongly-typed relational database with schema auto-migrations in `db/migrations/`.
4. **`@tanstack/react-query` (v5)**: Server state management for remote catalog synchronization and analytics queries.

---

## 🎨 Design System & Theming (`react-native-unistyles`)

The application uses `react-native-unistyles` v3 for performant, stylesheet-based styling with strict adherence to design tokens:

### Responsive Scaling Helpers
All spacing, typography, and layout dimensions must use responsive scaling helpers from `@/utils/Scale`:
- `s(value)`: Horizontal scaling (based on standard tablet width).
- `vs(value)`: Vertical scaling (based on standard tablet height).
- `ms(value, factor)`: Moderate scaling for typography and icon dimensions.

### Design Tokens
Tokens are centralized in `tokens/`:
- `theme.colors.*`: Brand primary, background, surface, text, border, status badges.
- `theme.spacing.*`: Consistent padding and margins (`xs`, `sm`, `md`, `lg`, `xl`).
- `theme.radius.*`: Standard corner rounding for touch targets.

---

## 🖨️ Hardware & Bluetooth Integration

### Supported Printers
- Any **58mm** or **80mm** ESC/POS compatible Bluetooth Low Energy thermal printer.

### Bluetooth Lifecycle Management
1. **Discovery**: `react-native-ble-plx` scans for nearby BLE devices advertising serial or printer services.
2. **Connection & MTU Negotiation**: Connects to the peripheral and discovers primary communication characteristics.
3. **Chunked Transmission**: Large receipt payloads are sliced into manageable byte chunks based on negotiated MTU sizes to prevent buffer overflow on low-cost thermal printer chipsets.

---

## 📊 Telemetry & Monitoring

- **Sentry (`@sentry/react-native`)**: Real-time crash reporting, unhandled promise rejections, and performance tracing.
- **PostHog (`posthog-react-native`)**: Product analytics, feature flag evaluation, and cashier funnel tracking.
- **Automated Sourcemap Uploads**: Run via `scripts/upload-sourcemaps.js` during release builds to ensure de-minified stack traces in Sentry.

---

## 🧪 Testing & Verification

### Unit & Component Tests (Jest & RNTL)
```bash
cd mobile
yarn test
yarn test:coverage
```

### End-to-End Testing (Maestro)
Automated flows are located in `.maestro/`:
```bash
cd mobile

# Run complete sign-in and checkout flows
yarn maestro:test

# Launch visual flow studio
yarn maestro:studio
```

---

## 🏷️ Version Bumping

Bumping updates `package.json`, `app.json`, and native Android `versionCode`:
```bash
cd mobile
yarn bump:patch   # e.g., 1.0.7 -> 1.0.8 (Bug fixes)
yarn bump:minor   # e.g., 1.0.7 -> 1.1.0 (New features)
yarn bump:major   # e.g., 1.0.7 -> 2.0.0 (Breaking changes)
```
