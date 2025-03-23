#Requires AutoHotkey v1

#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

TauonAPI := new Tauon()

; ComObj idle fix
If (ProcessExist("tauon.exe")) {
    TauonAPI.KeepAlive()
    ToolTip("Tauon detected", A_ScreenWidth, A_ScreenHeight, , 5000)
    SetTimer, TauonKeepAlive, 60000
}
TauonKeepAlive:
    TauonAPI.KeepAlive()
Return

; Override toggle
#If, ProcessExist("tauon.exe")
    !NumLock::
        TauonAPI.Override := !TauonAPI.Override
        ToolTip("Tauon override: " . TauonAPI.Override, A_ScreenWidth, A_ScreenHeight, , 5000)
    Return
#If

#If, ProcessExist("tauon.exe") && TauonAPI.Override
    $CapsLock::TauonAPI.DisplaySongInfo()

    $Media_Prev::
        TauonAPI.SendCommand("back")
        TauonAPI.DisplaySongInfo()
    Return

    $Media_Next::
        TauonAPI.SendCommand("next")
        TauonAPI.DisplaySongInfo()
    Return

    $Volume_Down::
        TauonAPI.SendCommand("setvolumerel/-5")
        TauonAPI.DisplayVolumeInfo("-")
    Return

    $Volume_Up::
        TauonAPI.SendCommand("setvolumerel/5")
        TauonAPI.DisplayVolumeInfo("+")
    Return

    $Media_Play_Pause::TauonAPI.SwitchPlayState()
#If

class Tauon {
    __New() {
        this.API := "http://localhost:7814/api1/"
        this.HttpObj := ComObjCreate("WinHttp.WinHttpRequest.5.1")
        this.Override := 1
    }

    SendCommand(command) {
        this.HttpObj.Open("GET", this.API . command, false)
        this.HttpObj.Send()
    }

    KeepAlive() {
        this.SendCommand("version")
    }

    GetStatus() {
        this.HttpObj.Open("GET", this.API . "status", false)
        this.HttpObj.Send()
        this.HttpObj.WaitForResponse()
        Return this.HttpObj.ResponseText
    }

    DisplaySongInfo() {
        pattern1 := """artist"": ""(.*?)"","
        pattern2 := """title"": ""(.*?)"","
        ResponseText := this.GetStatus()
        RegExMatch(ResponseText, pattern1, artist)
        RegExMatch(ResponseText, pattern2, title)
        ToolTip(artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
    }

    DisplayVolumeInfo(change) {
        pattern := """volume"": (.*?),"
        ResponseText := this.GetStatus()
        RegExMatch(ResponseText, pattern, volume)
        ToolTip("Volume set to: " . volume1 . change, A_ScreenWidth, A_ScreenHeight, , 2000)
    }

    SwitchPlayState() {
        pattern := """status"": ""(.*?)"","
        pattern1 := """artist"": ""(.*?)"","
        pattern2 := """title"": ""(.*?)"","
        ResponseText := this.GetStatus()
        RegExMatch(ResponseText, pattern, playState)
        RegExMatch(ResponseText, pattern1, artist)
        RegExMatch(ResponseText, pattern2, title)
        If (playState1 = "paused" || playState1 = "stopped") {
            this.SendCommand("play")
            ToolTip("Playing`n" . artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
        }
        Else {
            this.SendCommand("pause")
            ToolTip("Paused`n" . artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
        }
    }
}

ProcessExist(Name) {
    Process, Exist, %Name%
    return Errorlevel
}

ToolTip(Text := "", X := "", Y := "", WhichToolTip := 1, Timeout := "") {
    ; https://www.autohotkey.com/boards/viewtopic.php?t=65494
    ToolTip, % Text, X, Y, WhichToolTip

    if (Timeout) {
        RemoveToolTip := Func("ToolTip").Bind(, , , WhichToolTip)
        SetTimer, % RemoveToolTip, % -Timeout
    }
}

$!CapsLock::Reload
$^!CapsLock::
    ObjRelease(TauonAPI.HttpObj)
ExitApp

; TODO implement seek
; TODO get duration and progress from status and display it in tooltips
; TODO make class (tried but encountered issues with comobj)

; unicode chars show up as raw, tried to escape them to no avail
; ReplaceUnicodeEscapes(inputString) {
;     return RegExReplace(inputString, "\\u([0-9A-Fa-f]{4})", Func("UnicodeToChar"))
; }

; UnicodeToChar(hex) {
;     return Chr("0x" . hex)
; }
