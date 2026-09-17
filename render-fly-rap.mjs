import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = process.env.FF || 'C:/Users/User/AppData/Local/Programs/Python/Python314/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const FILE = 'file:///C:/Users/User/Desktop/claude%20twitter%20create/swarm-launch-video/fly-rap-studio/fly_rap_studio.html?capture=1';
const TMP = 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/.frames';
const VIDEO = 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/fly_rap_studio_silent.mp4';
const AUDIO = 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/fly_rap_studio.wav';
const OUT = process.env.OUT || 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/fly_rap_studio.mp4';
const FPS = 24;
const LOOP = 18;
const N = FPS * LOOP;

fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 });
fs.mkdirSync(TMP, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--headless=new', '--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars']
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
await page.goto(FILE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction('window.__ready === true && typeof window.__captureFrame === "function"', { timeout: 60000 });

for (let f = 0; f < N; f++) {
  const t = f / FPS;
  await page.evaluate(tt => window.__captureFrame(tt), t);
  await page.screenshot({ path: `${TMP}/f${String(f).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  if (f % 120 === 0) console.log('frame', f, '/', N);
}
await browser.close();

execFileSync(FF, [
  '-y',
  '-framerate', String(FPS),
  '-i', `${TMP}/f%04d.png`,
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-preset', 'slow',
  '-crf', '18',
  '-movflags', '+faststart',
  VIDEO
], { stdio: 'inherit' });

execFileSync(FF, [
  '-y',
  '-i', VIDEO,
  '-i', AUDIO,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '160k',
  '-shortest',
  '-movflags', '+faststart',
  OUT
], { stdio: 'inherit' });

console.log('wrote', OUT);
