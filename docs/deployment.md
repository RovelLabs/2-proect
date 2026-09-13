# Руководство по развертыванию: «Складно» (Skladno)

«Складно» разработан так, чтобы его можно было запустить как локально, так и развернуть на любом бесплатном статическом или Node.js хостинге за 1 минуту.

---

## 1. Локальный запуск (Development)

Требования:
- Node.js >= 18.0.0 (рекомендуется Node 20 или 22)
- npm >= 9.0.0

```bash
# Клонирование репозитория
git clone https://github.com/RovelLabs/2-proect.git
cd 2-proect

# Установка зависимостей
npm install

# Запуск dev-сервера с горячей перезагрузкой (Vite)
npm run dev
```
Приложение откроется по адресу `http://localhost:5173`.

---

## 2. Сборка для Production

```bash
npm run build
```
Собранные статические файлы будут находиться в директории `dist/`.

---

## 3. Деплой на платформы

### Вариант A: Vercel / Netlify / Cloudflare Pages
1. Подключите репозиторий `RovelLabs/2-proect` в дашборде.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Никаких переменных окружения на старте не требуется (работает полностью client-side).

### Вариант B: GitHub Pages
Проект готов к автоматическому деплою на GitHub Pages через GitHub Actions:
- Базовый путь настраивается в `vite.config.ts` (при необходимости `base: './'`).

### Вариант C: Docker / Self-hosted Nginx
В репозитории предоставлен готовый `Dockerfile`:
```bash
docker build -t skladno:latest .
docker run -p 8080:80 skladno:latest
```
Сервис станет доступен по адресу `http://localhost:8080`.
