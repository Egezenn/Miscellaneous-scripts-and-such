Clear-Host
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/theme.json" | Invoke-Expression
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

function hpure { Get-Content (Get-PSReadlineOption).HistorySavePath }
function hgrep { Get-Content (Get-PSReadlineOption).HistorySavePath | grep $args }

Remove-Item Alias:ls -Force
function ls { lsd $args }
function lsps { Get-ChildItem $args }
function lsa { lsd -A $args }
function lst { lsd --tree $args }
function cds { Set-Location $args[0] && lsd }
function cwd { (Get-Location).Path }

# executables
function updatelist { 
    pacman -Sy
    pacman -Qu
    choco outdated
    winget update
}
function updateall {
    pacman -Syu --noconfirm
    choco upgrade all -y
    pipx upgrade-all
    winget update --all
}

function gitscommit { git add . && git commit -m $args }
function gitrecommit { git reset --soft HEAD~1 && git add -A && git commit -m $args }
function gitrestore { git reset --soft HEAD~1 && git restore --staged . }

function markhidden { attrib +h /d .\.* }

function pipreset { pip freeze | xargs pip uninstall -y && pip install pipx }
function acvenv { .\.venv\Scripts\activate }
function createvenv { python -m venv .venv }
function createvenvi { python -m venv .venv && acvenv && pip install -r .\requirements.txt }

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
