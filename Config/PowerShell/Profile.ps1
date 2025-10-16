Clear-Host
Invoke-Expression (& starship init powershell)
Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

# shorthands & overrides
function .. { Set-Location .. }
function ~ { Set-Location ~ }
function / { Set-Location / }

Remove-Item Alias:history -Force
function history {
    $historyPath = (Get-PSReadlineOption).HistorySavePath
    Get-Content $historyPath | ForEach-Object { 
        $lineNumber = ($_ | Select-Object -Index 0)
    }
    Get-Content $historyPath | ForEach-Object -Begin { $i = 1 } -Process {
        "{0,4} | {1}" -f $i, $_
        $i++
    }
}

function c { Clear-Host }
function prl {
    . $PROFILE
    Clear-Host
}

$historyPath = (Get-PSReadlineOption).HistorySavePath
function histfile { Invoke-Item $historyPath }
function hpure { Get-Content $historyPath }
function hgrep { Get-Content $historyPath | grep $args }

Set-PSReadLineKeyHandler -Chord "Ctrl+RightArrow" -Function ForwardWord
Remove-Item Alias:ls -Force
function ls { lsd $args }
function lsps { Get-ChildItem $args }
function lsa { lsd -A $args }
function lst { lsd --tree $args }
function cds {
    Set-Location $args[0]
    lsd 
}
function cdm {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -Path $Path -PathType Container)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
    Set-Location -Path $Path
}
function cwd { (Get-Location).Path }

function editprofile { edit $env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1 }
function adminterminal { Start-Process wt -ArgumentList "-d `"$PWD`"" -Verb runas }

# executables
function updatelist { 
    pacman -Sy
    pacman -Qu
    choco outdated
    winget update
    uv tool upgrade --all
    dotnet tool update --all -g
}
function updateall {
    pacman -Syu --noconfirm
    choco upgrade all -y
    winget update --all
}
function updateallx {
    pacman -Syu --noconfirm
    choco upgrade all -y
    winget update --all
    uv tool upgrade --all
    dotnet tool update --all -g
}

function gitscommit {
    git add .
    git commit -a -m $args 
}
function gitscommitp {
    git add .
    git commit -a -m $args 
    git push
}
function gitrecommit {
    git reset --soft HEAD~1
    git commit -a -m $args 
}
function gitrestore {
    git reset --soft HEAD~1
    git restore --staged . 
}

function markhidden { attrib +h /d .\.* }

function exp {
    param(
        [string]$Path = "."
    )
    Explorer++.exe $Path
}


function pipreset { pip freeze | xargs pip uninstall -y }
function acvenv { .\.venv\Scripts\activate }
function createvenv { python -m venv .venv }
function createvenvi {
    python -m venv .venv
    acvenv
    pip install -r .\requirements.txt 
}

function pkill { taskkill /F /IM $args }
function whr { & "C:\Windows\System32\where.exe" @args }

function win { winget install $args }
function wse { winget search $args }

function y {
    $tmp = [System.IO.Path]::GetTempFileName()
    yazi $args --cwd-file="$tmp"
    $cwd = Get-Content -Path $tmp -Encoding UTF8
    if (-not [String]::IsNullOrEmpty($cwd) -and $cwd -ne $PWD.Path) {
        Set-Location -LiteralPath ([System.IO.Path]::GetFullPath($cwd))
    }
    Remove-Item -Path $tmp
}

function yt { yt-dlp @args }
function yt144 { yt-dlp -f "bv*[height<=144]+ba/b" @args }
function yt240 { yt-dlp -f "bv*[height<=240]+ba/b" @args }
function yt360 { yt-dlp -f "bv*[height<=360]+ba/b" @args }
function yt480 { yt-dlp -f "bv*[height<=480]+ba/b" @args }
function yt720 { yt-dlp -f "bv*[height<=720]+ba/b" @args }
function ytx { yt-dlp -x @args }


function cppyhere {
    $fileName = "copyparty-en.py"
    $url = "https://github.com/9001/copyparty/releases/latest/download/copyparty-en.py"
    if (Test-Path $fileName) {
        Remove-Item $fileName
    }
    Invoke-WebRequest -Uri $url -OutFile $fileName
    python $fileName
}
