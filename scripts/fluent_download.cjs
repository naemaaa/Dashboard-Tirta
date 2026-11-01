const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function main() {
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

  client.on('Browser.downloadWillBegin', (params) => {
    console.log('>>> Browser.downloadWillBegin:', params);
  });
  client.on('Page.downloadWillBegin', (params) => {
    console.log('>>> Page.downloadWillBegin:', params);
  });

  const shareUrl = 'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v';
  console.log('Navigating to:', shareUrl);
  await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  const excelFrame = page.frames().find(f => f.url().includes('officeapps.live.com'));
  if (!excelFrame) {
    console.error('No excel frame found');
    await browser.close();
    return;
  }
  await new Promise(r => setTimeout(r, 6000));

  console.log('Clicking File...');
  await excelFrame.click('#FileMenuLauncherContainer');
  await new Promise(r => setTimeout(r, 1500));

  console.log('Looking for Create a Copy in .fui-MenuItem...');
  const copyClicked = await excelFrame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.fui-MenuItem, [role="menuitem"]'));
    const target = items.find(el => el.innerText && el.innerText.includes('Create a Copy'));
    if (target) {
      target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      target.click();
      return { success: true, text: target.innerText };
    }
    return { success: false, itemsFound: items.map(i => i.innerText.trim()) };
  });
  console.log('Create a Copy result:', copyClicked);

  await new Promise(r => setTimeout(r, 1500));

  console.log('Looking for Download a Copy in .fui-MenuItem...');
  const dlClicked = await excelFrame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.fui-MenuItem, [role="menuitem"]'));
    const target = items.find(el => el.innerText && el.innerText.includes('Download a Copy'));
    if (target) {
      target.click();
      return { success: true, text: target.innerText };
    }
    return { success: false, itemsFound: items.map(i => i.innerText.trim()) };
  });
  console.log('Download a Copy result:', dlClicked);

  await new Promise(r => setTimeout(r, 2000));

  // Check if a dialog or button appeared (e.g., "Download" confirmation button in popup)
  const dialogResult = await excelFrame.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, .fui-Button, [role="button"]'));
    const dlBtn = btns.find(b => b.innerText && b.innerText.trim().toLowerCase() === 'download');
    if (dlBtn) {
      dlBtn.click();
      return { dialogFound: true, btnText: dlBtn.innerText.trim() };
    }
    return { dialogFound: false, allBtns: btns.map(b => b.innerText?.trim()).filter(Boolean) };
  });
  console.log('Dialog check:', dialogResult);

  console.log('Waiting 10s for download event...');
  for (let i = 0; i < 10; i++) {
    const files = fs.readdirSync(scratchDir);
    const xlsx = files.filter(f => f.endsWith('.xlsx'));
    if (xlsx.length > 0) {
      console.log('SUCCESS! Found downloaded xlsx:', xlsx);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  const finalFiles = fs.readdirSync(scratchDir);
  console.log('Files in scratch directory:', finalFiles);

  await browser.close();
}

main().catch(console.error);
