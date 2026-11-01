const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Launching Chrome with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const scratchDir = path.resolve('scratch');
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

  let downloadedFile = null;
  client.on('Browser.downloadWillBegin', (params) => {
    console.log('>>> DOWNLOAD WILL BEGIN:', params);
    downloadedFile = params.suggestedFilename;
  });
  client.on('Browser.downloadProgress', (params) => {
    console.log('>>> DOWNLOAD PROGRESS:', params.state, params.receivedBytes, '/', params.totalBytes);
  });

  const shareUrl = 'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v';
  console.log('Navigating to:', shareUrl);
  await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  // Find officeapps frame
  const excelFrame = page.frames().find(f => f.url().includes('officeapps.live.com'));
  if (!excelFrame) {
    console.error('No excel frame found');
    await browser.close();
    return;
  }
  console.log('Excel frame found! Waiting 5s for spreadsheet ribbon to settle...');
  await new Promise(r => setTimeout(r, 5000));

  // Click File menu in excelFrame
  console.log('Clicking File tab in Excel frame...');
  const fileClicked = await excelFrame.evaluate(() => {
    const el = document.querySelector('#FileMenuLauncher') || 
               document.querySelector('[id*="FileMenu"]') ||
               document.querySelector('#m_excelFileMenuLauncher') ||
               Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'File');
    if (el) {
      el.click();
      return { success: true, id: el.id, tag: el.tagName };
    }
    return { success: false };
  });
  console.log('File tab click result:', fileClicked);

  await new Promise(r => setTimeout(r, 2000));

  // Click Save As / Create a Copy
  console.log('Looking for Create a Copy / Save As / Download...');
  const menuResult = await excelFrame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const items = all.map(e => ({
      text: e.innerText ? e.innerText.trim() : '',
      id: e.id,
      className: e.className
    })).filter(x => /copy|download|export|save as|unduh/i.test(x.text));
    
    // Find "Create a Copy" or "Save As"
    const copyBtn = all.find(e => /create a copy|save as/i.test(e.innerText?.trim()));
    if (copyBtn) copyBtn.click();
    return { itemsCount: items.length, copyBtnFound: !!copyBtn };
  });
  console.log('Menu result:', menuResult);

  await new Promise(r => setTimeout(r, 2000));

  // Click Download a Copy
  console.log('Clicking Download a Copy...');
  const downloadClicked = await excelFrame.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const dlBtn = all.find(e => /download a copy|unduh salinan/i.test(e.innerText?.trim()));
    if (dlBtn) {
      dlBtn.click();
      return { success: true, text: dlBtn.innerText.trim() };
    }
    return { success: false };
  });
  console.log('Download a Copy click result:', downloadClicked);

  // Wait 10s for download to complete
  console.log('Waiting 10s for file download...');
  for (let i = 0; i < 10; i++) {
    const files = fs.readdirSync(scratchDir);
    const xlsx = files.filter(f => f.endsWith('.xlsx'));
    if (xlsx.length > 0) {
      console.log('FOUND DOWNLOADED XLSX:', xlsx);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  const finalFiles = fs.readdirSync(scratchDir);
  console.log('Files in scratch directory:', finalFiles);

  await browser.close();
}

main().catch(console.error);
