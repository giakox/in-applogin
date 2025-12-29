require('dotenv').config();
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const supabase = require('../lib/supabase');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function main() {
  const { data: people } = await supabase.from('people').select('*');
  const { data: tickets } = await supabase.from('tickets').select('*');

  for (const person of people) {
    const personTickets = tickets.filter(t => t.person_id === person.id);

    for (const ticket of personTickets) {
      const qr = await QRCode.toDataURL(ticket.code);

      await transporter.sendMail({
        from: '"Evento 🎉"',
        to: person.email,
        subject: 'Il tuo biglietto QR',
        html: `
          <p>Ciao ${person.nome},</p>
          <p>Mostra questo QR all’ingresso.</p>
          <img src="${qr}" />
        `
      });
    }
  }

  console.log('Email inviate');
}

main();