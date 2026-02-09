$destination = "$env:USERPROFILE\Desktop\Shortcuts"
$shortcuts = Get-ChildItem -Path "$env:USERPROFILE\Desktop", "C:\Users\Public\Desktop" -Filter "*.lnk" -ErrorAction SilentlyContinue

foreach ($shortcut in $shortcuts) {
    $targetPath = Join-Path -Path $destination -ChildPath $shortcut.Name
    if (Test-Path -Path $targetPath) {
        Remove-Item -Path $targetPath -Force
    }
    Move-Item -Path $shortcut.FullName -Destination $destination -Force
}
