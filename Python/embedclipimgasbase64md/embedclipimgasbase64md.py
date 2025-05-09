import base64
import io

import pyperclip
from PIL import ImageGrab

img = ImageGrab.grabclipboard()

if img:
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    md_img = f"![image](data:image/png;base64,{b64})"

    pyperclip.copy(md_img)
    print(0)
else:
    print(1)
