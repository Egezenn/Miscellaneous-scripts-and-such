#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

HttpObj := ComObjCreate("WinHttp.WinHttpRequest.5.1")
TauonAPI := "http://localhost:7814/api1/"
TauonOverride := 1

; Make sure to turn off the timer or exit the script
If (ProcessExist("tauon.exe")) {
    TauonKeepAlive()
    SetTimer, TauonKeepAlive, 1000
}

#If, ProcessExist("tauon.exe")
    !NumLock::
        TauonOverride := !TauonOverride
        ToolTip("Tauon override: " . TauonOverride, A_ScreenWidth, A_ScreenHeight, , 5000)
    Return
#If

; #If, ProcessExist("tauon.exe") && TauonOverride
;     $CapsLock::TauonDisplaySongInfo()

;     $Media_Prev::
;         TauonSendCommand("back")
;         TauonDisplaySongInfo()
;     Return

;     $Media_Next::
;         TauonSendCommand("next")
;         TauonDisplaySongInfo()
;     Return

;     $Volume_Down::
;         TauonSendCommand("setvolumerel/-5")
;         TauonDisplayVolumeInfo("-")
;     Return

;     $Volume_Up::
;         TauonSendCommand("setvolumerel/5")
;         TauonDisplayVolumeInfo("+")
;     Return

;     $Media_Play_Pause::TauonSwitchPlayState()
; #If

ToolTip(Text := "", X := "", Y := "", WhichToolTip := 1, Timeout := "") {
    ; https://www.autohotkey.com/boards/viewtopic.php?t=65494
    ToolTip, % Text, X, Y, WhichToolTip

    if (Timeout) {
        RemoveToolTip := Func("ToolTip").Bind(, , , WhichToolTip)
        SetTimer, % RemoveToolTip, % -Timeout
    }
}

ProcessExist(Name) {
    Process,Exist,%Name%
    Return Errorlevel
}

TauonSendCommand(command) {
    global HttpObj, TauonAPI
    HttpObj.Open("GET", TauonAPI . command, false)
    HttpObj.Send()
}

TauonKeepAlive() {
    TauonSendCommand("version")
}

TauonGetStatus() {
    global HttpObj, TauonAPI
    HttpObj.Open("GET", TauonAPI . "status", false)
    HttpObj.Send()
    HttpObj.WaitForResponse()
    Return HttpObj.ResponseText
}

TauonDisplaySongInfo() {
    pattern1 := """artist"": ""(.*?)"","
    pattern2 := """title"": ""(.*?)"","
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern1, artist)
    RegExMatch(ResponseText, pattern2, title)
    ToolTip(artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
}

TauonDisplayVolumeInfo(change) {
    pattern := """volume"": (.*?),"
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern, volume)
    ToolTip("Volume set to: " . volume1 . change, A_ScreenWidth, A_ScreenHeight, , 2000)
}

TauonSwitchPlayState() {
    pattern := """status"": ""(.*?)"","
    pattern1 := """artist"": ""(.*?)"","
    pattern2 := """title"": ""(.*?)"","
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern, playState)
    RegExMatch(ResponseText, pattern1, artist)
    RegExMatch(ResponseText, pattern2, title)
    If (playState1 = "paused" || playState1 = "stopped") {
        TauonSendCommand("play")
        ToolTip("Playing`n" . artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
    }
    Else {
        TauonSendCommand("pause")
        ToolTip("Paused`n" . artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
    }
    ;
}

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
$^!CapsLock::
    ObjRelease(HttpObj)
ExitApp
