const video = document.getElementById('video');
const resultEl = document.getElementById('result');
const infoEl = document.getElementById('info');

const totalEl = document.getElementById('total');
const checkedInEl = document.getElementById('checkedIn');
const remainingEl = document.getElementById('remaining');

let scanner;

/* -------------------------
   STATS
------------------------- */
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    totalEl.textContent = data.total;
    checkedInEl.textContent = data.checkedIn;
    remainingEl.textContent = data.remaining;
  } catch (err) {
    console.error('Errore stats', err);
  }
}

/* -------------------------
   RESET UI
------------------------- */
function resetUI() {
  resultEl.textContent = '';
  resultEl.className = '';
  infoEl.innerHTML = '';
}

/* -------------------------
   CHECK-IN
------------------------- */
async function handleCode(code) {
  resetUI();

  try {
    const res = await fetch('/api/checkin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('INVALID_JSON_RESPONSE');
    }

    // ❌ QR NON VALIDO
    if (!res.ok && data.error === 'INVALID') {
      resultEl.textContent = '❌ QR NON VALIDO';
      resultEl.className = 'error';
      return;
    }

    // ⚠️ GIÀ USATO (ma info disponibili)
    if (data.error === 'ALREADY_USED') {
      resultEl.textContent = '⚠️ GIÀ USATO';
      resultEl.className = 'error';
    }

    // ✅ ACCESSO OK
    if (data.ok) {
      resultEl.textContent = '✅ ACCESSO OK';
      resultEl.className = 'ok';
    }

    const p = data.person;

    infoEl.innerHTML = `
      <div><b>${p.nome} ${p.cognome}</b></div>
      <div>📞 ${p.telefono || '—'}</div>
      <div>👤 Referente: ${p.referente || '—'}</div>
      <div>🎟 Ingressi: <b>${p.ingresso}</b></div>
      <div class="badge ${p.incassato ? 'paid' : 'unpaid'}">
        ${p.incassato ? 'INCASSATO' : '⚠ DA PAGARE'}
      </div>
    `;

    loadStats();

  } catch (err) {
    console.error(err);
    resultEl.textContent = '❌ ERRORE DI RETE';
    resultEl.className = 'error';
  }
}

/* -------------------------
   QR SCANNER
------------------------- */
scanner = new QrScanner(
  video,
  res => {
    scanner.stop();
    handleCode(res.data);
    setTimeout(() => scanner.start(), 1500);
  },
  { highlightScanRegion: true }
);

scanner.start();
loadStats();