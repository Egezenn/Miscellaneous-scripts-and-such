#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

SetTimer, DPad_MouseMovement, 10
SetTimer, L2R2MouseScroll, 10
SetTimer, XY_Axis_MouseMovement, 10
SetTimer, RU_Axis_CursorMovement, 10

; 50+10(sens)+15(turbo)
Sensitivity := 10
TurboThreshold := 15
Minimum := 0
Maximum := 100
DPad_MouseIncrement := 4
MouseIncrement := 8
TurboMouseIncrement := 16
NormalSleepTime := 100
TurboSleepTime := 20
OSK_State := 0

#If, !WinActive("ahk_exe retroarch.exe")
	Joy1:: ; A
		Send, {LWin down}
		KeyWait, Joy1
		Send, {LWin up}
	Return

	Joy2:: ; B
		Send, {LCtrl down}
		KeyWait, Joy2
		Send, {LCtrl up}
	Return

	Joy3:: ; X
		Send, {LAlt down}
		KeyWait, Joy3
		Send, {LAlt up}
	Return

	Joy4:: ; Y
		Send, {LShift down}
		KeyWait, Joy4
		Send, {LShift up}
	Return

	Joy5:: ; L1
		Send, {LButton down}
		KeyWait, Joy5
		Send, {LButton up}
	Return

	Joy6:: ; R1
		Send, {RButton down}
		KeyWait, Joy6
		Send, {RButton up}
	Return

	Joy7:: ; BACK
		If (!OSK_State) {
			Run, "osk.ahk" ; https://github.com/henrystern/ahk_on_screen_keyboard/blob/main/osk.ahk
			OSK_State := !OSK_State
		}
		Else {
			Send, {F15}
			OSK_State := !OSK_State
		}
	Return

	Joy8:: ; START
		If !WinExist("ahk_exe retroarch.exe")
			RunWait, RetroArch.lnk
		WinActivate, ahk_exe retroarch.exe
	Return

	Joy9::Esc ; XY

	Joy10::BackSpace ; RU
#If

DPad_MouseMovement:
	If (!WinActive("ahk_exe retroarch.exe")) {
		GetKeyState, Controller_POV, JoyPOV
		If (Controller_POV == 0) {
			MouseMove, 0, -DPad_MouseIncrement, 0, R
		}
		Else If (Controller_POV == 4500) {
			MouseMove, DPad_MouseIncrement, -DPad_MouseIncrement / 2, 0, R
		}
		Else If (Controller_POV == 9000) {
			MouseMove, DPad_MouseIncrement, 0, 0, R
		}
		Else If (Controller_POV == 13500) {
			MouseMove, DPad_MouseIncrement, DPad_MouseIncrement / 2, 0, R
		}
		Else If (Controller_POV == 18000) {
			MouseMove, 0, DPad_MouseIncrement, 0, R
		}
		Else If (Controller_POV == 22500) {
			MouseMove, -DPad_MouseIncrement, DPad_MouseIncrement / 2, 0, R
		}
		Else If (Controller_POV == 27000) {
			MouseMove, -DPad_MouseIncrement, 0, 0, R
		}
		Else If (Controller_POV == 31500) {
			MouseMove, -DPad_MouseIncrement, -DPad_MouseIncrement / 2, 0, R
		}
	}
Return

L2R2MouseScroll:
	If (!WinActive("ahk_exe retroarch.exe")) {
		GetKeyState, Controller_Z_Axis, JoyZ
		If (Controller_Z_Axis >=  50 + Sensitivity && Controller_Z_Axis <= 50 + Sensitivity + TurboThreshold) {
			Send, {WheelUp}
			Sleep, NormalSleepTime
		}
		Else If (Controller_Z_Axis <= 50 - Sensitivity && Controller_Z_Axis >= 50 - Sensitivity - TurboThreshold) {
			Send, {WheelDown}
			Sleep, NormalSleepTime
		}
		Else If (Controller_Z_Axis >=  50 + Sensitivity + TurboThreshold && Controller_Z_Axis <= Maximum) {
			Send, {WheelUp}
			Sleep, TurboSleepTime
		}
		Else If (Controller_Z_Axis <= 50 - Sensitivity - TurboThreshold && Controller_Z_Axis >=  Minimum) {
			Send, {WheelDown}
			Sleep, TurboSleepTime
		}
	}
Return

