$root = Split-Path -Parent $PSScriptRoot
$vbsPath = Join-Path $root "Skladno.vbs"
$icoPath = Join-Path $root "assets\brand\app.ico"
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$startMenuPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs')

$wsh = New-Object -ComObject WScript.Shell

# Desktop shortcut
$shortcutDesktop = $wsh.CreateShortcut((Join-Path $desktopPath "Складно.lnk"))
$shortcutDesktop.TargetPath = "wscript.exe"
$shortcutDesktop.Arguments = "`"$vbsPath`""
$shortcutDesktop.WorkingDirectory = $root
$shortcutDesktop.IconLocation = "$icoPath, 0"
$shortcutDesktop.Description = "Складно — Сплит расходов и СБП расчёты"
$shortcutDesktop.Save()

# Start Menu shortcut
$shortcutStart = $wsh.CreateShortcut((Join-Path $startMenuPath "Складно.lnk"))
$shortcutStart.TargetPath = "wscript.exe"
$shortcutStart.Arguments = "`"$vbsPath`""
$shortcutStart.WorkingDirectory = $root
$shortcutStart.IconLocation = "$icoPath, 0"
$shortcutStart.Description = "Складно — Сплит расходов и СБП расчёты"
$shortcutStart.Save()

Write-Host "✅ Ярлыки «Складно» успешно созданы на Рабочем столе и в Меню Пуск!" -ForegroundColor Green
