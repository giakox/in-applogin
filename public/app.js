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
  infoEl.innerHTML = '';

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
    <b>${p.nome} ${p.cognome}</b><br/>
    📞 ${p.telefono || '—'}<br/>
    👤 Referente: ${p.referente || '—'}<br/>
    💰 Ritirato da: ${p.ritiratoDa || '—'}<br/>
    🎟 Ingressi: <b>${p.ingresso}</b>
  `;

  loadStats();
}

QrScanner.WORKER_PATH =
  'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';
/* ---------------- QR SCANNER ---------------- */
scanner = new QrScanner(video, res => {
  scanner.stop();
  handleCode(res.data);
  setTimeout(() => scanner.start(), 1500);
});

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