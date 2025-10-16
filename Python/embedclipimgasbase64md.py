"""
# embedclipimgtobase64md

Converts image(PNG) in clipboard to a ready-to-paste text format for markdown files.

## Build

Dependencies are: pillow pyperclip pyinstaller

`pyinstaller embedclipimgasbase64md.py --noconsole --onefile`

## Changelog

- 2025-10-16: Added path handling.
"""

import base64
import io
import sys

import pyperclip

from PIL import Image, ImageGrab

clipboard_content = ImageGrab.grabclipboard()

img = None
if isinstance(clipboard_content, list):
    if clipboard_content:
        try:
            img = Image.open(clipboard_content[0])
        except Exception:
            sys.exit(1)
elif isinstance(clipboard_content, str):
    try:
        img = Image.open(clipboard_content)
    except Exception:
        sys.exit(1)
else:
    img = clipboard_content

if img:
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    md_img = f"![image](data:image/png;base64,{b64})"

    pyperclip.copy(md_img)
    sys.exit(0)
else:
    sys.exit(1)
