# 🧠 Smart To-Do Extension

A browser extension for managing tasks with contextual awareness and AI-powered task parsing. Capture tasks from any webpage with automatic context linking, priority detection, and smart task organization.

## ✨ Features

- **Quick Task Capture**: Add tasks instantly from any webpage using the browser extension popup
- **Contextual Linking**: Automatically captures the URL of the page where tasks are created
- **AI-Powered Parsing**: Intelligent task parsing with automatic priority detection, tag extraction, and due date recognition (when backend is available)
- **Offline Support**: Full functionality with local storage when the backend API is unavailable
- **Context Menu Integration**: Right-click selected text to quickly add it as a task
- **Priority Management**: Visual priority indicators (Urgent, High, Medium, Low)
- **Tags and Due Dates**: Organize tasks with hashtags and set due dates
- **Clean UI**: Modern, minimalist interface with intuitive task management

## 📋 Installation

### For Users (Chrome/Edge)

1. Download the latest release ZIP from the [Releases page](https://github.com/Sasisundar2211/Smart-To-Do-Extension/releases)
2. Extract the ZIP file
3. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder
6. The Smart To-Do extension icon should appear in your browser toolbar

### For Developers

1. Clone this repository:
   ```bash
   git clone https://github.com/Sasisundar2211/Smart-To-Do-Extension.git
   cd Smart-To-Do-Extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in your browser:
   - Open Chrome/Edge and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Manifest**: Chrome Extension Manifest V3
- **APIs**: Chrome Extension APIs (storage, tabs, contextMenus, notifications)
- **Styling**: Inline CSS with modern design patterns

## 📁 Project Structure

```
Smart-To-Do-Extension/
├── .github/
│   └── workflows/
│       └── release.yml          # GitHub Actions workflow for releases
├── public/                      # Static assets copied to dist
│   ├── icons/                   # Extension icons
│   ├── manifest.json            # Extension manifest
│   └── README.txt
├── src/
│   ├── api.ts                   # API request helper
│   ├── background.ts            # Background service worker
│   ├── config.ts                # Configuration and endpoints
│   ├── content.ts               # Content script for page analysis
│   ├── main.tsx                 # React entry point
│   ├── popup.tsx                # Main popup UI component
│   └── types.ts                 # TypeScript type definitions
├── index.html                   # Popup HTML template
├── manifest.json                # Root manifest (template)
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the extension for production
- `npm run preview` - Preview the built extension

### Development Workflow

1. Make changes to source files in the `src/` directory
2. Run `npm run build` to rebuild the extension
3. Reload the extension in `chrome://extensions/`
4. Test your changes

### Backend API (Optional)

The extension supports an optional backend API for enhanced features:

- **AI Task Parsing**: `POST /api/ai/parse-task` - Parses natural language into structured tasks
- **Task Storage**: `GET/POST/PUT/DELETE /api/tasks` - Persistent task storage across devices
- **AI Chat**: `POST /api/ai/chat` - Conversational task management

When the backend is unavailable, the extension automatically falls back to:
- Local storage for task persistence
- Basic regex-based task parsing
- All core functionality remains available

Default backend URL: `http://localhost:3001` (configurable in `src/config.ts`)

## 📦 Building for Distribution

### Manual Build

```bash
npm run build
cd dist
zip -r ../smart-todo.zip .
```

### Automated Release

The project includes a GitHub Actions workflow that automatically:
1. Builds the extension
2. Creates a ZIP package
3. Publishes a GitHub Release

To trigger a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🎨 Features in Detail

### Task Creation

Tasks can be created with natural language:
- Simple: "Buy groceries"
- With priority: "Fix urgent bug in production"
- With tags: "Review #documentation #urgent"
- With dates: "Team meeting tomorrow at 3pm"

### Priority Levels

- 🔴 **Urgent (4)**: Red indicator for critical tasks
- 🟠 **High (3)**: Orange indicator for important tasks
- 🔵 **Medium (2)**: Blue indicator for normal tasks
- 🟢 **Low (1)**: Green indicator for low-priority tasks

### Offline First

The extension is designed to work seamlessly offline:
- All tasks are stored locally using Chrome's storage API
- Background service worker provides offline task parsing fallback
- Syncs with backend when connection is restored

## 🔒 Permissions

The extension requires the following permissions:

- `storage` - Store tasks locally
- `activeTab` - Capture current page URL when creating tasks
- `contextMenus` - Add right-click menu option
- `notifications` - Show task notifications
- `scripting` - Inject content scripts for page analysis
- `tabs` - Open task context URLs in new tabs
- `host_permissions` - Access to localhost:3001 for optional API backend

## 🐛 Troubleshooting

### Extension won't load
- Make sure you've built the extension with `npm run build`
- Verify you're loading the `dist` folder, not the root folder
- Check the Chrome DevTools console for error messages

### Tasks not saving
- Check if Chrome storage is available (not in incognito mode without permission)
- Verify the extension has storage permissions

### Backend connection fails
- This is expected if you don't have a backend running
- The extension works perfectly in offline mode with local storage
- To use backend features, ensure the API is running at the configured URL

## 📄 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/Sasisundar2211/Smart-To-Do-Extension/issues).

---

Made with ❤️ by [Sasisundar2211](https://github.com/Sasisundar2211)
