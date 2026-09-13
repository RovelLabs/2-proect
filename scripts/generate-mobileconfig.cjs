const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const iconPath = path.join(root, 'public', 'icon-192.png');
const iconBase64 = fs.readFileSync(iconPath).toString('base64');

const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${iconBase64}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Складно</string>
            <key>PayloadDescription</key>
            <string>Установка веб-приложения Складно на экран Домой</string>
            <key>PayloadDisplayName</key>
            <string>Складно (Skladno)</string>
            <key>PayloadIdentifier</key>
            <string>app.skladno.split.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>3A8D2F8A-9C7E-4E65-802D-9F77D535A720</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://rovellabs.github.io/2-proect/</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Складно — Сплит расходов и СБП</string>
    <key>PayloadIdentifier</key>
    <string>app.skladno.split.profile</string>
    <key>PayloadOrganization</key>
    <string>RovelLabs</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>8C2C9012-7069-42CE-83F4-8C3725F7F602</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
`;

fs.writeFileSync(path.join(root, 'public', 'skladno.mobileconfig'), mobileConfig);
fs.mkdirSync(path.join(root, 'releases'), { recursive: true });
fs.writeFileSync(path.join(root, 'releases', 'Skladno-v0.1.0-ios.mobileconfig'), mobileConfig);
console.log('✓ Generated skladno.mobileconfig in public/ and releases/');
