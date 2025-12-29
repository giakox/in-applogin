const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

const people = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/people.json'), 'utf-8')
);
const tickets = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/tickets.json'), 'utf-8')
);

// email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'giacomo.dotto05@gmail.com',
    pass: 'ydex rnkz ryam qaos'
  }
});

// assicurati cartella qr
const qrDir = path.join(__dirname, 'qrs');
if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);

async function main() {
  for (const person of people) {
    const personTickets = tickets.filter(
      t => t.personId === person.id
    );

    for (const ticket of personTickets) {
      const qrFile = path.join(qrDir, `ticket-${ticket.id}.png`);

      await QRCode.toFile(qrFile, ticket.code, {
        width: 300,
        margin: 2
      });

      await transporter.sendMail({
        from: '"Evento 🎉" <giacomo.dotto05@gmail.com>',
        to: person.email,
        subject: 'Il tuo biglietto QR',
        html: `
          <p>Ciao ${person.nome},</p>
          <p>Questo è uno dei tuoi biglietti.</p>
          <p>Mostra il QR all’ingresso.</p>
        `,
        attachments: [
          {
            filename: 'biglietto.png',
            path: qrFile
          }
        ]
      });

      console.log(`Inviato ticket ${ticket.code} a ${person.email}`);
    }
  }
}

main();