const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitHubToken() {
  try {
    const input = 'protocol=https\nhost=github.com\n\n';
    const output = execSync('git credential fill', { input, encoding: 'utf8' });
    const match = output.match(/password=(.*)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (err) {
    console.warn('Failed to retrieve token via git credential fill:', err.message);
  }
  return process.env.GITHUB_TOKEN || null;
}

function request(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Skladno-Release-Bot',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const resBody = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: resBody.toString('utf8'),
          raw: resBody
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function main() {
  const token = getGitHubToken();
  if (!token) {
    console.error('ERROR: No GitHub token found');
    process.exit(1);
  }
  console.log('GitHub token successfully retrieved.');

  const repo = 'RovelLabs/2-proect';
  const tag = 'v0.1.0';

  const authHeaders = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  // Check if tag or release already exists
  console.log(`Checking existing releases for ${repo}...`);
  const listRes = await request(`https://api.github.com/repos/${repo}/releases`, {
    headers: authHeaders
  });

  let releases = [];
  try {
    releases = JSON.parse(listRes.data);
  } catch (e) {}

  let targetRelease = Array.isArray(releases) ? releases.find(r => r.tag_name === tag) : null;

  const releaseTitle = 'Складно (Skladno) v0.1.0 — Мультиплатформенный релиз (iOS, Android, macOS, Windows)';
  const releaseBody = `## 🚀 Складно (Skladno) v0.1.0 — Первый официальный релиз

Полноценное кроссплатформенное open-source приложение для быстрого и справедливого сплита групповых счетов с автоматической минимизацией транзакций и мгновенным переводом долгов по СБП!

---

### 📦 Загрузка и установка под вашу платформу

#### 📱 iPhone & iPad (iOS)
- **Файл:** \`Skladno-v0.1.0-ios.mobileconfig\` (Apple Configuration Profile / WebClip)
- **Как установить:**
  - **Способ 1 (В 2 тапа в Safari — Рекомендуется):** Откройте веб-версию в Safari на iPhone ➔ Нажмите «Поделиться» [↑] ➔ «На экран “Домой”» [+] ➔ «Добавить».
  - **Способ 2 (Через профиль):** Скачайте \`Skladno-v0.1.0-ios.mobileconfig\` ➔ Откройте «Настройки» ➔ «Профиль загружен» ➔ «Установить».
  - Работает на всех версиях iOS 14–18+ на полный экран без вкладок Safari и сохраняет данные офлайн!

#### 📱 Android
- **Файл:** \`Skladno-v0.1.0-android.apk\` (нативный APK, 3.8 МБ)
- **Как запустить:**
  1. Скачайте APK на телефон и разрешите установку.
  2. Запускайте прямо из меню приложений.

#### 🍎 macOS (Apple Silicon & Intel)
- **Файлы:**
  - \`Skladno-v0.1.0-macos.dmg\` — нативный образ диска с Drag-and-Drop установкой.
  - \`Skladno-v0.1.0-macos-universal.zip\` — универсальный бандл \`Skladno.app\`.
- **Как запустить:**
  1. Откройте \`.dmg\` и перетащите иконку «Складно» в папку «Программы» (Applications).
  2. Запускайте из Launchpad или Spotlight.

#### 🪟 Windows (x64)
- **Файл:** \`Skladno-v0.1.0-windows-x64.zip\`
- **Как запустить:**
  1. Скачайте архив и распакуйте в любую удобную папку.
  2. Запустите \`Skladno.vbs\` (или \`Skladno.cmd\`) — приложение откроется в изолированном окне.
  3. Для создания ярлыка на Рабочем столе запустите \`Создать_ярлык.cmd\`.

#### 🤖 Для Android-разработчиков
- **Файл:** \`Skladno-v0.1.0-android-project.zip\` — нативный проект для Android Studio.
- **Как использовать:**
  1. Нативный проект на базе Capacitor Android.
  2. Распакуйте архив и откройте папку в Android Studio или соберите через Gradle: \`./gradlew assembleDebug\`.
  3. Либо откройте веб-версию в Chrome на Android и нажмите **«Добавить на главный экран»** (PWA с полным офлайн-режимом).

---

### ✨ Ключевые возможности v0.1.0:
1. **Графовая минимизация долгов:** алгоритм сбалансированного графа сокращает число переводов в группе в 3-5 раз (из 10 хаотичных долгов оставляет 2-3 прямых перевода).
2. **Бесшовный СБП (Система Быстрых Платежей):**
   - Прямой диплинк в банковские приложения (Сбер, Т-Банк, Альфа, ВТБ, Райффайзен, Озон и др.).
   - Генерация динамических QR-кодов стандарта ГОСТ/НСПК для моментальной оплаты в 1 клик.
3. **Zero-Login & Local-First:**
   - Никаких номеров телефонов, смс-кодов, паролей и сбора персональных данных.
   - Полный офлайн-режим (IndexedDB + ServiceWorker).
4. **Удобный шеринг:**
   - Компактные URL-состояния с LZ-архивацией — делитесь полным счетом одной ссылкой.
   - Красивая карточка с раскладкой для Telegram / ВКонтакте / мессенджеров.

---

### 🔒 Контрольные суммы (SHA256):
\`\`\`
${fs.readFileSync(path.join(__dirname, '..', 'releases', 'SHA256SUMS.txt'), 'utf8').trim()}
\`\`\`
`;

  if (!targetRelease) {
    console.log(`Creating release ${tag}...`);
    const createRes = await request(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      }
    }, {
      tag_name: tag,
      target_commitish: 'main',
      name: releaseTitle,
      body: releaseBody,
      draft: false,
      prerelease: false
    });

    if (createRes.statusCode !== 201 && createRes.statusCode !== 200) {
      console.error(`Failed to create release: status ${createRes.statusCode}`, createRes.data);
      process.exit(1);
    }
    targetRelease = JSON.parse(createRes.data);
    console.log(`Release created successfully! ID: ${targetRelease.id}, URL: ${targetRelease.html_url}`);
  } else {
    console.log(`Release ${tag} already exists (ID: ${targetRelease.id}). Updating metadata...`);
    const updateRes = await request(`https://api.github.com/repos/${repo}/releases/${targetRelease.id}`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      }
    }, {
      name: releaseTitle,
      body: releaseBody
    });
    console.log(`Release updated. Status: ${updateRes.statusCode}`);
  }

  // Files to upload
  const releasesDir = path.join(__dirname, '..', 'releases');
  const filesToUpload = [
    { name: 'Skladno-v0.1.0-ios.mobileconfig', contentType: 'application/x-apple-aspen-config' },
    { name: 'Skladno-v0.1.0-android.apk', contentType: 'application/vnd.android.package-archive' },
    { name: 'Skladno-v0.1.0-macos.dmg', contentType: 'application/x-apple-diskimage' },
    { name: 'Skladno-v0.1.0-macos-universal.zip', contentType: 'application/zip' },
    { name: 'Skladno-v0.1.0-windows-x64.zip', contentType: 'application/zip' },
    { name: 'Skladno-v0.1.0-android-project.zip', contentType: 'application/zip' },
    { name: 'SHA256SUMS.txt', contentType: 'text/plain' }
  ];

  // Check existing assets
  const existingAssets = targetRelease.assets || [];
  console.log(`Existing assets in release: ${existingAssets.length}`);

  for (const file of filesToUpload) {
    const filePath = path.join(releasesDir, file.name);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const matchedAsset = existingAssets.find(a => a.name === file.name);
    if (matchedAsset) {
      console.log(`Deleting existing asset ${file.name} (ID: ${matchedAsset.id})...`);
      await request(`https://api.github.com/repos/${repo}/releases/assets/${matchedAsset.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
    }

    console.log(`Uploading ${file.name} (${fs.statSync(filePath).size} bytes)...`);
    const fileBuffer = fs.readFileSync(filePath);
    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${targetRelease.id}/assets?name=${encodeURIComponent(file.name)}`;

    const uploadRes = await request(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': file.contentType,
        'Content-Length': fileBuffer.length
      }
    }, fileBuffer);

    if (uploadRes.statusCode === 201) {
      console.log(`✓ Successfully uploaded ${file.name}`);
    } else {
      console.error(`✗ Failed to upload ${file.name}: status ${uploadRes.statusCode}`, uploadRes.data);
    }
  }

  console.log('\n--- ALL ASSETS UPLOADED ---');
  console.log(`Release URL: https://github.com/${repo}/releases/tag/${tag}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
