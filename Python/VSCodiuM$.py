"""
Use M$ marketplace instead of OpenVSX.
Needs to be run every VSCodium update as the file gets overwritten.
Use it at your own risk, you're _expected_ to not do this.
"""

import argparse
import getpass
import json
import os

parser = argparse.ArgumentParser(
    prog="VSCodiuM$",
    description="Use M$ marketplace inside VSCodium. Patches by default.",
    epilog="Use it at your own risk, you're expected to not do this.",
)
# TODO add arg to automate extractions
# VSCode(dependant) https://github.com/chaotic-aur/packages/raw/refs/heads/main/code-marketplace/patch.json
# VSCodium https://raw.githubusercontent.com/VSCodium/vscodium/refs/heads/master/prepare_vscode.sh > setpath_json "product" "extensionsGallery" ...
parser.add_argument("-r", action="store_true", help="Revert")
args = parser.parse_args()
revert = args.r

# TODO add OS handling
default_paths = [
    os.path.join(
        "C:\\",
        "Users",
        getpass.getuser(),
        "AppData",
        "Local",
        "Programs",
        "VSCodium",
        "resources",
        "app",
        "product.json",
    )
]

for path in default_paths:
    try:
        if os.path.exists(path):
            break
    except:
        pass

with open(path) as f:
    data = json.load(f)

if "extensionsGallery" in data:
    del data["extensionsGallery"]

if not revert:
    data["extensionsGallery"] = {
        "nlsBaseUrl": "https://www.vscode-unpkg.net/_lp/",
        "serviceUrl": "https://marketplace.visualstudio.com/_apis/public/gallery",
        "itemUrl": "https://marketplace.visualstudio.com/items",
        "publisherUrl": "https://marketplace.visualstudio.com/publishers",
        "resourceUrlTemplate": "https://{publisher}.vscode-unpkg.net/{publisher}/{name}/{version}/{path}",
        "extensionUrlTemplate": "https://www.vscode-unpkg.net/_gallery/{publisher}/{name}/latest",
        "controlUrl": "https://main.vscode-cdn.net/extensions/marketplace.json",
        "mcpUrl": "https://main.vscode-cdn.net/mcp/servers.json",
        "accessSKUs": [
            "copilot_enterprise_seat",
            "copilot_enterprise_seat_quota",
            "copilot_enterprise_seat_multi_quota",
            "copilot_enterprise_seat_assignment",
            "copilot_enterprise_seat_assignment_quota",
            "copilot_enterprise_seat_assignment_multi_quota",
            "copilot_enterprise_trial_seat",
            "copilot_enterprise_trial_seat_quota",
            "copilot_for_business_seat",
            "copilot_for_business_seat_quota",
            "copilot_for_business_seat_multi_quota",
            "copilot_for_business_seat_assignment",
            "copilot_for_business_seat_assignment_quota",
            "copilot_for_business_seat_assignment_multi_quota",
            "copilot_for_business_trial_seat",
            "copilot_for_business_trial_seat_quota",
        ],
    }
else:
    # VSCodium product.json
    data["extensionsGallery"] = {
        "serviceUrl": "https://open-vsx.org/vscode/gallery",
        "itemUrl": "https://open-vsx.org/vscode/item",
        "latestUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest",
        "controlUrl": "https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json",
    }

with open(path, "w") as f:
    json.dump(data, f, indent=4)
