---
status: reference
owner: dev-tools
updated: 2026-08-21
---

# Browser / MCP Development Tools

The repository contains optional browser-development helpers. They are convenience tools, not part of the production runtime contract.

## Available scripts

```bash
npm run mcp:browser
npm run mcp:chrome
npm run chrome:rdp
npm run snap
```

Exact MCP server behavior depends on the client/tool versions available on the developer machine. Treat `package.json` as the authoritative command list and inspect the installed tool before assuming a particular MCP method name.

For production verification, prefer the repository-owned checks:

```bash
npm run build
npm run runtime:check
```

CI installs Chromium/Playwright for the protected browser spine independently of these optional MCP helpers.

## Good uses

- inspect computed layout and z-index behavior;
- capture targeted screenshots;
- inspect browser console/network failures;
- reproduce responsive failures interactively before encoding them into the blocking runtime harness.

When an interactive debugging discovery matters long-term, turn it into a deterministic test/check rather than leaving it as a manual ritual.
