# Manufacturer garbage that autoinstalls
Write-Host -NoNewline "`n`n`nConfiguring: AcerCCAgentSvis`n"
sc stop AcerCCAgentSvis
sc config AcerCCAgentSvis start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerARTAIMMXService`n"
sc stop AcerARTAIMMXService
sc config AcerARTAIMMXService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerGAICameraService`n"
sc stop AcerGAICameraService
sc config AcerGAICameraService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerARTAIMMXDriverService`n"
sc stop AcerARTAIMMXDriverService
sc config AcerARTAIMMXDriverService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerDIAgentSvis`n"
sc stop AcerDIAgentSvis
sc config AcerDIAgentSvis start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerEZSvc`n"
sc stop AcerEZSvc
sc config AcerEZSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerServiceSvc`n"
sc stop AcerServiceSvc
sc config AcerServiceSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ASMSvc`n"
sc stop ASMSvc
sc config ASMSvc start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerPixyService`n"
sc stop AcerPixyService
sc config AcerPixyService start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AcerQAAgentSvis`n"
sc stop AcerQAAgentSvis
sc config AcerQAAgentSvis start=disabled

# Autodesk
Write-Host -NoNewline "`n`n`nConfiguring: Autodesk Access Service Host`n"
sc stop Autodesk Access Service Host
sc config "Autodesk Access Service Host" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: Autodesk CER Service`n"
sc stop Autodesk CER Service
sc config "Autodesk CER Service" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: AdskLicensingService`n"
sc stop AdskLicensingService
sc config AdskLicensingService start=demand

# Internet based tooling
Write-Host -NoNewline "`n`n`nConfiguring: CloudflareWARP`n"
sc stop CloudflareWARP
sc config CloudflareWARP start=demand
Write-Host -NoNewline "`n`n`nConfiguring: Deskflow`n"
sc stop Deskflow
sc config Deskflow start=demand
Write-Host -NoNewline "`n`n`nConfiguring: GoodbyeDPI`n"
sc stop GoodbyeDPI
sc config GoodbyeDPI start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ProtonVPN Service`n"
sc stop ProtonVPN Service
sc config "ProtonVPN Service" start=demand
Write-Host -NoNewline "`n`n`nConfiguring: ProtonVPN WireGuard`n"
sc stop ProtonVPN WireGuard
sc config "ProtonVPN WireGuard" start=demand

Write-Host -NoNewline "`n`n`nConfiguring: com.docker.service`n"
sc stop com.docker.service
sc config com.docker.service start=demand

# Google Play Games services
# TODO regexp
# Write-Host -NoNewline "`n`n`nConfiguring: GooglePlayGamesServices-25.4.472.0`n"
sc stop GooglePlayGamesServices-25.4.472.0
# sc config GooglePlayGamesServices-25.4.472.0 start=demand
# Write-Host -NoNewline "`n`n`nConfiguring: GoogleUpdaterInternalService137.0.7129.0`n"
sc stop GoogleUpdaterInternalService137.0.7129.0
# sc config GoogleUpdaterInternalService137.0.7129.0 start=demand
# Write-Host -NoNewline "`n`n`nConfiguring: GoogleUpdaterService137.0.7129.0`n"
sc stop GoogleUpdaterService137.0.7129.0
# sc config GoogleUpdaterService137.0.7129.0 start=demand

# Write-Host -NoNewline "`n`n`nConfiguring: JetBrainsEtwHost.16`n"
sc stop JetBrainsEtwHost.16
# sc config JetBrainsEtwHost.16 start=demand
