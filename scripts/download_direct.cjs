const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function downloadFile() {
  console.log('Launching browser to download file...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  const targetUrl = 'https://onedrive.live.com/:x:/g/personal/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?download=1';
  console.log('Navigating to download URL:', targetUrl);

  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(e => {
    console.log('Wait for download event timed out or failed:', e.message);
    return null;
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.log('Navigation message:', err.message);
  }

  const download = await downloadPromise;
  if (download) {
    const suggestedFilename = download.suggestedFilename();
    console.log('Download received! Suggested filename:', suggestedFilename);
    const savePath = path.join(__dirname, '..', 'src', 'data', suggestedFilename || 'Master Database.xlsx');
    await download.saveAs(savePath);
    console.log('Successfully saved file to:', savePath);
    const stats = fs.statSync(savePath);
    console.log('File size bytes:', stats.size);
  } else {
    console.log('No direct download event caught via URL.');
  }

  await browser.close();
}

downloadFile().catch(console.error);
