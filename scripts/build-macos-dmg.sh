#!/usr/bin/env bash
set -e

echo "=== Building Skladno macOS Release Bundle & DMG ==="

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$ROOT_DIR"

# 1. Build app bundle
node scripts/build-macos-app.cjs

APP_PATH="$ROOT_DIR/dist-releases/macos/Skladno.app"
chmod +x "$APP_PATH/Contents/MacOS/Skladno"

# 2. Prepare staging directory for DMG
DMG_STAGING="$ROOT_DIR/dist-releases/dmg-staging"
rm -rf "$DMG_STAGING"
mkdir -p "$DMG_STAGING"

cp -R "$APP_PATH" "$DMG_STAGING/"
ln -s /Applications "$DMG_STAGING/Applications"

# Add README for users opening the DMG
cat << 'EOF' > "$DMG_STAGING/Установка (Инструкция).txt"
Складно (Skladno) v0.1.0 для macOS
===================================
1. Перетащите иконку «Складно» (Skladno.app) в папку «Программы» (Applications).
2. Запустите приложение из Launchpad или Spotlight.
3. Готово! Приложение работает полностью автономно без интернета.
EOF

mkdir -p "$ROOT_DIR/releases"
DMG_OUTPUT="$ROOT_DIR/releases/Skladno-v0.1.0-macos.dmg"
ZIP_OUTPUT="$ROOT_DIR/releases/Skladno-v0.1.0-macos-universal.zip"

rm -f "$DMG_OUTPUT" "$ZIP_OUTPUT"

# 3. Create DMG using hdiutil if available
if command -v hdiutil >/dev/null 2>&1; then
    echo "Creating Apple Disk Image (DMG)..."
    hdiutil create -volname "Складно (Skladno)" \
      -srcfolder "$DMG_STAGING" \
      -ov -format UDZO \
      "$DMG_OUTPUT"
    echo "✓ DMG successfully created at: $DMG_OUTPUT"
fi

# 4. Create ZIP with preserved permissions using ditto or zip
if command -v ditto >/dev/null 2>&1; then
    echo "Creating Universal macOS ZIP..."
    cd "$ROOT_DIR/dist-releases/macos"
    ditto -c -k --sequesterRsrc --keepParent Skladno.app "$ZIP_OUTPUT"
    echo "✓ macOS ZIP created at: $ZIP_OUTPUT"
fi

echo "=== macOS Build Completed Successfully ==="
