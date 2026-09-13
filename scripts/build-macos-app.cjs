const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appDir = path.join(root, 'dist-releases', 'macos', 'Skladno.app');
const contentsDir = path.join(appDir, 'Contents');
const macosDir = path.join(contentsDir, 'MacOS');
const resDir = path.join(contentsDir, 'Resources');
const embeddedAppDir = path.join(resDir, 'app');

console.log('Building macOS Skladno.app bundle...');

// Create directories
fs.mkdirSync(macosDir, { recursive: true });
fs.mkdirSync(embeddedAppDir, { recursive: true });

// 1. Info.plist
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Складно</string>
    <key>CFBundleDisplayName</key>
    <string>Складно (Skladno)</string>
    <key>CFBundleIdentifier</key>
    <string>app.skladno.split</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleExecutable</key>
    <string>Skladno</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
`;
fs.writeFileSync(path.join(contentsDir, 'Info.plist'), infoPlist);

// 2. Robust MacOS launcher binary script
const launcherScript = `#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
RESOURCES_DIR="$DIR/../Resources/app"
PORT=5174

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Start local embedded HTTP server with available runtime
if command -v node >/dev/null 2>&1; then
    node "$RESOURCES_DIR/bin/desktop-server.cjs" &
    SERVER_PID=$!
elif command -v python3 >/dev/null 2>&1; then
    (cd "$RESOURCES_DIR/dist" && python3 -m http.server $PORT --bind 127.0.0.1) &
    SERVER_PID=$!
elif command -v python >/dev/null 2>&1; then
    (cd "$RESOURCES_DIR/dist" && python -m SimpleHTTPServer $PORT) &
    SERVER_PID=$!
else
    # Fallback to direct file launch in default browser
    open "$RESOURCES_DIR/dist/index.html"
    exit 0
fi

# 2. Wait for server to initialize
sleep 0.7

# 3. Open in clean app mode (Chrome/Edge/Brave) or default browser
URL="http://127.0.0.1:$PORT"

if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="$URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -na "Microsoft Edge" --args --app="$URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    open -na "Brave Browser" --args --app="$URL"
elif [ -d "/Applications/Yandex.app" ]; then
    open -na "Yandex" --args --app="$URL"
else
    open "$URL"
fi

if [ -n "$SERVER_PID" ]; then
    wait $SERVER_PID
fi
`;

fs.writeFileSync(path.join(macosDir, 'Skladno'), launcherScript);

// Try to chmod if on POSIX
try {
  fs.chmodSync(path.join(macosDir, 'Skladno'), 0o755);
} catch (e) {}

// 3. Copy icons
const iconPng = path.join(root, 'assets', 'brand', 'icon_512.png');
if (fs.existsSync(iconPng)) {
  fs.copyFileSync(iconPng, path.join(resDir, 'AppIcon.png'));
  fs.copyFileSync(iconPng, path.join(resDir, 'icon.png'));
}

// 4. Copy dist assets and desktop-server.cjs
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const sPath = path.join(src, item);
    const dPath = path.join(dest, item);
    if (fs.statSync(sPath).isDirectory()) {
      copyDir(sPath, dPath);
    } else {
      fs.copyFileSync(sPath, dPath);
    }
  }
}

copyDir(path.join(root, 'dist'), path.join(embeddedAppDir, 'dist'));
fs.mkdirSync(path.join(embeddedAppDir, 'bin'), { recursive: true });
fs.copyFileSync(path.join(root, 'bin', 'desktop-server.cjs'), path.join(embeddedAppDir, 'bin', 'desktop-server.cjs'));

console.log('macOS Skladno.app bundle successfully created at:', appDir);
