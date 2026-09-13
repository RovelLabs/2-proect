<div align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Skladno Logo" />
  <h1>Skladno (Складно)</h1>
  <p><strong>Split bills, parties, and SBP debts effortlessly with your crew.</strong></p>
  <p>An ultra-fast, local-first group expense splitter with algorithmic debt graph minimization, SBP (Fast Payments System) deep links, and zero-login Telegram share cards.</p>

  <p>
    <a href="https://github.com/RovelLabs/2-proect/actions"><img src="https://img.shields.io/badge/CI-Passing-10B981?style=flat-square&logo=githubactions&logoColor=white" alt="CI Status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-38BDF8?style=flat-square" alt="License" /></a>
    <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Local--First-100%25-A3E635?style=flat-square" alt="Local First" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Privacy-Zero--Data--Stored-10B981?style=flat-square" alt="Privacy" /></a>
    <a href="README.md"><img src="https://img.shields.io/badge/Lang-Русский-10B981?style=flat-square" alt="Russian README" /></a>
  </p>
</div>

---

## 📸 Interface Screenshots

<div align="center">
  <p><strong>Desktop (1440×900)</strong></p>
  <img src="docs/screenshots/desktop_1440x900.png" width="85%" alt="Skladno Desktop Interface" />
  
  <br/><br/>

  <p><strong>Mobile (390×844) & SBP Instant Settlement</strong></p>
  <img src="docs/screenshots/mobile_390x844.png" width="30%" alt="Mobile View" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/modal_sbp.png" width="30%" alt="SBP & QR Modal" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/modal_share.png" width="30%" alt="Telegram Sharing" />
</div>

---

## 📦 Releases (Windows, macOS, Android)

You can download and run Skladno on any device:

| Platform | Format | Download | Guide |
|---|---|---|---|
| **💻 Windows** | Portable Zip (x64) | [**`Skladno-v0.1.0-windows-x64.zip`**](releases/Skladno-v0.1.0-windows-x64.zip) | Unzip and launch `Skladno.vbs` |
| **🍎 macOS** | Standalone .app Bundle | [**`Skladno-v0.1.0-macos-universal.zip`**](releases/Skladno-v0.1.0-macos-universal.zip) | Drag `Skladno.app` to Applications |
| **📱 Android** | APK & Native Project | [**`Skladno-v0.1.0-android-project.zip`**](releases/Skladno-v0.1.0-android-project.zip) | GitHub Releases APK or Android Studio |

> 📖 Installation & build guide: [**docs/releases.md**](docs/releases.md)

---

## ⚡ Why Skladno?

Teens and students in CIS frequently hang out together: ordering pizza, playing board games, going to the movies, partying, living in dorms, and traveling.

However, splitting expenses usually turns into an awkward mess:
1. **Splitwise has become unusable**: it introduced an aggressive 3-expense/day paywall, full-screen ads, and its paid subscription cannot be purchased with CIS bank cards.
2. **Traditional banking apps are one-way**: "Money pools" in banking apps only allow collecting a fixed sum to a single account; they cannot resolve multi-payer debt graphs.
3. **Awkward debt tracking**: friends forget who owes what, leading to uncomfortable reminders in chat or quiet members losing thousands of rubles.

**Skladno settles everything in under 30 seconds:**
- **Zero Login:** open the web app and start using it immediately.
- **Minimal Debt Graph ($O(N \log N)$):** turns 15 messy pairwise debts into 2–3 clean transfers.
- **1-Tap SBP Integration:** phone copy, bank selector (T-Bank, Sber, Alfa, VTB, Kaspi, etc.), and instant dynamic QR code.
- **Viral Telegram Sharing:** 1 click formats a neat summary card and sends it directly to your group chat.

---

## 🛠️ Quickstart

```bash
# Clone the repository
git clone https://github.com/RovelLabs/2-proect.git
cd 2-proect

# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests and typecheck
npm run typecheck
npm run test

# Build production bundle
npm run build
```

---

## 🐳 Docker

```bash
docker build -t skladno:latest .
docker run -d -p 8080:80 skladno:latest
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).  
Copyright (c) 2026 RovelLabs & Skladno Contributors.
