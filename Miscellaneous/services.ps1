# Manufacturer garbage that autoinstalls
Write-Host -NoNewline "`n`n`nConfiguring: AcerARTAIMMXDriverService`n"
sc config AcerARTAIMMXDriverService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerDIAgentSvis`n"
sc config AcerDIAgentSvis start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerEZSvc`n"
sc config AcerEZSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerServiceSvc`n"
sc config AcerServiceSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ASMSvc`n"
sc config ASMSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerPixyService`n"
sc config AcerPixyService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerQAAgentSvis`n"
sc config AcerQAAgentSvis start=disabled

# Autodesk
Write-Host -NoNewline "`n`n`nConfiguring: Autodesk Access Service Host`n"
sc config "Autodesk Access Service Host" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: Autodesk CER Service`n"
sc config "Autodesk CER Service" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AdskLicensingService`n"
sc config AdskLicensingService start=demand

# Internet based tooling
Write-Host -NoNewline "`n`n`nConfiguring: CloudflareWARP`n"
sc config CloudflareWARP start=demand
Write-Host -NoNewline "`n`n`nConfiguring: Deskflow`n"
sc config Deskflow start=demand
Write-Host -NoNewline "`n`n`nConfiguring: GoodbyeDPI`n"
sc config GoodbyeDPI start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ProtonVPN Service`n"
sc config "ProtonVPN Service" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ProtonVPN WireGuard`n"
sc config "ProtonVPN WireGuard" start=demand

Write-Host -NoNewline "`n`n`nConfiguring: com.docker.service`n"
sc config com.docker.service start=demand

# Google Play Games services
# TODO regexp
# Write-Host -NoNewline "`n`n`nConfiguring: GooglePlayGamesServices-25.4.472.0`n"
# sc config GooglePlayGamesServices-25.4.472.0 start=demand
# Write-Host -NoNewline "`n`n`nConfiguring: GoogleUpdaterInternalService137.0.7129.0`n"
# sc config GoogleUpdaterInternalService137.0.7129.0 start=demand
# Write-Host -NoNewline "`n`n`nConfiguring: GoogleUpdaterService137.0.7129.0`n"
# sc config GoogleUpdaterService137.0.7129.0 start=demand

# Write-Host -NoNewline "`n`n`nConfiguring: JetBrainsEtwHost.16`n"
# sc config JetBrainsEtwHost.16 start=demand
