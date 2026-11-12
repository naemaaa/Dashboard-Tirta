const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const WORKBOOKS = {
  alps: {
    filename: 'Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx',
    url: process.env.VITE_ONEDRIVE_EWS_URL || 'https://1drv.ms/x/c/91bfd97920eb749f/IQAMDh9u-137Q7cGzN_Lr-Y6AQXyHpEbl1qAq2ow_4yne_k?e=M3kKsn'
  },
  hubungan: {
    filename: 'Dashboard Hubungan Harga dan Arus Perdagangan.xlsx',
    url: process.env.VITE_ONEDRIVE_HARGA_ARUS_URL || 'https://1drv.ms/x/c/91bfd97920eb749f/IQCyJrPPrgQnSoxn3iqtZcvYAZu6P0BlyGGmzpyx5rjIlu4?e=QRx7I9'
  }
};

async function downloadOneDriveFile(browser, scratchDir, target) {
  const targetPath = path.join(scratchDir, target.filename);
  if (fs.existsSync(targetPath)) {
    try { fs.unlinkSync(targetPath); } catch (e) {}
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const client = await page.target().createCDPSession();
  await client.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: scratchDir,
    eventsEnabled: true
  });
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: scratchDir
  });

  console.log('[EWS OneDrive Sync] Navigating to:', target.url);
  await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

  const excelFrame = page.frames().find(f => f.url().includes('officeapps.live.com'));
  if (!excelFrame) {
    console.error('[EWS OneDrive Sync] No excel frame found for:', target.filename);
    await page.close();
    return false;
  }
  await new Promise(r => setTimeout(r, 6000));

  await excelFrame.click('#FileMenuLauncherContainer');
  await new Promise(r => setTimeout(r, 1500));

  await excelFrame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.fui-MenuItem, [role="menuitem"]'));
    const el = items.find(i => i.innerText && /create a copy|buat salinan/i.test(i.innerText));
    if (el) {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      el.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  await excelFrame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.fui-MenuItem, [role="menuitem"]'));
    const el = items.find(i => i.innerText && /download a copy|unduh salinan/i.test(i.innerText));
    if (el) el.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  await excelFrame.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, .fui-Button, [role="button"]'));
    const dlBtn = btns.find(b => b.innerText && /^(download|unduh)$/i.test(b.innerText.trim()));
    if (dlBtn) dlBtn.click();
  });

  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(targetPath)) {
      console.log('[EWS OneDrive Sync] Downloaded:', targetPath);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  await page.close();
  return fs.existsSync(targetPath);
}

async function main() {
  const scratchDir = path.resolve(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const arg = process.argv[2] || 'all';
  const targets = arg === 'alps'
    ? [WORKBOOKS.alps]
    : arg === 'hubungan'
    ? [WORKBOOKS.hubungan]
    : [WORKBOOKS.alps, WORKBOOKS.hubungan];

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const t of targets) {
    await downloadOneDriveFile(browser, scratchDir, t);
  }

  await browser.close();
}

main().catch(err => {
  console.error('[EWS OneDrive Sync] Error:', err);
  process.exit(1);
});
