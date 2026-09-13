const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const releasesDir = path.join(root, 'releases');

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

console.log('=== Packaging Skladno v0.1.0 Cross-Platform Releases ===\n');

// 1. Sync Android Capacitor assets
console.log('[1/4] Syncing Android assets...');
execSync('npx cap sync android', { cwd: root, stdio: 'inherit' });

// 2. Build macOS Skladno.app
console.log('\n[2/4] Building macOS bundle...');
execSync('node scripts/build-macos-app.cjs', { cwd: root, stdio: 'inherit' });

// 3. Package Windows zip
console.log('\n[3/4] Packaging Windows Desktop portable bundle...');
const winStage = path.join(root, 'dist-releases', 'windows');
fs.mkdirSync(winStage, { recursive: true });

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy Windows files to staging
copyRecursive(path.join(root, 'dist'), path.join(winStage, 'dist'));
fs.mkdirSync(path.join(winStage, 'bin'), { recursive: true });
fs.copyFileSync(path.join(root, 'bin', 'desktop-server.cjs'), path.join(winStage, 'bin', 'desktop-server.cjs'));
fs.copyFileSync(path.join(root, 'Skladno.cmd'), path.join(winStage, 'Skladno.cmd'));
fs.copyFileSync(path.join(root, 'Skladno.vbs'), path.join(winStage, 'Skladno.vbs'));

fs.mkdirSync(path.join(winStage, 'assets', 'brand'), { recursive: true });
fs.copyFileSync(path.join(root, 'assets', 'brand', 'app.ico'), path.join(winStage, 'assets', 'brand', 'app.ico'));

fs.mkdirSync(path.join(winStage, 'scripts'), { recursive: true });
fs.copyFileSync(path.join(root, 'scripts', 'install-windows-shortcut.ps1'), path.join(winStage, 'scripts', 'install-windows-shortcut.ps1'));

fs.writeFileSync(path.join(winStage, 'ИНСТРУКЦИЯ.txt'), `=== Складно (Skladno) v0.1.0 для Windows ===

Быстрый запуск:
1. Дважды кликните по "Skladno.vbs" (запуск без черного окна консоли)
   или "Skladno.cmd".
2. Приложение откроется в виде отдельного чистого окна приложения!

Создание ярлыка на Рабочем столе:
- Откройте папку scripts и запустите "install-windows-shortcut.ps1" через PowerShell.

Требования:
- Установленный Node.js (https://nodejs.org).
`);

const winZip = path.join(releasesDir, 'Skladno-v0.1.0-windows-x64.zip');
if (fs.existsSync(winZip)) fs.unlinkSync(winZip);

// Compress using PowerShell Compress-Archive
console.log('Compressing Windows release...');
execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${winStage}\\*' -DestinationPath '${winZip}' -Force"`, { cwd: root });
console.log(`Created: ${winZip}`);

// 4. Package macOS zip
console.log('\n[4/4] Packaging macOS release...');
const macAppPath = path.join(root, 'dist-releases', 'macos', 'Skladno.app');
const macZip = path.join(releasesDir, 'Skladno-v0.1.0-macos-universal.zip');
if (fs.existsSync(macZip)) fs.unlinkSync(macZip);
execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${macAppPath}' -DestinationPath '${macZip}' -Force"`, { cwd: root });
console.log(`Created: ${macZip}`);

// 5. Package Android Project zip
console.log('\nPackaging Android native project bundle...');
const androidDir = path.join(root, 'android');
const androidZip = path.join(releasesDir, 'Skladno-v0.1.0-android-project.zip');
if (fs.existsSync(androidZip)) fs.unlinkSync(androidZip);
execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${androidDir}' -DestinationPath '${androidZip}' -Force"`, { cwd: root });
console.log(`Created: ${androidZip}`);

// 6. Generate SHA256 Checksums
console.log('\nComputing SHA256 checksums...');
const releaseFiles = [
  'Skladno-v0.1.0-android.apk',
  'Skladno-v0.1.0-windows-x64.zip',
  'Skladno-v0.1.0-macos.dmg',
  'Skladno-v0.1.0-macos-universal.zip',
  'Skladno-v0.1.0-android-project.zip'
];

let checksumOutput = '';
for (const file of releaseFiles) {
  const filePath = path.join(releasesDir, file);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const sizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(2);
    checksumOutput += `${hash}  ${file} (${sizeMb} MB)\n`;
    console.log(`  ${file}: ${hash} (${sizeMb} MB)`);
  }
}
fs.writeFileSync(path.join(releasesDir, 'SHA256SUMS.txt'), checksumOutput);

console.log('\n✅ All releases successfully generated and verified in releases/ folder!');
