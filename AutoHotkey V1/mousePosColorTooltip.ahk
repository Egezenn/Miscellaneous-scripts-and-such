#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen

Loop {
    MouseGetPos, posX, posY
    PixelGetColor, color, %posX%, %posY%
    color := StrReplace(color, "0x")
    ToolTip, %posX%`n%posY%`n%color% ;`n%A_Hour%:%A_Min%:%A_Sec%
}

^LButton::
    Clipboard=%posX%, %posY%
Return

+LButton::
    color := StrReplace(color, "0x")
    Clipboard=%color%
Return

; -----------------------------------------------------

CapsLock::Suspend
^!CapsLock::ExitApp
