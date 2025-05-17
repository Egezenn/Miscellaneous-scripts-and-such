# AutoHotkey Layout Visualizer

Visualize your keybinds!

![example](assets/example.png)

## Usage

single script: `python main.py ISO105 out.svg script.ahk`

non-recursive directory: `python main.py ISO105 out.svg <volume>:\<dir>` or `python main.py ISO105 out.svg <volume>:\<dir>\*`

## Information

[Layouts](/layouts/) are pulled from [here](https://raw.githubusercontent.com/ijprest/keyboard-layout-editor/refs/heads/master/layouts.json).

References [AutoHotkey key list](https://www.autohotkey.com/docs/v1/KeyList.htm) from the docs. Scan codes (SCxxx) and virtual keys (VKxx) are ignored.

(only ISO105 layout is supported for now, will add some others. do a PR if you make one for your locale).

For other keyboard globalizations you can look at [Microsoft's learn pages](https://learn.microsoft.com/en-us/globalization/windows-keyboard-layouts) regarding the topic.

## Known issues

- Files that require niche encodings might not work.

## Dependencies

[svg.py](https://github.com/orsinium-labs/svg.py), Licensed under MIT license.
