const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function main() {
  console.log('Connecting to browser to extract all sheets...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const shareUrl = 'https://onedrive.live.com/:x:/g/personal/91BFD97920EB749F/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?resid=91BFD97920EB749F!sb119379d0d9b405d93618845a23af38f&ithint=file%2cxlsx&e=f9b3qK&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy85MWJmZDk3OTIwZWI3NDlmL0lRQ2ROeG14bXcxZFFKTmhpRVdpT3ZPUEFVTU5Wdm1WYTVOYnRITFNuRTJMQW9BP2U9ZjliM3FL';
  await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 12000));

  const excelFrame = page.frames().find(f => f.url().includes('officeapps.live.com'));
  if (!excelFrame) {
    console.error('No excel frame found');
    await browser.close();
    return;
  }

  // Dump sheet tabs
  const sheets = await excelFrame.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(el => {
      return el.id && el.id.toLowerCase().includes('sheet') || (el.getAttribute('role') === 'tab' && el.parentElement && el.parentElement.id && el.parentElement.id.includes('Sheet'));
    }).map(el => ({ text: el.innerText, id: el.id, ariaLabel: el.getAttribute('aria-label') }));
  });

  console.log('Sheets found:', sheets);

  // In Excel Online, we can execute Copy (Ctrl+A, Ctrl+C) on each sheet to get the TSV data!
  const sheetNames = ['laporan_ringkasan', 'arus_masuk', 'arus_keluar', 'profil_PB', 'profil_Produsen', 'REF_Komoditas', 'REF_Wilayah', 'REF_Kalender'];
  const extractedData = {};

  for (const sname of sheetNames) {
    console.log(`\nSwitching to sheet: ${sname}...`);
    // Find sheet tab and click
    const clickedTab = await excelFrame.evaluate((name) => {
      const all = Array.from(document.querySelectorAll('*'));
      const tab = all.find(e => e.innerText && e.innerText.trim().toLowerCase() === name.toLowerCase());
      if (tab) {
        tab.click();
        return true;
      }
      return false;
    }, sname);

    console.log(`Tab ${sname} clicked:`, clickedTab);
    await new Promise(r => setTimeout(r, 4000));

    // Focus grid and select all
    await excelFrame.evaluate(() => {
      const grid = document.querySelector('[role="grid"]') || document.querySelector('#m_excelFormulaBar') || document.body;
      grid.focus();
    });

    // Press Ctrl+A / Cmd+A and Ctrl+C / Cmd+C
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Meta');
    await new Promise(r => setTimeout(r, 1000));

    // Also let's inspect grid cells rendered in DOM
    const cellRows = await excelFrame.evaluate(() => {
      // Look for table or grid elements
      const data = [];
      const trs = document.querySelectorAll('tr, div[role="row"]');
      trs.forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td, th, div[role="gridcell"], div[role="columnheader"]')).map(c => c.innerText.trim());
        if (cells.length > 0) data.push(cells);
      });
      return data;
    });

    console.log(`Sheet ${sname} rendered rows:`, cellRows.length);
    if (cellRows.length > 0) {
      extractedData[sname] = cellRows;
    }
  }

  fs.writeFileSync('extracted_online_sheets.json', JSON.stringify(extractedData, null, 2));
  console.log('Saved extracted_online_sheets.json');

  await browser.close();
}

main().catch(console.error);
