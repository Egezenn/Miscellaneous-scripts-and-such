"Script to parse and output the defaults in option tables found at https://starship.rs/config, few of the sections have wrong names and needs fixes."

import html
import re
import sys


def clean_html(raw_html):
    text = html.unescape(raw_html)
    cleanr = re.compile("<.*?>")
    cleantext = re.sub(cleanr, "", text)
    return cleantext.strip().replace("`", "")


def format_value(value):
    if value.lower() == "true":
        return "true"
    if value.lower() == "false":
        return "false"
    if value.startswith("[") and value.endswith("]"):
        items = [item.strip() for item in value[1:-1].split(",")]
        return f"[{', '.join(items)}]"
    if value.startswith("{") and value.endswith("}"):
        return "{}"
    if value == "''":
        return "''"
    if value == '""':
        return '""'
    try:
        try:
            int(value.replace("_", ""))
            return value
        except ValueError:
            float(value.replace("_", ""))
            return value
    except ValueError:
        return f"'{value}'"


if len(sys.argv) >= 2:
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        html_content = f.read()

    modules = re.findall(r'<h2 id="([^"]+)"', html_content)

    toml_output = ""

    for module in modules:
        module_section = re.search(rf'<h2 id="{module}".*?(<h2|</body)', html_content, re.DOTALL)

        if module_section:
            section_content = module_section.group(0)
            options_table = re.search(r'<h3 id="options.*?".*?<table.*?>(.*?)</table>', section_content, re.DOTALL)

            if options_table:
                toml_output += f"[{module}]\n"
                table_content = options_table.group(1)
                rows = re.findall(r"<tr.*?>(.*?)</tr>", table_content, re.DOTALL)

                for row in rows:
                    cols = re.findall(r"<td.*?>(.*?)</td>", row, re.DOTALL)
                    if len(cols) == 3:
                        option = clean_html(cols[0])
                        default_raw = cols[1]

                        if "<a href" in default_raw:
                            continue

                        default = clean_html(default_raw)

                        if not option:
                            continue

                        formatted_default = format_value(default)
                        toml_output += f"{option} = {formatted_default}\n"
                toml_output += "\n"

    toml_output = re.sub(r"''(.+)''", r"'\1'", toml_output)
    toml_output = re.sub(r"\* =", r" =", toml_output)
    toml_output = re.sub(r"^\[(.*)-(.*)\]$", r"[$1_$2]", toml_output)
    with open("output.toml", "w", encoding="utf-8") as file:
        file.write(toml_output)
else:
    print("Save HTML of https://starship.rs/config and give the path to it for parsing")
