# MCP Integration (Playwright + Chrome DevTools)

This repo includes scripts to run two Model Context Protocol servers for browser automation:

- Playwright-based headless browser
- Chrome DevTools Protocol (attach to a local Chrome)

## Quick Start

1) Run the app
```bash
npm run dev
```

2) Start an MCP server
- Playwright (recommended default)
```bash
npm run mcp:browser
```
- Chrome DevTools (attach to real Chrome)
```bash
npm run chrome:rdp      # starts Chrome with RDP at :9222 (Windows/PowerShell)
npm run mcp:chrome
```

3) Configure your MCP client
Example (OpenAI Desktop / Continue / generic MCP client):
```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-browser"]
    },
    "chrome": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-chrome"],
      "env": {
        "CHROME_REMOTE_DEBUGGING_URL": "http://localhost:9222"
      }
    }
  }
}
```

4) Typical workflow
- Navigate to your dev server (e.g., `http://localhost:3000`)
- Take screenshots (header, scoreboard, speech bubble, etc.)
- Read console logs and network console
- Evaluate DOM (query selectors, get computed styles/z-index)

Note: Tool names and exact calls vary by client. Most MCP clients expose commands like `goto`, `screenshot`, `console`, and `evaluate` for the browser server; and similar CDP-sourced commands for the Chrome server. List available tools from your client to discover exact names.

## Tips
- If `npx` prompts for install, it will fetch the server package on demand.
- On macOS/Linux for Chrome RDP: launch Chrome with `--remote-debugging-port=9222` and then run `npm run mcp:chrome`.
- For Playwright screenshots, prefer full-page PNGs; for targeted checks, evaluate `getComputedStyle(element).zIndex` in the page.

## What to Capture for this Project
- Header + scoreboard (peek and expanded)
- Host plane/ticker mid-animation
- Speech bubble (default + jeopardy theme)
- Console logs on page load and after toggling themes

Once you have these, share or let the agent fetch them via MCP so we can finalize visual polish.
