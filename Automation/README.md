# ArachnIDE Automation Server

## Overview
This server uses Playwright to capture screenshots of ArachnIDE. These screenshots are used as telemetry for vision capabale Ai models.

This server replaces native screenshot behavior as the browser default requires extra user input.

## Prerequisites
- Node.js
- Playwright (install with `npm install`)

## Usage
**Default URL:**
```bash
node ArachnIDEAutomation.js
```

This will navigate to http://localhost:8080/, ArachnIDE's default port when run locally.

**Custom URL:**
```bash
node ArachnIDEAutomation.js <custom-url>
```
Replace `<custom-url>` with your ArachnIDE URL.