#!/usr/bin/env bash
set -e

echo "=== Установка «Складно» (Skladno) на macOS ==="

APP_NAME="Складно"
INSTALL_DIR="/Applications/$APP_NAME.app"

if [ -d "$INSTALL_DIR" ]; then
    echo "Удаление предыдущей версии..."
    rm -rf "$INSTALL_DIR"
fi

if [ -d "dist-releases/macos/Skladno.app" ]; then
    cp -R "dist-releases/macos/Skladno.app" "$INSTALL_DIR"
    chmod +x "$INSTALL_DIR/Contents/MacOS/Skladno"
    echo "✅ «Складно» успешно установлено в /Applications/$APP_NAME.app!"
    echo "Теперь вы можете запускать Складно из Launchpad или Spotlight!"
else
    echo "Сначала выполните сборку: node scripts/build-macos-app.js"
fi
