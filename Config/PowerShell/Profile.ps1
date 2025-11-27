Clear-Host
Invoke-Expression (& starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })
Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

# path and history stuff
function .. { Set-Location .. }
function ~ { Set-Location ~ }
function / { Set-Location / }

Remove-Item Alias:history -Force
function history {
    param(
        [int]$Count = 10
    )

    $historyPath = (Get-PSReadlineOption).HistorySavePath
    $lines = Get-Content $historyPath

    $startIndex = [Math]::Max(0, $lines.Count - $Count)

    for ($i = $startIndex; $i -lt $lines.Count; $i++) {
        "{0,4} | {1}" -f ($i + 1), $lines[$i]
    }
}

$historyPath = (Get-PSReadlineOption).HistorySavePath
function histfile { Invoke-Item $historyPath }
function hpure { Get-Content $historyPath }
function hgrep { Get-Content $historyPath | rg $args }

Set-PSReadLineKeyHandler -Chord "Ctrl+RightArrow" -Function ForwardWord
Remove-Item Alias:ls -Force
function ls { lsd $args }
function l { lsd -l --blocks 'permission,size,name' $args }
function lld { lsd -l --blocks 'permission,size,date,name' --date '+%Y-%m-%d_%H-%M' $args }
function l1 { lsd -1 $args }
function lsps { Get-ChildItem $args }
function la { lsd -A $args }
function lt { lsd --tree --depth 3 $args }
function ltd { lsd --tree $args }
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
function markhidden { attrib +h /d .\.* }
function c { Clear-Host }
function reload {
    . $PROFILE
    Clear-Host
}

#########################################################################################
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
    git push -f
}
function gitrecommit {
    git reset --soft HEAD~1
    git commit -a -m $args
}
function gitrestore {
    param([int]$count)
    git reset --soft ("HEAD~" + $count)
    git restore --staged .
}
function gitreset {
    param([int]$count)
    git reset --hard ("HEAD~" + $count)
}

function exp {
    param(
        [string]$Path = "."
    )
    Explorer++.exe $Path
}

function code { codium $args }

function pipreset { pip freeze | xargs pip uninstall -y }
function acvenv { .\.venv\Scripts\activate }
function createvenv {
    python -m venv .venv
    acvenv
}
function createvenvi {
    python -m venv .venv
    acvenv
    pip install -r .\requirements.txt
}

function cbuild {
    mkdir build
    Set-Location build
    cmake ..
}
function msbuild { & "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" $args }

function office2pdf { & 'C:\Program Files\LibreOffice\program\soffice.exe' --headless --convert-to pdf @args }

function pkill { taskkill /F /IM @args }
function whr { & "C:\Windows\System32\where.exe" @args }

function win { winget install $args }
function wse { winget search $args }

function rgn { rg -NI --color never $args }

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
function yt144 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=144]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt240 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=240]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt360 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=360]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt480 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=480]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt720 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=720]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt144ns { Set-Location ~\Videos && yt-dlp -f "bv*[height<=144]+ba/b" @args }
function yt240ns { Set-Location ~\Videos && yt-dlp -f "bv*[height<=240]+ba/b" @args }
function yt360ns { Set-Location ~\Videos && yt-dlp -f "bv*[height<=360]+ba/b" @args }
function yt480ns { Set-Location ~\Videos && yt-dlp -f "bv*[height<=480]+ba/b" @args }
function yt720ns { Set-Location ~\Videos && yt-dlp -f "bv*[height<=720]+ba/b" @args }

function ytx { Set-Location ~\Music && yt-dlp -x @args }

function cppyhere { python copyparty-en.py }
function cppyhered {
    $fileName = "copyparty-en.py"
    $url = "https://github.com/9001/copyparty/releases/latest/download/copyparty-en.py"
    if (Test-Path $fileName) {
        Remove-Item $fileName
    }
    Invoke-WebRequest -Uri $url -OutFile $fileName
    python $fileName
}

function steams { & 'C:\Program Files (x86)\Steam\steam.exe' -silent }
function steamc { & 'C:\Program Files (x86)\Steam\steam.exe' -userchooser }
function steamq { & 'C:\Program Files (x86)\Steam\steam.exe' -exitsteam }
