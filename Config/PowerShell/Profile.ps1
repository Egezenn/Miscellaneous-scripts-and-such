# shellstuff

Invoke-Expression (& starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })

Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

Set-PSReadLineKeyHandler -Chord "Ctrl+RightArrow" -Function ForwardWord

function .. { Set-Location .. }
function ~ { Set-Location ~ }
function / { Set-Location / }
function c { Clear-Host }
function cwd { (Get-Location).Path }

Remove-Item Alias:history -Force
$historyPath = (Get-PSReadlineOption).HistorySavePath
function history {
    param(
        [int]$Count = 10
    )
    $lines = Get-Content $historyPath
    $startIndex = [Math]::Max(0, $lines.Count - $Count)
    for ($i = $startIndex; $i -lt $lines.Count; $i++) {
        "{0,4} | {1}" -f ($i + 1), $lines[$i]
    }
}
function histfile { Invoke-Item $historyPath }
function hpure { Get-Content $historyPath }
function hgrep { Get-Content $historyPath | rg $args }
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

#########################################################################################

# package managerment
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
    winget update --all
}
function updateallx {
    pacman -Syu --noconfirm
    # choco upgrade all -y
    winget update --all
    uv tool upgrade --all
    # dotnet tool update --all -g
}

function win { winget install @args }
function wun { winget uninstall @args }
function wup { winget update @args }
function wse { winget search @args }

# Filesystem exploration
Remove-Item Alias:ls -Force
function ls { lsd $args }
function lnn { lsd --color=never --icon never $args }
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

function exp {
    param(
        [string]$Path = "."
    )
    Explorer++.exe $Path
}
function y {
    $tmp = [System.IO.Path]::GetTempFileName()
    yazi $args --cwd-file="$tmp"
    $cwd = Get-Content -Path $tmp -Encoding UTF8
    if (-not [String]::IsNullOrEmpty($cwd) -and $cwd -ne $PWD.Path) {
        Set-Location -LiteralPath ([System.IO.Path]::GetFullPath($cwd))
    }
    Remove-Item -Path $tmp
}
function es { & $env:USERPROFILE\bin\void\es.exe -instance "1.5a" $args }
function rgn { rg -NI --color never $args }

# dev

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

# git
function gitcom {
    # hopes and prayers
    git checkout main
    git checkout master
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
function gitreset { git reset --hard HEAD }
function gitresetback {
    param([int]$count)
    git reset --hard ("HEAD~" + $count)
}

# misc

function editprofile { edit $env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1 }
function markhidden { attrib +h /d .\.* }
function msbuild { & "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" $args }
function pkill { taskkill /F /IM @args }
function whr { & "C:\Windows\System32\where.exe" @args }

function clipw { win32yank -i $args }
function office2pdf { & 'C:\Program Files\LibreOffice\program\soffice.exe' --headless --convert-to pdf @args }

function ucrt64 { & "C:/msys64/msys2_shell.cmd" -defterm -here -no-start -ucrt64 -shell bash }
function mingw64 { & "C:/msys64/msys2_shell.cmd" -defterm -here -no-start -mingw64 -shell bash }
function msys2 { & "C:/msys64/msys2_shell.cmd" -defterm -here -no-start -msys2 -shell bash }


function yt { yt-dlp @args }
function yt144 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=144]+ba/b" @args }
function yt240 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=240]+ba/b" @args }
function yt360 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=360]+ba/b" @args }
function yt480 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=480]+ba/b" @args }
function yt720 { Set-Location ~\Videos && yt-dlp -f "bv*[height<=720]+ba/b" @args }
function yt144s { Set-Location ~\Videos && yt-dlp -f "bv*[height<=144]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt240s { Set-Location ~\Videos && yt-dlp -f "bv*[height<=240]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt360s { Set-Location ~\Videos && yt-dlp -f "bv*[height<=360]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt480s { Set-Location ~\Videos && yt-dlp -f "bv*[height<=480]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function yt720s { Set-Location ~\Videos && yt-dlp -f "bv*[height<=720]+ba/b" --write-sub --write-auto-sub --sub-lang "en.*" @args }
function ytx { Set-Location ~\Music && yt-dlp -x @args }

function steams { & 'C:\Program Files (x86)\Steam\steam.exe' -silent }
function steamc { & 'C:\Program Files (x86)\Steam\steam.exe' -userchooser }
function steamq { & 'C:\Program Files (x86)\Steam\steam.exe' -exitsteam }
function steamqq { pkill steam.exe && sleep 1 && pkill steamerrorreporter64.exe }

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
