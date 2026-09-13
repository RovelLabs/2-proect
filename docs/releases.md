# Релизы для Windows, macOS и Android: «Складно» (Skladno)

В проекте реализована полноценная мультиплатформенная поддержка с удобными релизами под все ключевые операционные системы.

---

## 💻 1. Windows (x64)

### Вариант A: Готовый портативный релиз (Portable Zip)
1. Скачайте архив [`releases/Skladno-v0.1.0-windows-x64.zip`](../releases/Skladno-v0.1.0-windows-x64.zip).
2. Распакуйте в любую удобную папку.
3. Для бесшумного запуска дважды кликните по **`Skladno.vbs`** (запуск без чёрного окна терминала) или **`Skladno.cmd`**.
4. Приложение автоматически откроется как чистое нативное десктопное окно (Edge/Chrome App Mode без адресной строки и лишних панелей).

### Вариант B: Создание красивого ярлыка на Рабочем столе
Внутри распакованной папки зайдите в `scripts/` и запустите:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-windows-shortcut.ps1
```
Это автоматически создаст ярлыки «Складно» с фирменной иконкой на Рабочем столе и в Меню «Пуск».

---

## 🍎 2. macOS (Apple Silicon & Intel)

### Вариант A: Готовый бандл Skladno.app
1. Скачайте архив [`releases/Skladno-v0.1.0-macos-universal.zip`](../releases/Skladno-v0.1.0-macos-universal.zip).
2. Распакуйте архив — внутри находится готовый бандл **`Skladno.app`**.
3. Перетащите `Skladno.app` в папку `/Applications` («Программы»).
4. Запускайте прямо из Launchpad, Spotlight или Dock!

### Вариант B: Быстрая установка через скрипт
В корне проекта выполните:
```bash
chmod +x scripts/install-mac.sh
./scripts/install-mac.sh
```

---

## 📱 3. Android

### Вариант A: Установка APK (GitHub Releases)
- В каждом релизе на GitHub (`v*`) автоматически собирается и прикрепляется готовый APK-файл: **`Skladno-v0.1.0-android.apk`**.
- Достаточно скачать APK на телефон и разрешить установку.

### Вариант B: Нативный проект Capacitor Android
В репозитории подготовлена полная нативная папка `android/`:
1. Откройте директорию `android/` в **Android Studio**.
2. Подключите смартфон или выберите эмулятор.
3. Нажмите **Run** или соберите собственный подписанный APK / AAB через `Build -> Build APK(s)`.
4. Или соберите через терминал:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   Собранный APK будет в `android/app/build/outputs/apk/debug/app-debug.apk`.

### Вариант C: PWA (Без установки APK)
Откройте сервис в мобильном браузере (Chrome / Яндекс Браузер / Samsung Internet) и нажмите в меню: **«Добавить на главный экран»**. Сервис установится как автономное приложение со своей иконкой и оффлайн-доступом.

---

## 🔐 Контрольные суммы SHA-256

Все собранные архивы верифицируются по файлу [`releases/SHA256SUMS.txt`](../releases/SHA256SUMS.txt):

```text
97d9214b2f635e0ac65f40f3055e491f74a7a058081d264620211242263ea6a2  Skladno-v0.1.0-windows-x64.zip
293a67a1e89578720707a56aee47d970ccf2900c030bc7f05cde234e4bf963fe  Skladno-v0.1.0-macos-universal.zip
28862cb553150bdb79f63415e6a151cf23205ba12cb384e1ee8b94591ec6237c  Skladno-v0.1.0-android-project.zip
```
