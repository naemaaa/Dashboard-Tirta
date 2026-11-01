const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const shareUrl = 'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v';
  await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  const excelFrame = page.frames().find(f => f.url().includes('officeapps.live.com'));
  if (!excelFrame) {
    console.error('No excel frame found');
    await browser.close();
    return;
  }

  await new Promise(r => setTimeout(r, 6000));

  const info = await excelFrame.evaluate(() => {
    // Check globals
    const keys = Object.keys(window).filter(k => /wopi|download|file|app|excel|doc/i.test(k));
    
    // Look for script tags or config objects
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerText).filter(t => t.includes('Download') || t.includes('Wopi') || t.includes('FileGetUrl'));
    
    return {
      keys,
      scriptsSnippets: scripts.map(s => s.slice(0, 300))
    };
  });

  console.log('Frame globals:', info.keys);
  console.log('Scripts found:', info.scriptsSnippets.length);
  for (const s of info.scriptsSnippets) {
    console.log('--- Script snippet ---');
    console.log(s);
  }

  // Also let's inspect the File menu DOM structure when clicked
  await excelFrame.click('#FileMenuLauncherContainer');
  await new Promise(r => setTimeout(r, 1000));

  const menuDom = await excelFrame.evaluate(() => {
    const popups = Array.from(document.querySelectorAll('[role="menu"], [role="menubar"], [class*="Menu"], [class*="popup"], [class*="flyout"]'));
    return popups.map(p => ({
      tag: p.tagName,
      role: p.getAttribute('role'),
      className: p.className,
      text: p.innerText
    }));
  });
  console.log('Menu DOM popups:', menuDom);

  await browser.close();
}

main().catch(console.error);
