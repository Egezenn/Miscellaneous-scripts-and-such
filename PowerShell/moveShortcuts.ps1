$destination = "$env:USERPROFILE\Desktop\Shortcuts"
if (-not (Test-Path -Path $destination)) {
    New-Item -Path $destination -ItemType Directory | Out-Null
}

Move-Item -Force "$env:USERPROFILE\Desktop\*.lnk" $destination
Move-Item -Force "C:\Users\Public\Desktop\*.lnk" $destination
