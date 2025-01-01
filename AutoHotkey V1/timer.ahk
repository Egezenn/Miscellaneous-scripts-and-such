#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

SetTimer, UpdateGUI, 1000
startTime := A_TickCount

Gui +LastFound +AlwaysOnTop -Caption +ToolWindow
Gui, Color, 000000
Gui, Font, s12 cWhite, Arial
Gui, Add, Text, x10 y8 w70 h20 Center vTimeDisplay, 00:00
Gui, Show, x1400 y0 w90 h35 NoActivate, Script Uptime

UpdateGUI:
    currentTime := A_TickCount - startTime
    minutes := Floor(currentTime / 60000)
    seconds := Floor((currentTime - minutes * 60000) / 1000)
    timeString := Format("{:02d}:{:02d}", minutes, seconds)
    GuiControl,, TimeDisplay, % timeString
Return

^!CapsLock::ExitApp
