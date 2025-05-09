#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

global defaultPointerSpeed := 10
global drawingPointerSpeed := 5
global drawToggle := 0
DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, defaultPointerSpeed, UInt, 0)

WaitModifierKeys() {
  KeyWait, Ctrl
  KeyWait, Alt
  KeyWait, Shift
}

AltShiftSend(key) {
  IfWinActive, ahk_exe gInk.exe
  {
    Send, {Alt down}
    Send, {Tab}
    Send, {Alt up}
  }

  Send {Alt down}
  Send {Shift down}
  Send {%key% down}
  Sleep, 5
  Send {%key% up}
  Send {Alt up}
  Send {Shift up}
  Return
}

SendBindIfProcessExistElseSendNthFunc(function) {
  global defaultPointerSpeed
  global drawingPointerSpeed
  global drawToggle

  Process, Exist, gInk.exe
  if !ErrorLevel {
    ExitApp
    Return
  }

  else {
    drawToggle := !drawToggle
    If (drawToggle)
      DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, drawingPointerSpeed, UInt, 0)
    Else
      DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, defaultPointerSpeed, UInt, 0)
    Send %function%
  }
  Return
}

SendBindIfProcessExistElseSendNthKey(key) {
  Process, Exist, gInk.exe
  if !ErrorLevel {
    ExitApp
    Return
  }

  else {
    Send {Ctrl down}
    Send {Alt down}
    Send {Shift down}
    Send {%key% down}
    Sleep, 5
    Send {%key% up}
    Send {Alt up}
    Send {Shift up}
    Send {Ctrl up}
  }

  Return
}

; -----------------------------------------------------
; Main

Loop {
  If (WinActive("ahk_exe gInk.exe")) {
    DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, drawingPointerSpeed, UInt, 0)
  }
  Else {
    DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, defaultPointerSpeed, UInt, 0)
  }
  Sleep, 5
}

; Side buttons of the mouse
$XButton1::SendBindIfProcessExistElseSendNthFunc(AltShiftSend("z"))
$XButton2::SendBindIfProcessExistElseSendNthKey("z")

; Intermediary keys to recieve from the drawing tablet
$^!+F11::
  WaitModifierKeys()
  SendBindIfProcessExistElseSendNthFunc(AltShiftSend("z"))
Return

$^!+F12::
  WaitModifierKeys()
  SendBindIfProcessExistElseSendNthKey("z")
Return

$^!+F5::
  WaitModifierKeys()
Return

$^!+F6::
  WaitModifierKeys()
Return

$^!+F7::
  WaitModifierKeys()
Return

$^!+F8::
  WaitModifierKeys()
Return

$^!+F9::
  WaitModifierKeys()
Return

$^!+F10::
  WaitModifierKeys()
Return

; ---------------------------------------------------------------
; Program specific

#IfWinActive, ahk_exe gInk.exe
  $^!+F5::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("s")
  Return

  $^!+F6::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("d")
  Return
  $^!+F7::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("f")
  Return
  $^!+F8::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("e")
  Return
  $^!+F9::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("x")
  Return
  $^!+F10::
    WaitModifierKeys()
    SendBindIfProcessExistElseSendNthKey("c")
  Return
#IfWinActive

; ---------------------------------------------------------------

$!CapsLock::Reload
$^!CapsLock::
  Process, Close, gInk.exe
  DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, defaultPointerSpeed, UInt, 0)
ExitApp
Return
