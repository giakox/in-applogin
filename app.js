
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));

const attendeesRouter = require('./routes/attendees');
const checkinRouter = require('./routes/checkin');
const statsRouter = require('./routes/stats');

//middleweare
app.use(express.json());
app.use('/api/attendees', attendeesRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/stats', statsRouter);


app.get('/', (req, res) => {
  res.send('Hello World')
});


module.exports = app;

