const scannerView = document.getElementById('scannerView');
const doorlistView = document.getElementById('doorlistView');

const tabScanner = document.getElementById('tabScanner');
const tabDoorlist = document.getElementById('tabDoorlist');

const video = document.getElementById('video');
const resultEl = document.getElementById('result');
const infoEl = document.getElementById('info');

const totalEl = document.getElementById('total');
const checkedInEl = document.getElementById('checkedIn');
const remainingEl = document.getElementById('remaining');

const doorlistEl = document.getElementById('doorlist');
const searchInput = document.getElementById('search');

let scanner;
let doorlistData = [];

/* ---------------- NAV ---------------- */
function showScanner() {
  scannerView.classList.add('active');
  doorlistView.classList.remove('active');
  tabScanner.classList.add('active');
  tabDoorlist.classList.remove('active');
}

function showDoorlist() {
  scannerView.classList.remove('active');
  doorlistView.classList.add('active');
  tabScanner.classList.remove('active');
  tabDoorlist.classList.add('active');
  loadDoorlist();
}

tabScanner.onclick = showScanner;
tabDoorlist.onclick = showDoorlist;

/* ---------------- STATS ---------------- */
async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  totalEl.textContent = data.total;
  checkedInEl.textContent = data.checkedIn;
  remainingEl.textContent = data.remaining;
}

/* ---------------- CHECK-IN QR ---------------- */
async function handleCode(code) {
  resultEl.textContent = '';
  resultEl.className = '';
  infoEl.innerHTML = '';

  try {
    const res = await fetch('/api/checkin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    // ❌ QR NON VALIDO
    if (data.error === 'INVALID') {
      resultEl.textContent = '❌ QR NON VALIDO';
      resultEl.className = 'error';
      return;
    }

    // ⚠️ GIÀ USATO
    if (data.error === 'ALREADY_USED') {
      resultEl.textContent = '⚠️ GIÀ USATO';
      resultEl.className = 'error';
    }

    // ✅ SOLO SE ok === true
    if (data.ok === true) {
      resultEl.textContent = '✅ ACCESSO OK';
      resultEl.className = 'ok';
    }

    // 🔒 SICUREZZA: se non c’è person → non renderizzare
    if (!data.person) {
      console.warn('Risposta senza person', data);
      return;
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
    console.error('CHECKIN ERROR', err);
    resultEl.textContent = '❌ ERRORE DI RETE';
    resultEl.className = 'error';
  }
}

QrScanner.WORKER_PATH =
  'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';
/* ---------------- QR SCANNER ---------------- */
scanner = new QrScanner(
  video,
  result => {
    scanner.stop();

    const code =
      typeof result === 'string'
        ? result
        : result?.data || result?.data?.text || result?.text;

    if (!code) {
      console.warn('QR senza contenuto valido', result);
      scanner.start();
      return;
    }

    handleCode(code);
    setTimeout(() => scanner.start(), 1500);
  },
  { highlightScanRegion: true }
);

scanner.start();
loadStats();

/* ---------------- DOORLIST ---------------- */
async function loadDoorlist() {
  const res = await fetch('/api/doorlist');
  doorlistData = await res.json();
  renderDoorlist();
}

function renderDoorlist() {
  const q = searchInput.value.toLowerCase();
  doorlistEl.innerHTML = '';

  doorlistData
    .filter(item =>
      `${item.nome} ${item.cognome}`.toLowerCase().includes(q)
    )
    .forEach(item => {
      const row = document.createElement('div');
      row.className = 'door-item';

      const name = document.createElement('div');
      name.textContent = `${item.nome} ${item.cognome}`;

      const btn = document.createElement('button');
      btn.className = 'check-btn';
      if (item.used) btn.classList.add('used');

      btn.onclick = async () => {
        if (item.used) return;

        const res = await fetch(`/api/checkin/manual/${item.ticketId}`, {
          method: 'PATCH'
        });

        if (res.ok) {
          btn.classList.add('used');
          item.used = true;
          loadStats();
        }
      };

      row.appendChild(name);
      row.appendChild(btn);
      doorlistEl.appendChild(row);
    });
}

searchInput.oninput = renderDoorlist;