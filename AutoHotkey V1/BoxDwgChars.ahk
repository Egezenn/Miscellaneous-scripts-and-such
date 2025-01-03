#Requires AutoHotkey v1
#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

AppsKey::Send, {Space}
>^AppsKey:: Send, {Space}{Left}
$Space::Send, {Right}

$~Backspace:: Send, {Space}{Left}
$~Del:: Send, {Space}

RCtrl::Send, {Backspace}
>+RCtrl::Send, {Del}

<^>!Numpad0::Send, {Del}│
Numpad0::Send, {Del}─
Numpad1::Send, {Del}└
Numpad2::Send, {Del}┴
Numpad3::Send, {Del}┘
Numpad4::Send, {Del}├
Numpad5::Send, {Del}┼
Numpad6::Send, {Del}┤
Numpad7::Send, {Del}┌
Numpad8::Send, {Del}┬
Numpad9::Send, {Del}┐

<^>!>^Numpad0::Send, {Backspace}│
>^Numpad0::Send, {Backspace}─
>^Numpad1::Send, {Backspace}└
>^Numpad2::Send, {Backspace}┴
>^Numpad3::Send, {Backspace}┘
>^Numpad4::Send, {Backspace}├
>^Numpad5::Send, {Backspace}┼
>^Numpad6::Send, {Backspace}┤
>^Numpad7::Send, {Backspace}┌
>^Numpad8::Send, {Backspace}┬
>^Numpad9::Send, {Backspace}┐

~"::Send, {Del}
~1::Send, {Del}
~2::Send, {Del}
~3::Send, {Del}
~4::Send, {Del}
~5::Send, {Del}
~6::Send, {Del}
~7::Send, {Del}
~8::Send, {Del}
~9::Send, {Del}
~0::Send, {Del}
~*::Send, {Del}
~-::Send, {Del}

~q::Send, {Del}
~w::Send, {Del}
~e::Send, {Del}
~r::Send, {Del}
~t::Send, {Del}
~y::Send, {Del}
~u::Send, {Del}
ı::Send, i{Del}
~o::Send, {Del}
~p::Send, {Del}

~a::Send, {Del}
~s::Send, {Del}
~d::Send, {Del}
~f::Send, {Del}
~g::Send, {Del}
~h::Send, {Del}
~j::Send, {Del}
~k::Send, {Del}
~l::Send, {Del}
~,::Send, {Del}

~z::Send, {Del}
~x::Send, {Del}
~c::Send, {Del}
~v::Send, {Del}
~b::Send, {Del}
~n::Send, {Del}
~m::Send, {Del}
~.::Send, {Del}

CapsLock::Suspend
!CapsLock::Reload