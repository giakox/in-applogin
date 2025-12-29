const video = document.getElementById('video');
const result = document.getElementById('result');

const totalEl = document.getElementById('total');
const checkedInEl = document.getElementById('checkedIn');
const remainingEl = document.getElementById('remaining');



let scanner;

// aggiorna stats
async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();

  totalEl.textContent = data.total;
  checkedInEl.textContent = data.checkedIn;
  remainingEl.textContent = data.remaining;
}

// check-in QR
async function handleCode(code) {
  try {
    const res = await fetch('/api/checkin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (res.ok) {
      result.textContent = '✅ OK';
      result.className = 'success';
      loadStats();
    } else {
      result.textContent = `❌ ${data.error}`;
      result.className = 'error';
    }
  } catch (err) {
    result.textContent = 'Errore di rete';
    result.className = 'error';
  }
}

// avvio scanner
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


