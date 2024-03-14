const playwright = require('playwright');
const http = require('http');
const url = require('url');

const defaultNeurideUrl = 'http://localhost:8080/';

async function startNeuride(url, browserType = 'chromium') {
    const browser = await playwright[browserType].launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the provided Neuride URL
    await page.goto(url);

    // Set a flag in the page's context to indicate it's controlled by Playwright
    await page.evaluate(() => window.startedViaPlaywright = true);

    return { browser, page };
}

const fs = require('fs');
const path = require('path');

async function takeScreenshot(page) {
    // Take a screenshot in PNG format
    const buffer = await page.screenshot({ type: 'png', fullPage: false });

    // Return the screenshot as a base64 encoded string
    return buffer.toString('base64');
}

// HTTP server to listen for screenshot requests
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows access from any origin
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST'); // Specifies the methods allowed when accessing the resource
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allows headers

    if (req.method === 'OPTIONS') {
        // Handle pre-flight request for CORS
        res.writeHead(204);
        res.end();
        return;
    }

    // Existing code for handling requests
    const query = url.parse(req.url, true).query;
    if (req.url.startsWith('/screenshot') && page) {
        const base64Image = await takeScreenshot(page);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(base64Image); // Return base64 image data directly
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Extract command line arguments
const args = process.argv.slice(2);
let page; // Store the page object globally

// Use provided URL or default if not provided
const neurideUrl = args.length >= 1 ? args[0] : defaultNeurideUrl;
const browserType = args[1] || 'chromium';

startNeuride(neurideUrl, browserType).then(async ({ page: p }) => {
    page = p;
    // Start the server
    server.listen(8081, () => {
        console.log('Server running on port 8081');
    });
});

module.exports = { startNeuride, takeScreenshot };