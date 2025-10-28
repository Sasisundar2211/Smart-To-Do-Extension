# How to publish Smart To-Do Extension

This document explains how to package and publish this extension so users can download and install it.

## Quick checklist before publishing
- `manifest.json` is valid and at the extension root.
- `manifest_version: 3` (recommended for Chrome).
- Icon files included (16, 48, 128 recommended).
- Screenshots ready (e.g. 800×600, and a large banner).
- Permissions minimized and justified in store listing.
- Privacy policy URL (if extension collects or transmits user data).

## Create a release ZIP (for stores or GitHub Releases)
From the extension folder (the folder that contains `manifest.json`), run:

macOS / Linux:
```bash
zip -r smart-todo-extension.zip . -x ".git/*"
```

Windows PowerShell (run from extension folder):
```powershell
Compress-Archive -Path * -DestinationPath smart-todo-extension.zip -Force
```

Make sure the ZIP root contains `manifest.json`.

## Publish to Chrome Web Store
1. Register a developer account at the Chrome Web Store Developer Dashboard (one-time $5 fee).
2. Create a new item, upload `smart-todo-extension.zip`.
3. Fill in:
   - Title, short & long description
   - Screenshots and icons
   - Category and language
   - Privacy policy URL (if applicable)
   - Support email
4. Submit for publishing. Choose visibility (Public / Unlisted / Private).
5. After approval your users can click “Add to Chrome” and install directly.

Notes:
- New submissions should use Manifest V3.
- Avoid unnecessary host permissions to reduce review time.

## Publish to Microsoft Edge Add-ons
- Visit Microsoft Partner Center, create a new submission, upload the same ZIP, fill listing metadata, and submit.

## Publish to Firefox Add-ons (AMO)
- Sign into addons.mozilla.org, create a new add-on, upload your ZIP, and submit. AMO will sign the add-on and produce an XPI.

## Quick publish: GitHub Releases
1. Zip the extension (see above).
2. Create a new GitHub Release (tag), upload the ZIP.
3. Add release notes and installation instructions:
   - For Chrome/Edge: users must extract and use "Load unpacked" in chrome://extensions (Developer mode).
   - For Firefox: you can instruct users how to use about:debugging or upload to AMO for signing.

## Example listing text (short)
Smart To-Do — a lightweight browser extension for quick tasks and reminders.
- Quick add tasks
- Persistent local storage
- Keyboard shortcuts
- No account required

## Automating with GitHub Actions
See `.github/workflows/release.yml` for an example that automatically zips the extension and creates a GitHub Release when you push a tag.

## Support
Provide a support email and link to your project README for usage instructions and privacy details.
``` ````

```name=.github/workflows/release.yml
# Example GitHub Actions workflow: create a ZIP release of the extension on push of a tag
name: Create release ZIP

on:
  push:
    tags:
      - 'v*'   # triggers on version tags like v1.0.0

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create ZIP
        run: |
          EXT_DIR="."
          ZIP_NAME="smart-todo-extension-${GITHUB_REF_NAME}.zip"
          cd $EXT_DIR
          zip -r "$ZIP_NAME" . -x ".git/*" ".github/*"
          echo "ZIP_PATH=$(pwd)/$ZIP_NAME" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        id: create_release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ github.ref_name }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload release asset
        uses: softprops/action-gh-release@v1
        with:
          files: "smart-todo-extension-${{ github.ref_name }}.zip"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

What I could not verify because of the access problem
- Whether manifest.json exists and is at the repository root.
- Whether manifest.json is MV3 or MV2 (new Chrome submissions should use MV3).
- Whether icons (16/48/128) and screenshots are present.
- If the project needs a build step (webpack/npm) and which folder (e.g., dist/) should be packaged.

What I need from you to proceed
- Confirm whether you want me to commit these two files directly into the repository (granting me write access or inviting me as a collaborator), or
- Paste the path to your extension folder (if manifest.json is not at repo root), or
- Upload the extension ZIP or manifest.json here so I can inspect it.

I couldn’t complete the publishing steps automatically because of the access error; once I can read the repository or you provide the required files/permissions I can proceed with the commit/PR and prepare the first release ZIP.
