const video = document.getElementById('video');
const result = document.getElementById('result');
const info = document.getElementById('info');

async function handleCode(code) {
  const res = await fetch('/api/checkin', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await res.json();

  if (res.ok) {
    result.textContent = '✅ OK';
    info.innerHTML = `
      <p><b>${data.person.nome} ${data.person.cognome}</b></p>
      <p>${data.person.telefono}</p>
      <p>Referente: ${data.person.referente}</p>
      <p style="color:${data.person.incassato ? 'green' : 'red'}">
        ${data.person.incassato ? 'INCASSATO' : 'DA PAGARE'}
      </p>
    `;
    setTimeout(() => info.innerHTML = '', 3000);
  } else {
    result.textContent = '❌ ' + data.error;
  }
}

const scanner = new QrScanner(video, res => {
  scanner.stop();
  handleCode(res.data);
  setTimeout(() => scanner.start(), 1500);
});

scanner.start();