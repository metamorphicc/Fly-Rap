import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FILE = 'file:///C:/Users/User/Desktop/claude%20twitter%20create/swarm-launch-video/fly-rap-studio/fly_rap_studio.html?capture=1';
const OUTDIR = 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/.probe';
const TIMES = [0, 1.5, 3.2, 5.4, 7.5, 9.4, 11.8, 14.2, 17.6];

fs.rmSync(OUTDIR, { recursive: true, force: true });
fs.mkdirSync(OUTDIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--headless=new', '--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars']
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
await page.goto(FILE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction('window.__ready === true && typeof window.__captureFrame === "function"', { timeout: 60000 });
console.log(JSON.stringify(await page.evaluate(() => window.__meta), null, 2));
for (const t of TIMES) {
  await page.evaluate(tt => window.__captureFrame(tt), t);
  const p = path.join(OUTDIR, 't_' + String(t).replace('.', '_') + '.png');
  await page.screenshot({ path: p, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log('wrote', p);
}
await browser.close();
