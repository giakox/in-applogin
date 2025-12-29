const fs = require('fs');
const path = require('path');

const peopleFile = path.join(__dirname, '../data/people.json');
const tiketFile = path.join(__dirname, '../data/tickets.json');

const people = JSON.parse(fs.readFileSync(peopleFile, "utf-8"));

const tickets = [];
let id = 1;

for (let i = 0; i < people.length; i++) {
      for (let b = 0; b < people[i].biglietti.length; b++) {
        tickets.push(
          {
            id: id++,
            code: people[i].biglietti[b],
            personId: people[i].id,
            used: false,
            usedAt: null
          }
        ) 
      }
    } 




fs.writeFileSync(tiketFile,JSON.stringify(tickets, null, 2));


console.log(`ho creato ${tickets.length} tickets`);




