import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom dev middleware for /api/sync-onedrive
function oneDriveApiPlugin() {
  return {
    name: 'onedrive-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/sync-onedrive')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('X-Data-Source', 'master_database_dev_proxy')
          res.setHeader('Cache-Control', 'no-cache')
          try {
            const jsonPath = path.resolve(__dirname, 'public/data/masterDatabase.json')
            if (fs.existsSync(jsonPath)) {
              const data = fs.readFileSync(jsonPath, 'utf-8')
              res.statusCode = 200
              return res.end(data)
            }
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Master database not found' }))
          } catch (err) {
            res.statusCode = 500
            return res.end(JSON.stringify({ error: err.message }))
          }
        }
        next()
      })
    }
  }
}

// Helper to reliably retrieve Groq API keys from process.env or .env file
function getGroqKeys() {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_SECONDARY,
    process.env.VITE_GROQ_API_KEY,
  ];

  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('GROQ_API_KEY=') || trimmed.startsWith('GROQ_API_KEY_SECONDARY=') || trimmed.startsWith('VITE_GROQ_API_KEY=')) {
          const parts = trimmed.split('=');
          parts.shift();
          const val = parts.join('=').trim();
          if (val) keys.push(val);
        }
      });
    }
  } catch (e) {}

  return [...new Set(keys.filter(Boolean).map(k => k.trim()))];
}

// Custom dev middleware for /api/ai-advisor
function aiAdvisorPlugin() {
  return {
    name: 'ai-advisor-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/ai-advisor')) {
          try {
            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              if (rawBody) body = JSON.parse(rawBody);
            }

            const GROQ_KEYS = getGroqKeys();
            const GROQ_MODELS = [
              'llama-3.3-70b-versatile',
              'llama-3.1-8b-instant',
              'mixtral-8x7b-32768'
            ];

            const systemPrompt = `Anda adalah Senior Macroeconomic & Food Supply Policy Advisor di Bank Indonesia Kantor Perwakilan DIY dan Tim Pengendalian Inflasi Daerah (TPID) D.I. Yogyakarta.
Berikan 3 rekomendasi kebijakan taktis dan strategis berbasis data nyata.
OUTPUT WAJIB JSON DENGAN STRUKTUR:
{
  "insights": [
    {
      "id": "insight-1",
      "category": "KESEIMBANGAN PASOKAN & LOGISTIK",
      "status": "Surplus Pasokan / Defisit Kritis / Seimbang",
      "badgeColor": "green / red / amber",
      "content": "Analisis neraca masuk vs keluar dan rekomendasi aksi logistik 2-3 kalimat ringkas.",
      "timestamp": "Groq LPU Synthesis"
    },
    {
      "id": "insight-2",
      "category": "KETERGANTUNGAN EKSTERNAL & KAD",
      "status": "Ketergantungan Kritis / Ketergantungan Sedang / Mandiri Lokal",
      "badgeColor": "green / red / amber",
      "content": "Analisis asal pasokan dan rekomendasi Kerjasama Antar Daerah (KAD) 2-3 kalimat ringkas.",
      "timestamp": "TPID Policy Matrix"
    },
    {
      "id": "insight-3",
      "category": "STABILITAS HARGA & MARJIN TPID",
      "status": "Marjin Sehat / Marjin Tertekan / Waspada Disparitas",
      "badgeColor": "green / red / amber",
      "content": "Analisis transmisi harga jual vs beli, marjin, serta mitigasi inflasi 2-3 kalimat ringkas.",
      "timestamp": "Early Warning System"
    }
  ]
}`;

            const userPrompt = `Data Dashboard Terkini:
- Modul: ${body.tabTitle || 'Ringkasan Utama'}
- Komoditas: ${body.selectedKomoditas || 'Semua'}
- Wilayah: ${body.selectedWilayah || 'Semua Wilayah DIY'}
- Periode: ${body.selectedPeriode || '2026-W38'}
- Volume Masuk: ${body.currentMetrics?.volMasuk || 0} ${body.dominantUnit || 'Ton'}
- Volume Keluar: ${body.currentMetrics?.volKeluar || 0} ${body.dominantUnit || 'Ton'}
- Neraca Bersih: ${body.currentMetrics?.neracaBersih || 0} ${body.dominantUnit || 'Ton'} (${body.currentMetrics?.statusNeraca || 'SEIMBANG'})
- Harga Beli: Rp ${Math.round(body.currentMetrics?.avgHargaBeli || 0).toLocaleString('id-ID')}
- Harga Jual: Rp ${Math.round(body.currentMetrics?.avgHargaJual || 0).toLocaleString('id-ID')}
- Marjin: Rp ${Math.round(body.currentMetrics?.marginRp || 0).toLocaleString('id-ID')} (${(body.currentMetrics?.marginPct || 0).toFixed(1)}%)
- Ketergantungan Luar DIY: ${Math.round(body.pctLuarDiy || 0)}%

Berikan output JSON kebijakan sekarang:`;

            for (const key of GROQ_KEYS) {
              for (const model of GROQ_MODELS) {
                try {
                  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${key}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      model,
                      messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                      ],
                      response_format: { type: 'json_object' },
                      temperature: 0.3,
                      max_tokens: 800
                    })
                  });

                  if (groqRes.ok) {
                    const groqJson = await groqRes.json();
                    const contentStr = groqJson.choices?.[0]?.message?.content;
                    if (contentStr) {
                      res.setHeader('Content-Type', 'application/json');
                      res.setHeader('X-AI-Engine', `Groq-${model}`);
                      res.statusCode = 200;
                      return res.end(contentStr);
                    }
                  } else {
                    const errText = await groqRes.text();
                    console.warn(`[Groq Dev Middleware] Key/Model (${model}) error ${groqRes.status}:`, errText);
                  }
                } catch (e) {
                  console.warn(`[Groq Dev Middleware] Fetch error with model ${model}:`, e.message);
                }
              }
            }

            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Groq failed' }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    oneDriveApiPlugin(),
    aiAdvisorPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
