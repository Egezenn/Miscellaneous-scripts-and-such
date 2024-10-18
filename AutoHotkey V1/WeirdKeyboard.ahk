#Warn
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

; Write a function, sometime.

a::
    array := Array("ᾰ", "ḁ", "ἀ", "ἁ", "ἂ", "ἃ", "ἄ", "ἅ", "ἆ", "ἇ", "ạ", "ả", "ầ", "ấ", "ẩ", "ẫ", "ậ", "ắ", "ằ", "ẳ", "ẵ",
    "ặ", "ẚ", "ᾱ", "ᾲ", "ᾳ", "ᾴ", "ᾶ", "ᾷ", "a", "Ѧ", "Ặ", "Ἀ", "Ἁ", "Ἂ", "Ἃ", "Ἄ", "Ἅ", "Ἆ", "Ἇ", "Ạ", "Ả", "Ấ", "Ầ",
    "Ẩ", "Ẫ", "Ậ", "Ắ", "Ằ", "Ẳ", "Ẵ")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

b::
    array := Array("ദ", "൫", "♭", "ḃ", "ḅ", "ḇ", "b", "ℬ", "Ḃ", "Ḅ", "Ḇ", "B", "ß")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

c::
    array := Array("ç", "ḉ", "c", "ℂ", "ℭ", "℃", "₡", "∁", "C")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

d::
    array := Array("ⅾ", "ḋ", "ḍ", "ḏ", "ḑ", "ḓ", "d", "Ḓ", "Ḋ", "Ḍ", "Ḏ", "Ḑ", "D")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

e::
    array := Array("ℯ", "∊", "€", "ḕ", "ḗ", "ḙ", "ḛ", "ḝ", "ẹ", "ẻ", "ẽ", "ế", "ề", "ể", "ễ", "ệ", "ἐ", "ἑ", "ἒ", "ἓ", "ἔ",
    "ἕ", "ὲ", "έ", "e", "ℰ", "ℇ", "∃", "Ḕ", "Ḗ", "Ḙ", "Ḛ", "Ḝ", "Ẹ", "Ẻ", "Ẽ", "Ế", "Ề", "Ể", "Ễ", "Ệ", "Ὲ", "Έ", "Ἐ",
    "Ἑ", "Ἒ", "Ἓ", "Ἔ", "Ἕ")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

f::
    array := Array("ḟ", "ƒ", "f", "ℱ", "Ḟ", "₣", "℉", "F")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

g::
    array := Array("❡", "ḡ", "ℊ", "g", "ℊ", "Ḡ", "G")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

h::
    array := Array("ⓗ", "⒣", "ℎ", "ℏ", "ℌ", "ḣ", "ḥ", "ḧ", "ḩ", "ḫ", "ẖ", "h", "ℋ", "ℍ", "Ḣ", "Ḥ", "Ḧ", "Ḩ", "Ḫ", "Ἠ", "Ħ",
    "Ἡ", "Ἢ", "Ἣ", "Ἤ", "Ἥ", "Ἦ", "Ἧ", "ᾘ", "ᾙ", "ᾚ", "ᾛ", "ᾜ", "ᾝ", "ᾞ", "ᾟ", "Ὴ", "Ή", "ῌ", "H")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

ı::
    array := Array("ї", "유", "ḭ", "ḯ", "ỉ", "ị", "ἰ", "ἱ", "ἲ", "ἳ", "ἴ", "ἵ", "ἶ", "ἷ", "ῐ", "ῑ", "ῒ", "ΐ", "ῖ", "ῗ", "ὶ",
    "ί", "i", "Ї", "ℐ", "Ḭ", "ḭ", "Ḯ", "ḯ", "Ỉ", "ỉ", "Ị", "ị", "ἰ", "ἱ", "ἲ", "ἳ", "ἴ", "ἵ", "ἶ", "ἷ", "Ἰ", "Ἱ", "Ἲ",
    "Ἳ", "Ἴ", "Ἵ", "Ἶ", "Ἷ", "ῐ", "ῑ", "ῒ", "ΐ", "ῖ", "ῗ", "Ῐ", "Ῑ", "Ὶ", "Ί", "ὶ", "ί", "I")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

j::
    array := Array("ʝ", "♩", "j", "J")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

k::
    array := Array("к", "ḱ", "ḳ", "ḵ", "k", "₭", "Ḱ", "Ḳ", "Ḵ", "K")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

l::
    array := Array("ℓ", "ḻ", "ḽ", "l", "ℒ", "₤", "Ḷ", "Ḹ", "Ḻ", "Ḽ", "L")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

m::
    array := Array("Պ", "ṃ", "ḿ", "ṁ", "m", "Ḿ", "Ṁ", "Ṃ", "M", "സ", "൬", "ന", "ണ", "൩")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