XY_Axis_MouseMovement:
	If (!WinActive("ahk_exe retroarch.exe")) {
		GetKeyState, Controller_X_Axis, JoyX
		GetKeyState, Controller_Y_Axis, JoyY

		; LEFT&UP
		If ((Controller_X_Axis <= 50 - Sensitivity && Controller_X_Axis >= 50 - Sensitivity - TurboThreshold) && (Controller_Y_Axis <= 50 - Sensitivity && Controller_Y_Axis >= 50 - Sensitivity - TurboThreshold))
			MouseMove, -MouseIncrement / 2, -MouseIncrement / 2, 0, R
		Else If ((Controller_X_Axis <= 50 - Sensitivity - TurboThreshold) && (Controller_Y_Axis <= 50 - Sensitivity - TurboThreshold))
			MouseMove, -TurboMouseIncrement / 2, -TurboMouseIncrement / 2, 0, R
		; RIGHT&UP
		Else If ((Controller_X_Axis >= 50 + Sensitivity && Controller_X_Axis <= 50 + Sensitivity + TurboThreshold) && (Controller_Y_Axis <= 50 - Sensitivity && Controller_Y_Axis >= 50 - Sensitivity - TurboThreshold))
			MouseMove, MouseIncrement / 2, -MouseIncrement / 2, 0, R
		Else If ((Controller_X_Axis >=  50 + Sensitivity + TurboThreshold) && (Controller_Y_Axis <= 50 - Sensitivity - TurboThreshold))
			MouseMove, TurboMouseIncrement / 2, -TurboMouseIncrement / 2, 0, R
		; RIGHT&DOWN
		Else If ((Controller_X_Axis >= 50 + Sensitivity && Controller_X_Axis <= 50 + Sensitivity + TurboThreshold) && (Controller_Y_Axis >= 50 + Sensitivity && Controller_Y_Axis <= 50 + Sensitivity + TurboThreshold))
			MouseMove, MouseIncrement / 2, MouseIncrement / 2, 0, R
		Else If ((Controller_X_Axis >=  50 + Sensitivity + TurboThreshold) && (Controller_Y_Axis >=  50 + Sensitivity + TurboThreshold))
			MouseMove, TurboMouseIncrement / 2, TurboMouseIncrement / 2, 0, R
		; LEFT&DOWN
		Else If ((Controller_X_Axis <= 50 - Sensitivity && Controller_X_Axis >= 50 - Sensitivity - TurboThreshold) && (Controller_Y_Axis >= 50 + Sensitivity && Controller_Y_Axis <= 50 + Sensitivity + TurboThreshold))
			MouseMove, -MouseIncrement / 2, MouseIncrement / 2, 0, R
		Else If ((Controller_X_Axis <= 50 - Sensitivity - TurboThreshold) && (Controller_Y_Axis >=  50 + Sensitivity + TurboThreshold))
			MouseMove, -TurboMouseIncrement / 2, TurboMouseIncrement / 2, 0, R
		; LEFT
		Else If (Controller_X_Axis <= 50 - Sensitivity && Controller_X_Axis >= 50 - Sensitivity - TurboThreshold)
			MouseMove, -MouseIncrement, 0, 0, R
		Else If (Controller_X_Axis <= 50 - Sensitivity - TurboThreshold)
			MouseMove, -TurboMouseIncrement, 0, 0, R
		; RIGHT
		Else If (Controller_X_Axis >= 50 + Sensitivity && Controller_X_Axis <= 50 + Sensitivity + TurboThreshold)
			MouseMove, MouseIncrement, 0, 0, R
		Else If (Controller_X_Axis >=  50 + Sensitivity + TurboThreshold)
			MouseMove, TurboMouseIncrement, 0, 0, R
		; UP
		Else If (Controller_Y_Axis <= 50 - Sensitivity && Controller_Y_Axis >= 50 - Sensitivity - TurboThreshold)
			MouseMove, 0, -MouseIncrement, 0, R
		Else If (Controller_Y_Axis <= 50 - Sensitivity - TurboThreshold)
			MouseMove, 0, -TurboMouseIncrement, 0, R
		; DOWN
		Else If (Controller_Y_Axis >= 50 + Sensitivity && Controller_Y_Axis <= 50 + Sensitivity + TurboThreshold)
			MouseMove, 0, MouseIncrement, 0, R
		Else If (Controller_Y_Axis >=  50 + Sensitivity + TurboThreshold)
			MouseMove, 0, TurboMouseIncrement, 0, R
	}
Return

RU_Axis_CursorMovement:
	If (!WinActive("ahk_exe retroarch.exe")) {
		GetKeyState, Controller_U_Axis, JoyU
		GetKeyState, Controller_R_Axis, JoyR

		If (Controller_U_Axis <= 50 - Sensitivity && Controller_U_Axis >= 50 - Sensitivity - TurboThreshold) {
			Send, {Left}
			Sleep, NormalSleepTime
		}
		Else If (Controller_U_Axis <= 50 - Sensitivity - TurboThreshold) {
			Send, {Left}
			Sleep, TurboSleepTime
		}
		Else If (Controller_U_Axis >= 50 + Sensitivity && Controller_U_Axis <= 50 + Sensitivity + TurboThreshold) {
			Send, {Right}
			Sleep, NormalSleepTime
		}
		Else If (Controller_U_Axis >=  50 + Sensitivity + TurboThreshold) {
			Send, {Right}
			Sleep, TurboSleepTime
		}

		If (Controller_R_Axis <= 50 - Sensitivity && Controller_R_Axis >= 50 - Sensitivity - TurboThreshold) {
			Send, {Up}
			Sleep, NormalSleepTime
		}
		Else If (Controller_R_Axis <= 50 - Sensitivity - TurboThreshold) {
			Send, {Up}
			Sleep, TurboSleepTime
		}
		Else If (Controller_R_Axis >= 50 + Sensitivity && Controller_R_Axis <= 50 + Sensitivity + TurboThreshold) {
			Send, {Down}
			Sleep, NormalSleepTime
		}
		Else If (Controller_R_Axis >=  50 + Sensitivity + TurboThreshold) {
			Send, {Down}
			Sleep, TurboSleepTime
		}
	}
Return

^!CapsLock::ExitApp

; This script could be condensed, I didn't have the patience of thinking that structure that'd be better, so copy paste it was and will probably stay as that.