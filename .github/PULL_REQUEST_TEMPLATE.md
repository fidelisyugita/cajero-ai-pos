## 📝 Summary & Motivation
<!-- Provide a concise explanation of what changes this PR introduces and why they are needed. -->

---

## 🔍 Key Changes Breakdown
<!-- Group your changes logically by subsystem or feature area (e.g. mobile, frontend, backend, shared). -->
- **Component / Service**: 
- **Component / Service**: 

---

## 🧪 Verification & Test Evidence
<!-- Describe the manual or automated tests conducted to verify the changes. Include test counts or commands run. -->
- [ ] Automated tests passed:
  - `mobile/`: `yarn test`, `yarn lint`, `yarn lint:hygiene`
  - `frontend/`: `yarn build`, `yarn lint`
  - `backend/`: `./gradlew test`
- [ ] Manual verification completed:
  <!-- Summarize manual checks (e.g., tested on iOS simulator/Android device, verified sync flow) -->

---

## 🔗 Related Issues & Tasks
<!-- Link any relevant GitHub issues or Trello cards -->
- Resolves #
- Trello Task: 

---

## 📋 Quality & Safety Checklist
- [ ] Conventional Commit title format (e.g., `feat(mobile): ...`, `fix(backend): ...`, `refactor: ...`)
- [ ] No hardcoded secrets, API keys, or uncommitted `.env` files
- [ ] No raw `console.log` / `console.error` in production mobile code (`Logger` used)
- [ ] Lockfiles intact (`yarn.lock` only, no `package-lock.json` or `pnpm-lock.yaml`)
- [ ] No disabled (`.skip`) or weakened tests
