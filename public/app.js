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

    const data = await res.json();

    if (res.ok) {
      resultEl.textContent = '✅ ACCESSO OK';
      resultEl.className = 'ok';

      const p = data.person;

      infoEl.innerHTML = `
        <div><b>${p.nome} ${p.cognome}</b></div>
        <div>📞 ${p.telefono || '—'}</div>
        <div>👤 Referente: ${p.referente || '—'}</div>
        <div class="badge ${p.incassato ? 'paid' : 'unpaid'}">
          ${p.incassato ? 'INCASSATO' : '⚠ DA PAGARE'}
        </div>
      `;

      loadStats();
    } else {
      resultEl.textContent = `❌ ${data.error}`;
      resultEl.className = 'error';
    }
  } catch (err) {
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