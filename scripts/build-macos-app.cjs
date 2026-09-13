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

// 2. MacOS launcher binary script
const launcherScript = `#!/usr/bin/env bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
RESOURCES_DIR="$DIR/../Resources/app"

PORT=5174

# Start local server in background
node "$RESOURCES_DIR/bin/desktop-server.cjs" &
SERVER_PID=$!

sleep 0.8

# Try to open in dedicated app window mode with Chrome/Brave/Edge or Safari
if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="http://127.0.0.1:$PORT"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -na "Microsoft Edge" --args --app="http://127.0.0.1:$PORT"
else
    open "http://127.0.0.1:$PORT"
fi

wait $SERVER_PID
`;
fs.writeFileSync(path.join(macosDir, 'Skladno'), launcherScript);

// 3. Copy icons
const iconSrc = path.join(root, 'assets', 'brand', 'icon_512.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(resDir, 'AppIcon.png'));
}

// 4. Copy dist assets and desktop-server.js
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
