#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

HttpObj := ComObjCreate("WinHttp.WinHttpRequest.5.1")
TauonBaseURL := "http://localhost:7814/api1/"

#If, ProcessExist("tauon.exe")
    ; Global hotkeys for media control (Has some overhead to initialize after some time)

    $Media_Prev::
        TauonSendCommand("back")
        TauonDisplaySongInfo()
    Return
    $CapsLock::
        TauonDisplaySongInfo()
    Return

    $Media_Next::
        TauonSendCommand("next")
        TauonDisplaySongInfo()
    Return

    $Volume_Down::
        TauonSendCommand("setvolumerel/-5")
        TauonDisplayVolumeInfo("-")
    Return

    $Volume_Up::
        TauonSendCommand("setvolumerel/5")
        TauonDisplayVolumeInfo("+")
    Return

    $Media_Play_Pause::TauonSwitchPlayState()
#IfWinActive

ToolTip(Text := "", X := "", Y := "", WhichToolTip := 1, Timeout := "") {
    ; https://www.autohotkey.com/boards/viewtopic.php?t=65494
    ToolTip, %Text, X, Y, WhichToolTip

    if (Timeout) {
        RemoveToolTip := Func("ToolTip").Bind(, , , WhichToolTip)
        SetTimer, %RemoveToolTip, % -Timeout
    }
}

ProcessExist(Name) {
    Process,Exist,%Name%
    Return Errorlevel
}

TauonSendCommand(command) {
    global HttpObj, TauonBaseURL
    URL := TauonBaseURL . command
    HttpObj.Open("GET", URL, false)
    HttpObj.Send()
}

TauonGetStatus(command) {
    global HttpObj, TauonBaseURL
    URL := TauonBaseURL . "status"
    HttpObj.Open("GET", URL, false)
    HttpObj.Send()
    HttpObj.WaitForResponse()
    Return HttpObj.ResponseText
}

TauonDisplaySongInfo() {
    global HttpObj, TauonBaseURL
    pattern1 := """artist"": ""(.*?)"","
    pattern2 := """title"": ""(.*?)"","
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern1, artist)
    RegExMatch(ResponseText, pattern2, title)
    ToolTip(artist1 . "`n" . title1, A_ScreenWidth, A_ScreenHeight, , 5000)
}

TauonDisplayVolumeInfo(change) {
    global HttpObj, TauonBaseURL
    pattern := """volume"": (.*?),"
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern, volume)
    ToolTip("Volume set to: " . volume1 . change, A_ScreenWidth, A_ScreenHeight, , 2000)
}

TauonSwitchPlayState() {
    global HttpObj, TauonBaseURL
    pattern := """status"": ""(.*?)"","
    ResponseText := TauonGetStatus()
    RegExMatch(ResponseText, pattern, playState)

    If (playState1 = "paused" || playState1 = "stopped") {
        TauonSendCommand("play")
        ToolTip("Playing", A_ScreenWidth, A_ScreenHeight, , 2000)
    }
    Else {
        TauonSendCommand("pause")
        ToolTip("Paused", A_ScreenWidth, A_ScreenHeight, , 2000)
    }
}
