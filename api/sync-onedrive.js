// Vercel Serverless Function & API Proxy for OneDrive Sync
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const oneDriveUrl = req.query?.url || 
                      process.env.ONEDRIVE_EXCEL_URL || 
                      'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v';

  try {
    // 1. If a direct download URL is configured, attempt fetch
    if (oneDriveUrl && (oneDriveUrl.includes('download') || oneDriveUrl.includes('export') || oneDriveUrl.includes('sharepoint'))) {
      const response = await fetch(oneDriveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*'
        }
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        // Verify XLSX magic bytes (PK\x03\x04)
        const bytes = new Uint8Array(buffer.slice(0, 4));
        const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;

        if (isZip) {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('X-Data-Source', 'onedrive_live');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(200).send(Buffer.from(buffer));
        }
      }
    }

    // 2. Fallback: Return current master JSON dataset
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'masterDatabase.json');
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Data-Source', 'master_database_json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(jsonContent);
    }

    return res.status(404).json({ error: 'Master database file not found' });
  } catch (error) {
    console.error('[API Proxy] Error fetching dataset:', error);
    return res.status(500).json({ error: 'Failed to sync data', message: error.message });
  }
}
