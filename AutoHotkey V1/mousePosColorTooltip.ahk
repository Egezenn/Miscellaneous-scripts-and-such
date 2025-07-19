#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen

; ctrl+number = standard/raw data
; ctrl+shift+number = ahk format
; ctrl+alt+capslock = switch places of red & blue
; (RGB, BGR, default: RGB)
; ctrl+alt+shift+capslock = switch tooltip mode
; (fast & on mouse, slow & on bottom right, default: slow & on bottom right)

convert := False
tooltipMode := 0
winClass := ""

Loop {
    MouseGetPos, screenX, screenY, vWin
    CoordMode, Mouse, Relative
    MouseGetPos, windowX, windowY, vWin
    CoordMode, Mouse, Screen

    PixelGetColor, colorHex, %screenX%, %screenY%
    colorHex := StrReplace(colorHex, "0x")
    RegExMatch(colorHex, "(.{2})(.{2})(.{2})", colorRaw)
    ; workaround for bgr
    If convert {
        color := colorRaw1 colorRaw2 colorRaw3
        colorR := Format("{:d}", "0x" colorRaw1)
        colorG := Format("{:d}", "0x" colorRaw2)
        colorB := Format("{:d}", "0x" colorRaw3)
    }
    Else {
        color := colorRaw3 colorRaw2 colorRaw1
        colorR := Format("{:d}", "0x" colorRaw3)
        colorG := Format("{:d}", "0x" colorRaw2)
        colorB := Format("{:d}", "0x" colorRaw1)
    }
    colorRGB := colorR . ", " . colorG . ", " . colorB

    ; prevent getting info of tooltip window
    winClassPrev := winClass
    WinGetClass, winClass, ahk_id %vWin%
    If (not RegExMatch(winClass, "^tooltips_class\d+")) {
        WinGet, winExe, ProcessName, ahk_id %vWin%
        WinGetTitle, winTitle, ahk_id %vWin%
    }
    Else
        winClass := winClassPrev

    If tooltipMode
        ToolTip, %screenX%`, %screenY% | %windowX%`, %windowY%`n%color% | %colorRGB% / %convert%`n%winExe%`n%winClass%`n%winTitle%
    Else {
        ToolTip, %screenX%`, %screenY% | %windowX%`, %windowY%`n%color% | %colorRGB% / %convert%`n%winExe%`n%winClass%`n%winTitle%, A_ScreenWidth, A_ScreenHeight
        Sleep, 100
    }
}

^1::
    Clipboard=%screenX%, %screenY%
    ToolTip, %screenX%`, %screenY%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^+1::
    Clipboard=MouseClick, L, %screenX%, %screenY%
    ToolTip, MouseClick`, L`, %screenX%`, %screenY%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^2::
    Clipboard=%windowX%, %windowY%
    ToolTip, %windowX%`, %windowY%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^+2::
    Clipboard=MouseClick, L, %windowX%, %windowY%
    ToolTip, MouseClick`, L`, %windowX%`, %windowY%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^3::
    Clipboard=#%color%
    ToolTip, #%color%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^+3::
    Clipboard=%colorHex%
    ToolTip, %colorHex%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^!+3::
    Clipboard=%colorRGB%
    ToolTip, %colorRGB%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^4::
    Clipboard=%winExe%
    ToolTip, %winExe%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^+4::
    Clipboard=ahk_exe %winExe%
    ToolTip, ahk_exe %winExe%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^5::
    Clipboard=%winClass%
    ToolTip, %winClass%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^+5::
    Clipboard=ahk_class %winClass%
    ToolTip, ahk_class %winClass%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return
^6::
    Clipboard=%winTitle%
    ToolTip, %winTitle%, A_ScreenWidth, A_ScreenHeight//2, 2
    Sleep, 1000
    ToolTip,,,, 2
Return

^!CapsLock::convert := !convert
^!+CapsLock::tooltipMode := !tooltipMode

; -----------------------------------------------------

!+CapsLock::Suspend
^!Esc::ExitApp
