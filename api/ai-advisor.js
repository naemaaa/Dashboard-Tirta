// Groq Gen AI Policy Advisor Serverless API
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_SECONDARY
].filter(Boolean);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = {};
  if (req.method === 'POST') {
    body = req.body || {};
  } else if (req.query?.data) {
    try {
      body = JSON.parse(decodeURIComponent(req.query.data));
    } catch (e) {
      body = {};
    }
  }

  const {
    tabTitle = 'Ringkasan Utama',
    selectedKomoditas = 'Semua Komoditas',
    selectedWilayah = 'Semua Wilayah DIY',
    selectedPeriode = '2026-W38',
    selectedKlaster = 'Semua Responden',
    currentMetrics = {},
    deltas = {},
    pctLuarDiy = 0,
    topOrigin = 'Luar DIY Lainnya (Jateng/Jatim)',
    topDestination = 'Kab. Sleman',
    dominantUnit = 'Ton'
  } = body;

  const systemPrompt = `Anda adalah Senior Macroeconomic & Food Supply Policy Advisor di Bank Indonesia Kantor Perwakilan DIY dan Tim Pengendalian Inflasi Daerah (TPID) D.I. Yogyakarta.
Tugas Anda adalah menganalisis data neraca pangan dan tataniaga komoditas untuk memberikan 3 rekomendasi taktis dan kebijakan strategis yang lugas, profesional, berbasis data nyata, dan berorientasi pada stabilitas harga serta ketahanan pasokan pangan DIY.

OUTPUT WAJIB DALAM FORMAT JSON DENGAN STRUKTUR BERIKUT:
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

  const userPrompt = `Analisis Data Terkini:
- Halaman/Modul: ${tabTitle}
- Periode: ${selectedPeriode}
- Komoditas: ${selectedKomoditas}
- Wilayah: ${selectedWilayah}
- Tipe Responden: ${selectedKlaster}
- Volume Masuk: ${currentMetrics.volMasuk || 0} ${dominantUnit} (Delta: ${deltas.volMasukDelta || 0}%)
- Volume Keluar: ${currentMetrics.volKeluar || 0} ${dominantUnit} (Delta: ${deltas.volKeluarDelta || 0}%)
- Neraca Bersih: ${currentMetrics.neracaBersih || 0} ${dominantUnit} (${currentMetrics.statusNeraca || 'SEIMBANG'})
- Rerata Harga Beli: Rp ${Math.round(currentMetrics.avgHargaBeli || 0).toLocaleString('id-ID')}
- Rerata Harga Jual: Rp ${Math.round(currentMetrics.avgHargaJual || 0).toLocaleString('id-ID')}
- Spread Marjin: Rp ${Math.round(currentMetrics.marginRp || 0).toLocaleString('id-ID')} (${(currentMetrics.marginPct || 0).toFixed(1)}%)
- Ketergantungan Luar DIY: ${Math.round(pctLuarDiy)}% (Asal Dominan: ${topOrigin})
- Tujuan Dominan: ${topDestination}

Berikan sintesis kebijakan JSON sekarang:`;

  // Try calling Groq with available keys
  for (const key of GROQ_KEYS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const groqData = await response.json();
        const contentStr = groqData.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          if (parsed.insights && Array.isArray(parsed.insights)) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-AI-Engine', 'Groq-LPU-120B');
            return res.status(200).json(parsed);
          }
        }
      }
    } catch (err) {
      console.warn('[Groq API] Key failed or error:', err.message);
    }
  }

  // If Groq fails, return 500 so frontend falls back to parametric engine
  return res.status(500).json({ error: 'Groq API call failed' });
}
