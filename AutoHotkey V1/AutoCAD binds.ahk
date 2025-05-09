#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%
SetTitleMatchMode, RegEx

; Command Line Input
CLI(key)
{
    Send {Esc 3}
    Sleep 10
    Send %key%
    Send {Enter}
    Return
}

; Keybind
KEYBIND(key)
{
    Send {%key%}
    Return
}

; To enable menubar, click the pesky downwards triangle icon
; on the left and click on "Show Menu Bar"
; Menubar selector with 2 keys
menubarSelectorTwo(menubarKey, keyOne)
{
    Send {Esc 3}
    Sleep 10
    Send !%menubarKey%
    Send %keyOne%
    Return
}

; Menubar selector with 3 keys
menubarSelectorThree(menubarKey, keyOne, keyTwo)
{
    Send {Esc 3}
    Sleep 10
    Send !%menubarKey%
    Send %keyOne%
    Send %keyTwo%
    Return
}

; Quickly selects one object
quickSelect()
{
    Send {LButton}
    Send {RButton}
    Return
}

;~ -----------------------------------------------------
#IfWinActive, Autodesk AutoCAD
    ; Measurement, miscellaneous commands

    $"::
        CLI("MEASUREGEOM")
    Return

    $q:: ; DimLinear
        CLI("DIMLINEAR")
    Return

    $!q:: ; QuickDimension (Better wih Ortho & Osnap off)
        CLI("DIM")
    Return

    $w:: ; DimRadius
        CLI("DIMRADIUS")
    Return

    $!w:: ; Hatch
        CLI("HATCH")
    Return

    $e:: ; DimDiameter
        CLI("DIMDIAMETER")
    Return

    $!e:: ; Multiline text
        CLI("MTEXT")
        Suspend
    Return

    $r:: ; Angular
        CLI("DIMANGULAR")
    Return

    $t:: ; Calculator
        CLI("QUICKCALC")
        WinActivate, QuickCalc
    Return

    $!t::
        WinClose, QuickCalc
    Return

    $y:: ; Centerline
        CLI("CENTERLINE")
    Return

    $!y:: ; Centermark
        CLI("CENTERMARK")
    Return

    $u:: ; Grid
        KEYBIND("F7")
    Return

    $ı:: ; Snap
        KEYBIND("F9")
    Return

    $o:: ; Ortho
        KEYBIND("F8")
    Return

    $p:: ; Osnap
        KEYBIND("F3")
    Return

    $!p:: ; Osnap3D
        KEYBIND("F4")
    Return

    ;~ -----------------------------------------------------
    ; Drawing commands

    $a:: ; Line
        CLI("LINE")
    Return

    $s:: ; PolyLine
        CLI("POLYLINE")
    Return

    $!s:: ; Mirror
        CLI("MIRROR")
    Return

    $d:: ; Circle
        CLI("CIRCLE")
    Return

    $!d:: ; Rotate
        CLI("ROTATE")
    Return

    $f:: ; Polygon
        CLI("POLYGON")
    Return

    $g:: ; DEFAULTGIZMO
        CLI("DEFAULTGIZMO")
    Return

    $h:: ; UCS
        CLI("UCS")
    Return

    $j:: ; 2 Point Circle
        menubarSelectorThree("D", "C", "2")
    Return

    $k:: ; Tan Tan Radius Circle
        menubarSelectorThree("D", "C", "T")
    Return

    $l:: ; Tan Tan Tan Circle
        menubarSelectorThree("D", "C", "A")
    Return

    ;~ -----------------------------------------------------
    ; Object manipulation

    $z:: ; Move
        CLI("MOVE")
    Return

    $!z:: ; Move (Quickly select 1 object)
        CLI("MOVE")
        quickSelect()
    Return

    $x:: ; Scale
        CLI("SCALE")
    Return

    $c:: ; Trim
        CLI("TRIM")
    Return

    $!c:: ; Copy
        CLI("COPY")
    Return

    $v:: ; Fillet
        CLI("FILLET")
    Return

    $!v:: ; Offset
        CLI("OFFSET")
    Return

    $b:: ; Break At Point
        CLI("BREAKATPOINT")
    Return

    $!b:: ; Break
        CLI("BREAK")
    Return

    $n:: ; Join
        CLI("JOIN")
    Return

    $!n:: ; Explode
        CLI("EXPLODE")
    Return

#IfWinActive
;~ -----------------------------------------------------
; Other

$!x:: ; Windows Screen Snap
    Send #+s
Return

$XButton1::Esc
$XButton2::Enter

$CapsLock::Suspend
$^!CapsLock::ExitApp