# Smart To-Do — Browser Extension

Smart To-Do is a lightweight, fast, and intuitive browser extension to capture tasks, ideas, and reminders without leaving the page. Built with TypeScript, it focuses on quick capture, smart suggestions, and minimal friction so you can spend less time managing tasks and more time doing them.

![Smart To-Do Screenshot](assets/screenshot.png)

Live demo / screenshot: add an animated GIF or screenshot to assets/ and update the path above.

---

Features
- Quick task capture from any page.
- Natural-language parsing for due dates (e.g., "tomorrow", "next Monday at 9am").
- Priority tags and quick filters (High / Medium / Low).
- Compact, unobtrusive UI with keyboard shortcuts.
- Local-first storage (no cloud sync by default).

Why this extension?
- Fast capture: Add tasks in one click without disrupting your flow.
- Minimal UI: Keeps focus on your page and your tasks.
- Privacy-first: Data is stored locally by default.

Quick install (users)
1. Clone the repo:
   git clone https://github.com/Sasisundar2211/Smart-To-Do-Extension.git
2. Open a Chromium-based browser (Chrome, Edge, Brave).
3. Go to chrome://extensions and enable "Developer mode".
4. Click "Load unpacked" and select the extension folder (e.g., `build/` or `dist/`).
5. Pin the extension icon and click it to open Smart To-Do.

Build from source (developers)
1. Install dependencies:
   npm install
2. Build the extension (adjust if your project uses a specific bundler):
   npm run build
3. For development with live rebuilds:
   npm run watch
4. Load the produced folder as an unpacked extension (chrome://extensions).

Note: If package.json uses different scripts, update the steps to match the actual scripts.

Usage
- Click the extension icon to open the quick-add modal.
- Type a task using natural language for dates (e.g., "Call Alex tomorrow 3pm").
- Press Enter to save.
- Use filters to view All / Today / Upcoming / Completed tasks.
- Right-click a task for edit, delete, or mark complete actions.

Suggested keyboard shortcuts
- Ctrl+Shift+Y — Toggle Smart To-Do
- N — New task (when modal is focused)
- Esc — Close modal
(Configure via browser extension shortcuts if implemented.)

Permissions
- storage — save tasks locally.
- activeTab — optionally capture current page title/url for context.
- notifications — show reminders (if implemented).

Project structure (typical)
- /src — TypeScript source files
- /public or /static — HTML and static assets
- /build or /dist — compiled extension bundle
- manifest.json — extension manifest
- package.json — scripts & dependencies

Contributing
Contributions are welcome!
1. Fork the repo.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Open a pull request describing your changes.

Please include tests for parsing and core logic when appropriate, and screenshots for UI changes.

Roadmap
- v1: Core task CRUD, natural-language dates, basic filters.
- v1.1: Reminders & local notifications.
- v2: Optional cloud sync (encrypted) and integrations (calendar).

Troubleshooting
- Extension not visible: ensure you loaded the correct build output folder.
- Date parsing issues: check parser library inclusion and build output.
- Data lost after update: implement storage versioning/migrations.

Testing
- Use Jest or Vitest for unit tests (parsing, task management).
- Use Playwright or Puppeteer for end-to-end UI tests.

License
This project is currently unlicensed. Add a LICENSE file (e.g., MIT) to make usage/licensing explicit.

Maintainer
- Sasisundar2211 — https://github.com/Sasisundar2211

Acknowledgements
- List any libraries or design assets used by the project here.

---

If you want, I can also:
- Add real screenshots or a GIF if you upload images or point to existing assets in the repo.
- Create a CONTRIBUTING.md, ISSUE_TEMPLATE, or a LICENSE file and push them to the repo.