#Requires AutoHotkey v1.0

#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

SetDefaultMouseSpeed, 0
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen

tip := 0

#IfWinActive, ahk_exe DungeonRampage.exe
    #F1::
        if !tip
        {
            ToolTip, Requires 1920x1080 at fullscreen`n`nWin+F1: show this help`nF1: go to latest non-boss map`n`nNumpad1: click all friends on current page`nNumpad2: next page`nNumpad3: send gifts`n`nNumpad4: game end add all`nNumpad5: game end chest abandon (no-key)`nNumpad6: game end chest abandon (key)`n`nNumpad7: select index to abandon chests from`nNumpad8: abandon chest at index, A_ScreenWidth, A_ScreenHeight
            tip := !tip
        }
        else
        {
            ToolTip
            tip := !tip
        }
    Return

    Esc:: ; modals aren't closable by escape..
        MouseGetPos, tempX, tempY,
        MouseClick, L, 1596, 47
        MouseMove, tempX, tempY
    Return

    F1:: ; go to latest non-boss map
        MouseClick, L, 986, 358
        Sleep, 200
        MouseClick, L, 1243, 517
        Sleep, 200
        MouseClick, L, 1131, 718
    Return

    Numpad1:: ; click all friends on current page
        ; turn these into arrays, or not. not worth the effort
        MouseClick, L, 535, 425
        MouseClick, L, 737, 425
        MouseClick, L, 950, 425
        MouseClick, L, 1146, 425
        MouseClick, L, 1353, 425

        MouseClick, L, 535, 585
        MouseClick, L, 744, 585
        MouseClick, L, 931, 585
        MouseClick, L, 1147, 585
        MouseClick, L, 1355, 585

        MouseClick, L, 535, 740
        MouseClick, L, 736, 740
        MouseClick, L, 928, 740
        MouseClick, L, 1149, 740
        MouseClick, L, 1352, 740
    Return

    Numpad2::MouseClick, L, 1179, 917 ; next page

    Numpad3:: ; send gems
        MouseClick, L, 1061, 955
        Sleep, 100
        MouseClick, L, 961, 659
        Sleep, 100
        MouseClick, L, 967, 596
        Sleep, 100
        MouseClick, L, 1570, 69
    Return

    Numpad4:: ; game end add all
        MouseGetPos, tempX, tempY,
        MouseClick, L, 875, 386
        MouseClick, L, 1163, 387
        MouseClick, L, 1474, 385
        MouseMove, tempX, tempY
    Return

    Numpad5:: ; game end chest abandon (no-key)
        MouseGetPos, tempX, tempY,
        MouseClick, L, 848, 695
        Sleep, 50
        MouseClick, L, 817, 917
        MouseMove, tempX, tempY
    Return

    Numpad6:: ; game end chest abandon (key)
        MouseGetPos, tempX, tempY,
        MouseClick, L, 850, 728
        Sleep, 50
        MouseClick, L, 817, 917
        MouseMove, tempX, tempY
    Return

    ; select index to abandon chests from
    Numpad7::MouseGetPos, abandonX, abandonY
    Numpad8:: ; abandon chest at index
        MouseClick, L, abandonX, abandonY
        Sleep, 50
        MouseClick, L, 560, 520
        Sleep, 50
        MouseClick, L, 816, 608
    Return
#IfWinActive

!CapsLock::Reload
^CapsLock::Suspend