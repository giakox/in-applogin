const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      used,
      people (
        nome,
        cognome
      )
    `)
    .order('id');

  if (error) {
    return res.status(500).json({ error: 'LOAD_FAILED' });
  }

  res.json(data.map(t => ({
    ticketId: t.id,
    used: t.used,
    nome: t.people.nome,
    cognome: t.people.cognome
  })));
});

module.exports = router;