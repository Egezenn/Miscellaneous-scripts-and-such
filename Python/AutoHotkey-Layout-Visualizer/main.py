import json
import os
import sys

import svg

import utils


def main():
    elements = []
    key_dimension = 100
    descent_single = 16
    descent_multiple = 24
    darkness_limit = 63

    if len(sys.argv) > 2:
        layout = sys.argv[1]
        output = sys.argv[2]
        input = sys.argv[3]
    else:
        print("No arguments given, provide layout, script and output name.")
        exit()

    try:
        with open(f"layouts/{layout}.json", "r", encoding="utf-8") as file:
            layout_data = json.load(file)
    except FileNotFoundError:
        print("Layout is not found!\nYou don't have to specify the directory.")
        exit()

    try:
        keybinds = []
        if (
            ((input.endswith("/*") or input.endswith("\\*")))
            and os.path.isdir(input.replace("*", ""))
        ) or os.path.isdir(input):
            path = input.replace("*", "") if input.endswith("*") else input

            for f in os.listdir(path):
                if f.endswith(".ahk"):
                    script_path = os.path.join(path, f)
                    if os.path.isfile(script_path):
                        keybinds_for_file = utils.keybind_finder(script_path)
                        if keybinds_for_file is not None:
                            keybinds.extend(keybinds_for_file)
            multiple = True
        else:
            keybinds.extend(utils.keybind_finder(input))
            multiple = False
    except (FileNotFoundError, OSError):
        print("Script file not found!")
        exit()

    row_width_list = []
    modified_width = 1
    modified_height = 1
    current_height = 0
    current_width = 0
    for rows in layout_data:
        if current_width != 0:
            row_width_list.append(current_width)
        current_width = 0
        for column in rows:
            # each key is iterated, modifiers (width, height modifications skips to the next iteration)
            if type(column) == dict:
                if "x" in column:  # spacing
                    current_width += key_dimension * float(column["x"])
                # "big ass enter", without the width modification (for now)
                if "h" and "h2" in column:
                    modified_height = float(column["h"]) + float(column["h2"])
                if "w" in column:  # width
                    modified_width = float(column["w"])
                    continue
                if "h" in column:  # height
                    modified_height = float(column["h"])
                    continue

            else:
                text = column.upper()
                text_list = text.split(" && ")
                redness = None
                if text in keybinds or any(e in text_list for e in keybinds):
                    descent = descent_single if multiple else descent_multiple
                    try:
                        redness = 255 - (
                            (
                                keybinds.count(text_list[1])
                                + keybinds.count(text_list[2])
                            )
                            * descent
                        )
                    except IndexError:
                        redness = 255 - (keybinds.count(text) * descent)

                    redness = (
                        format(darkness_limit, "x")
                        if redness < darkness_limit
                        else format(redness, "x")
                    )

                bg_fill = f"#{redness}0000" if redness is not None else "white"

                elements.append(
                    utils.svg_element_constructor(
                        text,
                        text_list,
                        current_width,
                        current_height,
                        key_dimension,
                        modified_height,
                        modified_width,
                        bg_fill=bg_fill,
                    )
                )
                current_width += key_dimension * modified_width
                modified_width = 1
                modified_height = 1
        current_height += key_dimension
    row_width_list.append(current_width)

    canvas = svg.SVG(
        width=max(row_width_list),
        height=current_height,
        elements=[
            svg.Rect(
                width=max(row_width_list),
                height=current_height,
                stroke="lightgray",
                fill="lightgray",
            ),
            *elements,
        ],
    )

    if output != "":
        with open(output, "w", encoding="utf-8") as file:
            file.write(str(canvas))
    else:
        print("Output file name not passed in!")


if __name__ == "__main__":
    main()
