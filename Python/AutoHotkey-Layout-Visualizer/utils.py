import html
import re

import svg


def keybind_finder(file):
    matches = []
    sanitized_matches = []
    try:
        with open(file, "r", encoding="utf-8") as file:
            data = file.readlines()
            for line in data:
                search = re.search(r"^\s*?[^\s*?;](.*?)::", line, re.DOTALL)
                if search is not None:
                    matches.append(search.group())
            for match in matches:
                sanitized_matches.append(
                    match.upper()
                    .strip()
                    .replace("\t", "")
                    .replace("~", "")
                    .replace("$", "")
                    .replace("<^>!", "")
                    .replace("#", "")
                    .replace("^", "")
                    .replace("!", "")
                    .replace("+", "")
                    .replace("<", "")
                    .replace(">", "")
                    .replace("::", "")
                )
            return sanitized_matches
    except UnicodeDecodeError:
        pass
    # TODO make subset layouts keys with modifiers
    # if they're indented it probably means they're context sensitive


def svg_element_constructor(
    text,
    text_list,
    current_width,
    current_height,
    key_dimension,
    modified_height,
    modified_width,
    font_size=14,
    bg_fill="white",
):
    # TODO replace the text to something beatiful with a dict
    font_color = "lightgray" if (bg_fill != "white" and int(bg_fill[1:3], 16) < 96) else "black"
    _x = (
        (current_width + (key_dimension / 2) * modified_width)
        if modified_width != 1
        else current_width + key_dimension / 2
    )
    if len(text_list) > 1:
        return [
            svg.Rect(
                x=current_width,
                y=current_height,
                width=key_dimension * modified_width,
                height=key_dimension * modified_height,
                stroke="black",
                fill=bg_fill,
                stroke_width=2,
            ),
            svg.Text(
                x=current_width + (key_dimension / 2) * modified_width,
                y=current_height + key_dimension / 2 - font_size // 2,
                text=html.escape(text_list[0]),
                fill=font_color,
                font_size=font_size,
                font_weight="bold",
                font_family="Calibri",
                text_anchor="middle",
            ),
            svg.Text(
                x=current_width + (key_dimension / 2) * modified_width,
                y=current_height + key_dimension / 2 + font_size // 2,
                text=html.escape(text_list[1]),
                fill=font_color,
                font_size=font_size,
                font_weight="bold",
                font_family="Calibri",
                text_anchor="middle",
            ),
        ]
    else:
        return [
            svg.Rect(
                x=current_width,
                y=current_height,
                width=key_dimension * modified_width,
                height=key_dimension * modified_height,
                stroke="black",
                fill=bg_fill,
                stroke_width=2,
            ),
            svg.Text(
                x=current_width + (key_dimension / 2) * modified_width,
                y=current_height + key_dimension / 2,
                text=html.escape(text),
                fill=font_color,
                font_size=font_size,
                font_weight="bold",
                font_family="Calibri",
                text_anchor="middle",
            ),
        ]
