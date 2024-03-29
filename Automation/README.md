# ChrysalIDE Automation Server

## Overview
This server uses Playwright to capture screenshots of ChrysalIDE. These screenshots are used as telemetry for vision capabale Ai models.

This server replaces native screenshot behavior as the browser default requires extra user input.

## Prerequisites
- Node.js
- Playwright (install with `npm install`)

## Usage
**Default URL:**
```bash
node ChrysalIDEAutomation.js
```

This will navigate to http://localhost:8080/, ChrysalIDE'scale default port when run locally.

**Custom URL:**
```bash
node ChrysalIDEAutomation.js <custom-url>
```
Replace `<custom-url>` with your ChrysalIDE URL.