n::
    array := Array("η", "ℵ", "ṅ", "ṇ", "ṉ", "ṋ", "ἠ", "ἡ", "ἢ", "ἣ", "ἤ", "ἥ", "ἦ", "ἧ", "ὴ", "ή", "ᾐ", "ᾑ", "ᾒ", "ᾓ", "ᾔ",
    "ᾕ", "ᾖ", "ᾗ", "ῂ", "ῃ", "ῄ", "ῆ", "ῇ", "n", "ℕ", "₦", "Ṅ", "Ṇ", "Ṉ", "Ṋ", "N")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

o::
    array := Array("⍥", "ṍ", "ṏ", "ṑ", "ṓ", "ọ", "ỏ", "ố", "ồ", "ổ", "ỗ", "ớ", "ờ", "ở", "ỡ", "ợ", "ὀ", "ὁ", "ὂ", "ὃ", "ὄ",
    "ὅ", "ộ", "o", "Ṍ", "Ṏ", "Ṑ", "Ṓ", "Ọ", "Ỏ", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ", "Ὀ", "Ὁ", "Ὂ", "Ὃ",
    "Ὄ", "O")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

p::
    array := Array("℘", "ṗ", "ṕ", "ῥ", "ῤ", "p", "ℙ", "Ṗ", "Ῥ", "Ṕ", "P")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

q::
    array := Array("ҩ", "ǭ", "q", "ℚ", "Ǭ", "Q")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

r::
    array := Array("Ի", "ṟ", "ṙ", "ṛ", "ṝ", "r", "ℛ", "ℜ", "ℝ", "℟", "Ṙ", "Ṛ", "Ṝ", "Ṟ", "R")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

s::
    array := Array("ട", "ഗ", "ṡ", "ṣ", "ṥ", "ṧ", "ṩ", "ş", "﹩", "s", "Š", "Ṡ", "Ṣ", "Ṥ", "Ṧ", "Ṩ", "S", "$")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

t::
    array := Array("ṫ", "ṭ", "ṯ", "ṱ", "ẗ", "†", "t", "₮", "Ṫ", "Ṭ", "Ṯ", "Ṱ", "T", "₺")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

u::
    array := Array("υ", "ṳ", "ṵ", "ṷ", "ṹ", "ṻ", "ụ", "ủ", "ứ", "ừ", "ử", "ữ", "ự", "ὐ", "ὑ", "ὒ", "ὓ", "ὔ", "ὕ", "ὖ", "ὗ",
    "ὺ", "ύ", "ῠ", "ῡ", "ῢ", "ΰ", "ῦ", "ῧ", "u", "Ṳ", "Ụ", "Ủ", "Ứ", "Ừ", "Ử", "Ữ", "Ự", "Ṷ", "Ṹ", "Ṻ", "Ṵ", "U")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

v::
    array := Array("ṽ", "ṿ", "v", "Ṽ", "Ṿ", "V")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

w::
    array := Array("ഡ", "ധ", "ω", "ẁ", "ẃ", "ẅ", "ẇ", "ẉ", "ẘ", "ὠ", "ὡ", "ὢ", "ὣ", "ὤ", "ὥ", "ὦ", "ὧ", "ὼ", "ώ", "ᾠ", "ᾡ",
    "ᾢ", "ᾣ", "ᾤ", "ᾥ", "ᾦ", "ᾧ", "ῲ", "ῳ", "ῴ", "ῶ", "ῷ", "w", "₩", "Ẁ", "Ẃ", "Ẅ", "Ẇ", "Ẉ", "W")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

x::
    array := Array("✗", "✘", "ẋ", "ẍ", "x", "Ẍ", "Ẋ", "X")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

y::
    array := Array("ỵ", "ỷ", "ỹ", "ẏ", "y", "ㄚ", "Ẏ", "Ὑ", "Ὓ", "Ὕ", "Ὗ", "Ῠ", "Ῡ", "Ὺ", "Ύ", "Ỳ", "Ỵ", "Ỷ", "Ỹ", "Y", "ⓨ",
    "൮", "⑂", "ഴ", "ẙ", "ỳ")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

z::
    array := Array("ℨ", "ẑ", "ẓ", "ẕ", "z", "Ž", "ℤ", "Ẑ", "Ẕ", "Ẓ", "Z")
    count := array.MaxIndex()

    Random, randint, 1, count
    character := array[randint]
    Send %character%
Return

0::Send ∅

1::Send ⅼ

2::Send Ⅱ

3::Send Ⅲ

4::Send Ⅳ

5::Send Ⅴ

6::Send Ⅵ

7::Send Ⅶ

8::Send Ⅷ

9::Send Ⅸ

!v:: ; b & i & t dont send properly
    KeyWait LAlt
    Send %Clipboard%
Return

; -----------------------------------------------------

CapsLock::Suspend
!CapsLock::Reload