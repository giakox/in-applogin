require('dotenv').config();
const fs = require('fs');
const supabase = require('../lib/supabase');
const path = require('path');

function generaCodiceBiglietto() {
  return Math.random().toString(36).substring(2, 12);
}



const INPUT_FILE = path.join(__dirname, '../data/input.csv');
const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = raw.split('\n').filter(Boolean);
const headers = lines[0].split(',');

async function main() {
  let ticketId = 1;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => (row[h.trim()] = values[idx]?.trim()));

    const person = {
      id: i,
      nome: row['Nome'],
      cognome: row['Cognome'],
      email: row['Indirizzo email'],
      telefono: row['Numero di telefono'],
      referente: row['Referente'],
      incassato: row['Incassati'] === 'TRUE',
      inviti: Number(row['Persone portate (compreso te stesso)'])
    };

    await supabase.from('people').insert(person);

    const tickets = Array.from({ length: person.inviti }).map(() => ({
      id: ticketId++,
      code: generaCodiceBiglietto(),
      person_id: person.id,
      used: false
    }));

    await supabase.from('tickets').insert(tickets);
  }

  console.log('Import CSV completato');
}

main();