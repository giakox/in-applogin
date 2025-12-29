
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
app.use('/api/doorlist', require('./routes/doorlist'));
app.use('/api/checkin/manual', require('./routes/manualCheckin'));
app.use('/api/attendees', attendeesRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/stats', statsRouter);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


module.exports = app;

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}