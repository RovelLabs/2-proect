# Руководство по контрибьюции в «Складно» (Contributing Guide)

Мы рады любому вкладу в развитие проекта: от исправления опечаток и улучшения документации до добавления новых функций и интеграций с банками СНГ!

## Как внести вклад

1. **Форкните репозиторий** и создайте ветку с понятным названием:
   ```bash
   git checkout -b feat/sbp-bank-logos
   ```
2. **Установите зависимости и запустите проект**:
   ```bash
   npm install
   npm run dev
   ```
3. **Перед созданием Pull Request обязательно проверьте**:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```
4. **Оформление коммитов**:
   Используйте Conventional Commits:
   - `feat: add quick QR code for SBP transfers`
   - `fix: correct rounding error in debt graph settlement`
   - `docs: update deployment instructions`
   - `test: add unit tests for selective split mode`

5. **Создайте Pull Request**:
   Опишите, какую проблему решает ваш PR, приложите скриншоты или видео изменений UI.
