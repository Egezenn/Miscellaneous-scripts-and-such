import argparse
import math
import re

import colorama
from colorama import Style

import pyfiglet


def get_color_gradient(start_rgb, end_rgb, steps):
    gradients = []
    for i in range(steps):
        r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * i / (steps - 1))
        g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * i / (steps - 1))
        b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * i / (steps - 1))
        gradients.append(f"\033[38;2;{r};{g};{b}m")
    return gradients


def print_gradient_text_with_angle(text, start_rgb, end_rgb, angle_degrees):
    lines = text.split("\n")
    height = len(lines)
    width = max(len(line) for line in lines) if lines else 0
    if width == 0 or height == 0:
        print(text)
        return

    angle_rad = math.radians(angle_degrees)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)

    x_comp_min = (width - 1) * cos_a if cos_a < 0 else 0
    x_comp_max = (width - 1) * cos_a if cos_a > 0 else 0
    y_comp_min = (height - 1) * sin_a if sin_a < 0 else 0
    y_comp_max = (height - 1) * sin_a if sin_a > 0 else 0

    min_v = x_comp_min + y_comp_min
    max_v = x_comp_max + y_comp_max

    if max_v == min_v:
        max_v = min_v + 1

    gradient_colors = get_color_gradient(start_rgb, end_rgb, 100)

    for y, line in enumerate(lines):
        for x, char in enumerate(line):
            if char.isspace():
                print(char, end="")
                continue

            v = x * cos_a + y * sin_a
            t = (v - min_v) / (max_v - min_v)
            color_index = int(t * 99)
            color_index = max(0, min(99, color_index))

            print(f"{gradient_colors[color_index]}{char}", end="")
        print()
    print(Style.RESET_ALL)


def hex_color(value):
    if not re.match(r"^#[0-9a-fA-F]{6}$", value):
        raise argparse.ArgumentTypeError(f"Invalid hex color: {value}")
    return tuple(int(value[i : i + 2], 16) for i in (1, 3, 5))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create gradient text with pyfiglet.")
    parser.add_argument("-t", "--text", type=str, default="prettyprint", help="Text to display.")
    parser.add_argument(
        "-s",
        "--start-color",
        type=hex_color,
        default="#FF0000",
        help="Start color of the gradient in hex format (e.g., #FF0000).",
    )
    parser.add_argument(
        "-e",
        "--end-color",
        type=hex_color,
        default="#0000FF",
        help="End color of the gradient in hex format (e.g., #0000FF).",
    )
    parser.add_argument("-a", "--angle", type=float, default=0, help="Angle of the gradient in degrees.")
    parser.add_argument("-f", "--font", type=str, default="mono12", help="Font to use for the text.")
    parser.add_argument("-w", "--wrap", type=int, default=120, help="Width to wrap the text at. -1 for no wrapping.")
    args = parser.parse_args()

    colorama.init()

    ascii_art = pyfiglet.figlet_format(args.text, font=args.font, width=args.wrap if args.wrap != -1 else 1000000)
    print_gradient_text_with_angle(ascii_art, args.start_color, args.end_color, args.angle)
