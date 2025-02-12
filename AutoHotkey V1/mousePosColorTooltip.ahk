#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen

convert := True

Loop {
    MouseGetPos, posX, posY
    PixelGetColor, color, %posX%, %posY%
    color := StrReplace(color, "0x")
    RegExMatch(color, "(.{2})(.{2})(.{2})", colors) ; BGR TO RGB
    ; ToolTip, %posX%`n%posY%`n%colors3%`n%colors2%`n%colors1% ;`n%A_Hour%:%A_Min%:%A_Sec%
    If (convert) {
        ToolTip, X: %posX%`nY: %posY%`nR: %colors3%`nG: %colors2%`nB: %colors1%`nConvert: %convert%
    }
    Else {
        ToolTip, X: %posX%`nY: %posY%`nR: %colors1%`nG: %colors2%`nB: %colors3%`nConvert: %convert%
    }
}

^LButton::
    Clipboard=%posX%, %posY%
Return

+LButton::
    If (convert) {
        Clipboard=%colors3%%colors2%%colors1%
    }
    Else {
        Clipboard=%colors1%%colors2%%colors3%
    }
Return

^!CapsLock::
    convert := !convert
Return

;~ -----------------------------------------------------

!+CapsLock::Suspend
^!CapsLock::ExitApp
