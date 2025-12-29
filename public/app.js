const video = document.getElementById('video');
const resultEl = document.getElementById('result');
const infoEl = document.getElementById('info');

const totalEl = document.getElementById('total');
const checkedInEl = document.getElementById('checkedIn');
const remainingEl = document.getElementById('remaining');

let scanner;

async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  totalEl.textContent = data.total;
  checkedInEl.textContent = data.checkedIn;
  remainingEl.textContent = data.remaining;
}

function resetUI() {
  resultEl.textContent = '';
  resultEl.className = '';
  infoEl.innerHTML = '';
}

async function handleCode(code) {
  resetUI();

  try {
    const res = await fetch('/api/checkin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (data.error === 'INVALID') {
      resultEl.textContent = '❌ QR NON VALIDO';
      resultEl.className = 'error';
      return;
    }

    if (data.error === 'ALREADY_USED') {
      resultEl.textContent = '⚠️ GIÀ USATO';
      resultEl.className = 'error';
    } else {
      resultEl.textContent = '✅ ACCESSO OK';
      resultEl.className = 'ok';
    }

    const p = data.person;

    infoEl.innerHTML = `
      <div><b>${p.nome} ${p.cognome}</b></div>
      <div>📞 ${p.telefono || '—'}</div>
      <div>👤 Referente: ${p.referente || '—'}</div>
      <div>💰 Ritirato da: ${p.ritiratoDa || '—'}</div>
      <div>🎟 Ingressi: <b>${p.ingresso}</b></div>
      <div class="badge ${p.incassato ? 'paid' : 'unpaid'}">
        ${p.incassato ? 'INCASSATO' : '⚠ DA PAGARE'}
      </div>
    `;

    loadStats();

  } catch (err) {
    resultEl.textContent = '❌ ERRORE DI RETE';
    resultEl.className = 'error';
  }
}

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