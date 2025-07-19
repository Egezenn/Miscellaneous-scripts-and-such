#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

defaultVariable := "x"

#If (WinActive("ahk_exe VSCodium.exe"))
    "::$
    !"::\
    ^"::
        SendRaw, "
        KeyWait, LCtrl
    Return
    +"::& ; new object
    ; !^"::Send, \[\]{Left 2}
    ; !+"::Send, \(\){Left 2}

    F1::Send, {{}
    F2::Send, {}}
    F3::SendRaw, _
    F4::
        SendRaw, ^^
        Send, {Backspace}
    Return

    !F1::Send, (
    !F2::Send, )
    !F3::[
    !F4::]
    !F5::
        Send, !{F4}
    ExitApp

    ; -----------------------------------------------------

    ; send command
    sc(cmdName) {
        Send, \%cmdName%{{}{}}{Left}
        Return
    }

    ; send command with two parameters
    sct(cmdName) {
        Send, \%cmdName%{{}{}}{{}{}}{Left 3}
        Return
    }

    ; send command with a blank modifier
    scm(cmdName) {
        Send, \%cmdName%[]{{}{}}{Left}
        Return
    }

    ; send command without curly brackets
    scw(cmdName) {
        Send, \%cmdName%
        Return
    }

    ; send, command without curly brackets & with space
    scws(cmdName) {
        Send, {Space}\%cmdName%{Space}
        Return
    }

    ; -----------------------------------------------------

    ; !q::Send, $${Left} ; inline math

    !q:: ; align environment (use \\ at the end of expression)
        SendRaw, $$
        Send, {Enter}
        SendRaw	\begin{flalign}
        Send, {Enter 4}
        SendRaw,\end{flalign}
        Send, {Enter}
        SendRaw,$$
        Send, {Up 3}
    Return

    !w:: ; sans serif text
        sc("textsf")
    Return

    !+w:: ; sans serif math
        sc("mathsf")
    Return

    !^w:: ; roman math
        sc("mathrm")
    Return

    !e:: ; functions
        sc("mathrm")
        Send, {Right}\left(\right){Left 7}
    Return

    !+e:: ; chemical expression
        sc("ce")
    Return

    !t:: ; times symbol
        scws("times")
    Return

    ; -----------------------------

    !a:: ; description for units
        sct("underset")
        Send, \left(\textsf{{}{}}\right){Left 8}
    Return

    !s:: ; space
        scw(":")
    Return

    !d:: ; displaystyle derivative with default variable
        sct("dfrac")
        Send, \mathrm{{}d{}}{Right 2}\mathrm{{}d{}}%defaultVariable%{Left 13}
    Return

    !^d:: ; displaystyle derivative
        sct("dfrac")
        Send, \mathrm{{}d{}}{Right 2}\mathrm{{}d{}}
    Return

    !+d:: ; derivative with default variable
        sct("frac")
        Send, \mathrm{{}d{}}{Right 2}\mathrm{{}d{}}%defaultVariable%{Left 13}
    Return

    !+^d:: ; derivative
        sct("frac")
        Send, \mathrm{{}d{}}{Right 2}\mathrm{{}d{}}
    Return

    !f:: ; displaystyle fraction
        sct("dfrac")
    Return

    !+f:: ; fraction
        sct("frac")
    Return

    !ı:: ; hatimath
        scw("hat\imath")
    Return

    !j:: ; hatjmath
        scw("hat\jmath")
    Return

    !k::
        scw("lim")
    Return

    !l:: ; limits
        scw("limits")
        SendRaw, _{}^{}
        Send, {Left 4}
    Return

    !+l:: ; limits
        scw("limits")
        SendRaw, ^{}
        Send, {Left}
    Return

    !^l:: ; limits
        scw("limits")
        SendRaw, _{}
        Send, {Left}
    Return

    ; -----------------------------

    !z::
        scw("left")
    Return

    !+z::
        scw("left(")
    Return

    !^z::
        scw("left[")
    Return

    !^+z::
        scw("left|")
    Return

    !x::
        scw("right")
    Return

    !+x::
        scw("right)")
    Return

    !^x::
        scw("right]")
    Return

    !^+x::
        scw("right|")
    Return

    !c:: ; sqroot
        sc("sqrt")
    Return

    !+c:: ; nthroots
        scm("sqrt")
    Return

    !v:: ; vectors
        sc("vec")
    Return

    ; FIX mathrm{d}

    !b:: ; displaystyle integral with default variable
        scw("displaystyle\int")
        Send, {Space 2}\mathrm{{}d{}}%defaultVariable%{Left 12}
    Return

    !^b:: ; displaystyle integral
        scw("displaystyle\int")
    Return

    !+b:: ; integral with default variable
        scw("int")
        Send, {Space 2}\mathrm{{}d{}}%defaultVariable%{Left 12}
    Return

    !+^b:: ; integral
        scw("int")
    Return

    ; FIX mathrm{d}

    !m:: ; matrix
        SendRaw, \begin{bmatrix}
        Send, {Space 2}
        SendRaw, \end{bmatrix}
        Send, {Left 14}
    Return

; -----------------------------

; ; for navigating through sct commands
; !Right::Send, {Right 2}
; !Left::Send, {Left 2}

; ; for navigating through /left(/right)
; !+Right::Send, {Right 7}
; !+Left::Send, {Left 7}
; !^Right::Send, {Right 7}
; !^Left::Send, {Left 7}
#If

#If, WinActive("ahk_exe mpc-hc64.exe") Or WinActive("ahk_exe okular.exe")
    "::#+s
#If

CapsLock::Suspend
!CapsLock::Reload
^!CapsLock::ExitApp
