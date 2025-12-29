const fs = require("fs");
const path = require('path');



const INPUT_FILE = path.join(__dirname, '../data/input.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/people.json');

const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const lines = raw.split("\n").filter(Boolean);

const headers = lines[0].split(",");

function generaCodiceBiglietto() {
  return Math.random().toString(36).substring(2, 12);
}

const people = lines.slice(1).map((line, index) => {
  const values = line.split(",");

  const row = {};
  headers.forEach((h, i) => {
    row[h.trim()] = values[i]?.trim();
  });


  return {
    id: index + 1,
    nome: row["Nome"],
    cognome: row["Cognome"],
    email: row["Indirizzo email"],
    telefono: row["Numero di telefono"],
    inviti: Number(row["Persone portate (compreso te stesso)"]),
    referente: row["Referente"],
    incassato: row["Incassati"] === "TRUE",
    biglietti: Array.from(
    { length: Number(row["Persone portate (compreso te stesso)"]) },
    () => generaCodiceBiglietto())
  };
});

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(people, null, 2)
);

console.log(`Creato ${OUTPUT_FILE} con ${people.length} persone`);


//node ./scripts/converter.js