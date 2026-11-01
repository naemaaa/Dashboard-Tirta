import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCRATCH_DIR = path.resolve('scratch');
const PROFILE_DIR = '/tmp/chrome-cdp-test-profile-' + Date.now();

async function run() {
  console.log('Launching Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--remote-debugging-port=9222',
    `--user-data-dir=${PROFILE_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ], { stdio: 'ignore' });

  process.on('exit', () => {
    try { chrome.kill(); } catch (e) {}
  });

  // Wait for Chrome debugging port
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const json = await res.json();
        wsUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }

  if (!wsUrl) {
    console.error('Could not connect to Chrome debugging port');
    chrome.kill();
    return;
  }
  console.log('Connected to Chrome CDP:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const pending = new Map();
  const sessionHandlers = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
    if (data.method) {
      if (data.method === 'Browser.downloadWillBegin' || data.method === 'Page.downloadWillBegin') {
        console.log('>>> DOWNLOAD WILL BEGIN:', data.params);
      }
      if (data.method === 'Browser.downloadProgress' || data.method === 'Page.downloadProgress') {
        console.log('>>> DOWNLOAD PROGRESS:', data.params);
      }
    }
  };

  function send(method, params = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }

  // Set browser-level download behavior
  try {
    await send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: SCRATCH_DIR,
      eventsEnabled: true
    });
    console.log('Browser download behavior configured to:', SCRATCH_DIR);
  } catch (e) {
    console.warn('Browser.setDownloadBehavior warning:', e.message);
  }

  // Create page target
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('DOM.enable', {}, sessionId);

  try {
    await send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: SCRATCH_DIR
    }, sessionId);
  } catch (e) {}

  const targetUrl = 'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v';
  console.log('Navigating page to:', targetUrl);
  await send('Page.navigate', { url: targetUrl }, sessionId);

  // Wait 15 seconds for Excel Online to load
  console.log('Waiting 15 seconds for Office Online to load...');
  await new Promise(r => setTimeout(r, 15000));

  // Inspect frames in page
  const tree = await send('Page.getFrameTree', {}, sessionId);
  console.log('Root frame URL:', tree.frameTree.frame.url);
  const childFrames = tree.frameTree.childFrames || [];
  console.log('Child frames count:', childFrames.length);
  for (const cf of childFrames) {
    console.log('Child frame URL:', cf.frame.url);
  }

  // Let's find officeapps.live.com frame URL
  let officeUrl = null;
  for (const cf of childFrames) {
    if (cf.frame.url && cf.frame.url.includes('officeapps.live.com')) {
      officeUrl = cf.frame.url;
      break;
    }
  }

  if (officeUrl) {
    console.log('\nFound Office Online Frame URL:');
    console.log(officeUrl);
    const parsed = new URL(officeUrl);
    console.log('WopiSrc:', parsed.searchParams.get('WopiSrc'));
    console.log('access_token:', parsed.searchParams.get('access_token'));
  }

  // Try clicking File -> Download via Runtime.evaluate
  console.log('Attempting to trigger File -> Download...');
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (function() {
        // Try finding buttons or menu items
        const all = Array.from(document.querySelectorAll('*'));
        const fileBtn = all.find(el => el.innerText && el.innerText.trim() === 'File');
        return {
          title: document.title,
          fileBtnFound: !!fileBtn
        };
      })()
    `,
    returnByValue: true
  }, sessionId);
  console.log('Page eval result:', evalResult.result.value);

  // Keep alive for 5 seconds to see any downloads
  await new Promise(r => setTimeout(r, 5000));

  ws.close();
  chrome.kill();
  console.log('Done test');
}

run().catch(console.error);
