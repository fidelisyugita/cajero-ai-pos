# 🔌 Troubleshooting & FAQ

This document addresses common development challenges, network bridging for mobile emulators, Bluetooth hardware permissions, database inspection, and port conflict resolution.

---

## 📱 Mobile & Hardware Troubleshooting

### 1. Android Emulator Cannot Reach Backend (`Network Error`)
- **Root Cause**: An Android emulator runs in an isolated virtual network where `localhost` refers to the emulator itself, not your host development machine.
- **Solution**: Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to:
  ```env
  EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
  ```
- **Physical Device over Wi-Fi**: If running on a physical tablet or phone connected to the same Wi-Fi network, use your computer's local LAN IP (e.g. `http://192.168.1.50:8080/api`).

---

### 2. Bluetooth Thermal Printer Discovery Fails
- **Root Cause**: Android 12+ (API 31+) requires runtime permissions for nearby devices and Bluetooth scanning.
- **Checklist**:
  1. Verify the thermal printer is powered on and in discovery/pairing mode.
  2. In Android Device Settings, verify **Location Services** and **Bluetooth** are turned ON.
  3. Ensure app permissions for **Nearby Devices** (`BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`) and **Location** are granted.
  4. In the app, navigate to **Settings $\rightarrow$ Printer** and tap **Scan for Printers**.

---

### 3. ADB Device Lost Connection
- **Symptom**: `yarn android` fails with `device unauthorized` or `device offline`.
- **Solution**: Restart the Android Debug Bridge server:
  ```bash
  cd mobile
  yarn restart-adb
  ```

---

### 4. Inspecting SQLite Database with Drizzle Studio
- The mobile app includes `expo-drizzle-studio-plugin` for real-time visual table inspection in your browser:
  1. Start the Metro bundler:
     ```bash
     cd mobile
     yarn start
     ```
  2. Press <kbd>Shift</kbd> + <kbd>d</kbd> in the Expo terminal window.
  3. Drizzle Studio will launch in your default web browser, allowing you to browse orders, product catalogs, and migrations directly.

---

## ⚙️ Backend & Docker Troubleshooting

### 1. Database Connection Refused (`Connection to localhost:5432 refused`)
- **Checklist**:
  1. Ensure the PostgreSQL container is running:
     ```bash
     docker-compose ps
     ```
  2. If the container stopped unexpectedly, inspect logs:
     ```bash
     docker-compose logs -f postgres
     ```
  3. Verify database credentials in `backend/.env` match `docker-compose.yml`.

---

### 2. Port Conflicts (8080, 5432, or 5173 Already in Use)
- **Check for occupying processes**:
  ```bash
  # Check port 8080 (Backend)
  lsof -i :8080

  # Check port 5432 (PostgreSQL)
  lsof -i :5432

  # Check port 5173 (Frontend Vite)
  lsof -i :5173
  ```
- **Perform Clean Restart**: Use the repository cleanup script to tear down conflicting containers and restart fresh:
  ```bash
  ./clean-start.sh
  ```

---

## 💻 Code Formatting & Linting FAQ

### Why are my Prettier / ESLint extensions conflicting with Biome in Mobile?
- The mobile workspace exclusively uses **Biome** (`biome.json`) for sub-second formatting and linting.
- Disable the Prettier extension for the `mobile/` workspace in your IDE or set Biome as the default formatter for `*.ts` and `*.tsx` files.
- Run `yarn lint:fix` inside `mobile/` before committing.
