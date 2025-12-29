require('dotenv').config();
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const supabase = require('../lib/supabase');

/* ----------------------------------
   CONFIG
---------------------------------- */
const DELAY_MS = 3000; // ⏱ 3 secondi tra una PERSONA e l’altra

/* ----------------------------------
   UTILS
---------------------------------- */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ----------------------------------
   MAIL TRANSPORT
---------------------------------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // app password
  }
});

/* ----------------------------------
   MAIN
---------------------------------- */
async function main() {
  console.log('📨 Avvio invio email (1 mail per persona)...\n');

  // 1️⃣ prendiamo persone
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*');

  if (peopleError) {
    console.error('Errore people:', peopleError);
    return;
  }

  // 2️⃣ prendiamo tutti i biglietti
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*');

  if (ticketsError) {
    console.error('Errore tickets:', ticketsError);
    return;
  }

  let sent = 0;

  // 3️⃣ loop persone
  for (const person of people) {
    const personTickets = tickets.filter(
      t => t.person_id === person.id
    );

    if (!person.email || personTickets.length === 0) {
      console.log(`⏭ Skip ${person.nome} (no email o biglietti)`);
      continue;
    }

    try {
      console.log(`➡️ Invio a ${person.email} (${personTickets.length} QR)`);

      // 4️⃣ genera tutti i QR
      let qrHtml = '';

      for (let i = 0; i < personTickets.length; i++) {
        const ticket = personTickets[i];
        const qrDataUrl = await QRCode.toDataURL(ticket.code, {
          width: 260,
          margin: 2
        });

        qrHtml += `
          <div style="margin-bottom:20px;text-align:center">
            <p><b>Biglietto ${i + 1} / ${personTickets.length}</b></p>
            <img src="${qrDataUrl}" />
          </div>
        `;
      }

      // 5️⃣ invio UNA mail
      await transporter.sendMail({
        from: `"Evento 🎉" <${process.env.EMAIL_USER}>`,
        to: person.email,
        subject: '🎟 I tuoi biglietti QR per l’evento',
        html: `
          <p>Ciao <b>${person.nome}</b>,</p>

          <p>
            Qui trovi <b>${personTickets.length}</b> biglietto/i
            per l’evento.
          </p>

          <p>
            Mostra <b>uno dei QR</b> all’ingresso per ogni persona.
          </p>

          ${qrHtml}

          <p>A presto 👋</p>
        `
      });

      sent++;
      console.log(`✅ Inviata (${sent})`);

      // 6️⃣ delay anti-blocco
      await sleep(DELAY_MS);

    } catch (err) {
      console.error(
        `❌ Errore invio a ${person.email}`,
        err.message
      );

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n🎉 Invio completato. Email inviate: ${sent}`);
}

main();