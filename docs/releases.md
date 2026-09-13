# Мультиплатформенные релизы: «Складно» (Skladno)

В проекте реализована полноценная кроссплатформенная поддержка с удобными релизами под все ключевые операционные системы: **Android (APK)**, **macOS (DMG & App)**, **Windows (Portable)** и **Веб / PWA**.

Все релизы доступны на странице **[GitHub Releases: RovelLabs/2-proect/releases](https://github.com/RovelLabs/2-proect/releases)**.

---

## 📱 1. Android (Смартфоны и планшеты)

### Вариант A: Готовый нативный APK (Рекомендуется)
1. Скачайте файл **[`Skladno-v0.1.0-android.apk`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/Skladno-v0.1.0-android.apk)** (3.8 МБ).
2. Нажмите на скачанный файл в панели уведомлений или через файловый менеджер.
3. Разрешите установку из вашего браузера/проводника (стандартное предупреждение Android для приложений не из Google Play).
4. Нажмите «Установить» — приложение появится на домашнем экране.
5. Приложение работает на 100% автономно и офлайн.

### Вариант B: PWA (Без скачивания файлов)
Откройте веб-версию сервиса в мобильном Chrome / Яндекс Браузере / Samsung Internet и в меню выберите **«Добавить на главный экран»** (Add to Home Screen). Приложение установится в систему как PWA-приложение с иконкой и кешированием через Service Worker.

### Вариант C: Проект для разработчиков
Скачайте архив **[`Skladno-v0.1.0-android-project.zip`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/Skladno-v0.1.0-android-project.zip)** или откройте папку `android/` в **Android Studio**. Сборка выполняется стандартной командой:
```bash
cd android
./gradlew assembleDebug
```

---

## 🍎 2. macOS (Apple Silicon M1/M2/M3/M4 & Intel)

### Вариант A: Образ диска DMG (Самый удобный способ)
1. Скачайте образ **[`Skladno-v0.1.0-macos.dmg`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/Skladno-v0.1.0-macos.dmg)**.
2. Откройте `.dmg` двойным кликом — смонтируется диск «Складно».
3. Перетащите иконку **Складно (Skladno.app)** в ярлык папки **«Программы» (Applications)** прямо в окне диска.
4. Запускайте из Launchpad, Spotlight или папки «Программы».

> 💡 **Примечание по безопасности macOS (Gatekeeper):**  
> Так как приложение распространяется как open-source без платного платного Apple Developer сертификата, при первом запуске macOS может показать стандартное диалоговое окно «Приложение загружено из интернета».  
> **Как запустить:**
> - Нажмите правой кнопкой мыши (или Control + клик) по `Складно` в папке «Программы» и выберите **«Открыть»** -> подтвердите открытие.
> - Либо в Терминале снимите атрибут карантина одной командой:
>   ```bash
>   xattr -cr /Applications/Skladno.app
>   ```

### Вариант B: Портативный архив Skladno.app
1. Скачайте архив **[`Skladno-v0.1.0-macos-universal.zip`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/Skladno-v0.1.0-macos-universal.zip)**.
2. Распакуйте архив — внутри находится готовый бандл **`Skladno.app`**.
3. Переместите `Skladno.app` в `/Applications`.

### Технические особенности сборки под Mac:
- **Универсальный запуск:** Лончер `Skladno` автоматически определяет доступное окружение (Node.js или встроенный в macOS `python3 -m http.server`) и мгновенно поднимает локальный хост.
- **Чистый App Mode:** Автоматически запускает изолированное окно браузера (Chrome, Edge, Brave, Яндекс или Safari) без адресных строк и вкладок.
- **Graceful Lifecycle:** При закрытии приложения фоновый процесс сервера автоматически выгружается из памяти (`trap EXIT INT TERM`).

---

## 💻 3. Windows (x64 / Windows 10, 11)

### Быстрый запуск:
1. Скачайте архив **[`Skladno-v0.1.0-windows-x64.zip`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/Skladno-v0.1.0-windows-x64.zip)**.
2. Распакуйте архив в любую постоянную папку (например, `C:\Apps\Skladno` или в папку пользователя).
3. Дважды кликните по **`Skladno.vbs`** — приложение бесшумно запустится в отдельном нативном окне (Edge/Chrome App Mode).

### Создание ярлыков:
В папке `scripts/` внутри архива лежит скрипт:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-windows-shortcut.ps1
```
Он автоматически создает ярлык с иконкой приложения на Рабочем столе и в меню «Пуск».

---

## 🔒 Контрольные суммы (SHA256)
Для сверки целостности файлов скачайте **[`SHA256SUMS.txt`](https://github.com/RovelLabs/2-proect/releases/download/v0.1.0/SHA256SUMS.txt)**.
Проверить хеш файла:
- **macOS / Linux:** `sha256sum <имя_файла>`
- **Windows PowerShell:** `Get-FileHash -Algorithm SHA256 <имя_файла>`
